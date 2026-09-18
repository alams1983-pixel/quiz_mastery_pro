import express from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  createBunnyVideo,
  getBunnyTusUploadAuth,
  generateSignedHlsUrl,
  getBunnyVideoStatus,
  deleteBunnyVideo,
  getInstituteBunnyConfig,
} from '../utils/bunnyHelper.js';

const router = express.Router();

/**
 * Helper: Resolve student's approved batch IDs
 */
async function getStudentApprovedBatchIds(userId) {
  const [rows] = await pool.query(
    `SELECT batch_id FROM student_batches WHERE user_id = ? AND status = 'approved'`,
    [userId]
  );
  return rows.map((r) => r.batch_id);
}

/**
 * 1. POST /api/videos/create-upload
 * Creates a video entry in Bunny.net Stream & returns direct Tus resumable upload credentials
 */
router.post('/create-upload', requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      title,
      subject,
      chapter,
      description,
      isAllBatches = false,
      batchIds = [],
    } = req.body;

    const instituteId = req.user.institute_id || 1;
    const createdBy = req.user.id;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    // Resolve coaching institute's dedicated Bunny config or fallback to master
    const instituteConfig = await getInstituteBunnyConfig(instituteId);

    // Create video placeholder in Bunny.net Stream
    const { videoId, isMock } = await createBunnyVideo({ title, config: instituteConfig });

    // Generate Tus upload credentials
    const tusAuth = getBunnyTusUploadAuth(videoId, 86400, instituteConfig);

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO video_lectures 
        (institute_id, created_by, title, subject, chapter, description, bunny_video_id, status, is_all_batches)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'uploading', ?)`,
      [
        instituteId,
        createdBy,
        title,
        subject,
        chapter || null,
        description || null,
        videoId,
        isAllBatches ? 1 : 0,
      ]
    );

    const lectureId = result.insertId;

    // Map to specific batches
    if (!isAllBatches && Array.isArray(batchIds) && batchIds.length > 0) {
      const batchValues = batchIds.map((bId) => [lectureId, bId]);
      await conn.query(
        `INSERT IGNORE INTO video_lecture_batches (video_id, batch_id) VALUES ?`,
        [batchValues]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Video upload initiated',
      lectureId,
      videoId,
      tusAuth,
      isMock,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[VIDEOS] Failed to initiate video upload:', err);
    res.status(500).json({ error: 'Failed to initiate video upload' });
  } finally {
    conn.release();
  }
});

/**
 * 2. POST /api/videos/confirm-upload
 * Call after frontend completes Tus upload to check status or trigger processing
 */
router.post('/:id/confirm-upload', requireAdmin, async (req, res) => {
  try {
    const lectureId = req.params.id;
    const instituteId = req.user.institute_id || 1;

    const [rows] = await pool.query(
      `SELECT bunny_video_id FROM video_lectures WHERE id = ? AND institute_id = ?`,
      [lectureId, instituteId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video lecture not found' });
    }

    const { bunny_video_id } = rows[0];
    const instituteConfig = await getInstituteBunnyConfig(instituteId);
    const statusData = await getBunnyVideoStatus(bunny_video_id, instituteConfig);

    const newStatus = statusData.isReady ? 'ready' : 'processing';
    await pool.query(
      `UPDATE video_lectures SET status = ?, duration_seconds = ? WHERE id = ?`,
      [newStatus, statusData.duration, lectureId]
    );

    res.json({
      message: 'Video upload status updated',
      status: newStatus,
      duration: statusData.duration,
    });
  } catch (err) {
    console.error('[VIDEOS] Failed to confirm upload:', err);
    res.status(500).json({ error: 'Failed to update video status' });
  }
});

/**
 * 3. POST /api/videos/webhook
 * Bunny.net Stream Webhook Receiver for automatic transcoding notification
 */
router.post('/webhook', async (req, res) => {
  try {
    const { VideoGuid, Status } = req.body || {};

    if (VideoGuid) {
      // Bunny Status 4 = Finished (Ready)
      const isReady = Status === 4;
      const statusStr = isReady ? 'ready' : (Status === 5 ? 'failed' : 'processing');

      await pool.query(
        `UPDATE video_lectures SET status = ? WHERE bunny_video_id = ?`,
        [statusStr, VideoGuid]
      );
      console.log(`[BUNNY WEBHOOK] Video ${VideoGuid} status updated to ${statusStr}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[BUNNY WEBHOOK] Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * 4. GET /api/videos
 * List video lectures with batch-wise access control and watch progress
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const instituteId = user.institute_id || 1;
    const isAdmin = ['institute_admin', 'super_admin', 'admin'].includes(user.role);
    const { subject, batchId, search } = req.query;

    let query = `
      SELECT vl.*, 
        GROUP_CONCAT(b.name SEPARATOR ', ') AS assigned_batches,
        GROUP_CONCAT(b.id) AS assigned_batch_ids,
        vwh.last_position_seconds,
        vwh.total_watched_seconds,
        vwh.is_completed,
        MAX(lc.id) AS live_class_origin_id
      FROM video_lectures vl
      LEFT JOIN video_lecture_batches vlb ON vl.id = vlb.video_id
      LEFT JOIN batches b ON vlb.batch_id = b.id
      LEFT JOIN video_watch_history vwh ON vl.id = vwh.video_id AND vwh.user_id = ?
      LEFT JOIN live_classes lc ON lc.replay_video_id = vl.id
      WHERE vl.institute_id = ?
    `;
    const params = [user.id, instituteId];

    if (!isAdmin) {
      // Student: only items that are is_all_batches OR where student is approved in mapped batch
      const approvedBatchIds = await getStudentApprovedBatchIds(user.id);
      if (approvedBatchIds.length === 0) {
        query += ` AND vl.is_all_batches = 1`;
      } else {
        query += ` AND (vl.is_all_batches = 1 OR vlb.batch_id IN (?))`;
        params.push(approvedBatchIds);
      }
    } else if (batchId) {
      query += ` AND (vl.is_all_batches = 1 OR vlb.batch_id = ?)`;
      params.push(batchId);
    }

    if (subject) {
      query += ` AND vl.subject = ?`;
      params.push(subject);
    }
    if (search) {
      query += ` AND (vl.title LIKE ? OR vl.chapter LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY vl.id ORDER BY vl.order_index ASC, vl.created_at DESC`;

    const [rows] = await pool.query(query, params);

    const videos = rows.map((r) => ({
      ...r,
      is_all_batches: Boolean(r.is_all_batches),
      is_completed: Boolean(r.is_completed),
      assigned_batch_ids: r.assigned_batch_ids
        ? r.assigned_batch_ids.split(',').map((id) => parseInt(id, 10))
        : [],
    }));

    res.json({ videos });
  } catch (err) {
    console.error('[VIDEOS] Failed to fetch videos:', err);
    res.status(500).json({ error: 'Failed to fetch video lectures' });
  }
});

/**
 * 5. GET /api/videos/:id/playback
 * Authorize student and generate signed HLS URL with anti-piracy watermark
 */
router.get('/:id/playback', requireAuth, async (req, res) => {
  try {
    const lectureId = req.params.id;
    const user = req.user;
    const instituteId = user.institute_id || 1;
    const isAdmin = ['institute_admin', 'super_admin', 'admin'].includes(user.role);

    const [videos] = await pool.query(
      `SELECT vl.*, GROUP_CONCAT(vlb.batch_id) AS batch_ids,
        vwh.last_position_seconds, vwh.is_completed,
        MAX(lc.id) AS live_class_origin_id
       FROM video_lectures vl
       LEFT JOIN video_lecture_batches vlb ON vl.id = vlb.video_id
       LEFT JOIN video_watch_history vwh ON vl.id = vwh.video_id AND vwh.user_id = ?
       LEFT JOIN live_classes lc ON lc.replay_video_id = vl.id
       WHERE vl.id = ? AND vl.institute_id = ?
       GROUP BY vl.id`,
      [user.id, lectureId, instituteId]
    );

    if (videos.length === 0) {
      return res.status(404).json({ error: 'Video lecture not found' });
    }

    const video = videos[0];

    // Batch authorization check
    if (!isAdmin && !video.is_all_batches) {
      const allowedBatchIds = video.batch_ids
        ? video.batch_ids.split(',').map((id) => parseInt(id, 10))
        : [];
      const studentBatchIds = await getStudentApprovedBatchIds(user.id);
      const hasAccess = studentBatchIds.some((id) => allowedBatchIds.includes(id));

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied. You are not enrolled in the batch for this lecture.' });
      }
    }

    if (video.status === 'no_broadcast') {
      return res.status(404).json({
        error: 'No video was broadcasted during this live class session.',
        noBroadcast: true,
      });
    }

    if (video.status === 'processing' || video.status === 'uploading') {
      return res.status(409).json({
        error: 'This video lecture is currently being processed by Bunny.net. Please check back shortly.',
        isProcessing: true,
      });
    }

    // Resolve dedicated institute video library config or master fallback
    const instituteConfig = await getInstituteBunnyConfig(video.institute_id || instituteId);

    // Generate signed HLS stream URL (2 hour validity) for standard VOD replay
    const playbackUrl = generateSignedHlsUrl({
      videoId: video.bunny_video_id,
      expiresInSeconds: 7200,
      isLive: false,
      config: instituteConfig,
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    res.json({
      playbackUrl,
      title: video.title,
      subject: video.subject,
      chapter: video.chapter,
      durationSeconds: video.duration_seconds,
      resumePositionSeconds: video.last_position_seconds || 0,
      isCompleted: Boolean(video.is_completed),
      // Dynamic moving watermark payload for player canvas
      watermark: {
        text: `${user.full_name || 'Student'} • ${user.email || 'N/A'}`,
        subText: `Roll: ${user.id} • IP: ${clientIp.toString().split(',')[0]}`,
      },
    });
  } catch (err) {
    console.error('[VIDEOS] Failed to generate playback token:', err);
    res.status(500).json({ error: 'Failed to access video stream' });
  }
});

/**
 * 6. POST /api/videos/:id/progress
 * Update student video watch progress
 */
router.post('/:id/progress', requireAuth, async (req, res) => {
  try {
    const lectureId = req.params.id;
    const userId = req.user.id;
    const { positionSeconds = 0, durationSeconds = 0 } = req.body;

    const isCompleted = durationSeconds > 0 && positionSeconds >= durationSeconds * 0.9;

    await pool.query(
      `INSERT INTO video_watch_history 
        (user_id, video_id, last_position_seconds, total_watched_seconds, is_completed)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        last_position_seconds = VALUES(last_position_seconds),
        total_watched_seconds = total_watched_seconds + 5,
        is_completed = IF(is_completed = 1, 1, VALUES(is_completed))`,
      [userId, lectureId, Math.floor(positionSeconds), Math.floor(positionSeconds), isCompleted ? 1 : 0]
    );

    res.json({ saved: true, isCompleted });
  } catch (err) {
    console.error('[VIDEOS] Failed to save video progress:', err);
    res.status(500).json({ error: 'Failed to update watch progress' });
  }
});

/**
 * 7. DELETE /api/videos/:id
 * Delete video from Bunny.net library and MySQL
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const lectureId = req.params.id;
    const instituteId = req.user.institute_id || 1;

    const [rows] = await pool.query(
      `SELECT bunny_video_id FROM video_lectures WHERE id = ? AND institute_id = ?`,
      [lectureId, instituteId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video lecture not found' });
    }

    const { bunny_video_id } = rows[0];

    // Delete from Bunny.net using coaching's library config
    try {
      const instituteConfig = await getInstituteBunnyConfig(instituteId);
      await deleteBunnyVideo(bunny_video_id, instituteConfig);
    } catch (bErr) {
      console.warn('[VIDEOS] Bunny delete warning:', bErr.message);
    }

    // Delete from DB (cascades to video_lecture_batches & video_watch_history)
    await pool.query(`DELETE FROM video_lectures WHERE id = ?`, [lectureId]);

    res.json({ message: 'Video lecture deleted successfully' });
  } catch (err) {
    console.error('[VIDEOS] Failed to delete video lecture:', err);
    res.status(500).json({ error: 'Failed to delete video lecture' });
  }
});

export default router;
