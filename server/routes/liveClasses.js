import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { createBunnyVideo, getInstituteBunnyConfig } from '../utils/bunnyHelper.js';
import { getIO } from '../services/liveSocket.js';

const recordingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max recording file
});

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
 * 1. POST /api/live-classes
 * Schedule a new Live Class (ready for SRS live streaming)
 */
router.post('/', requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      title,
      subject,
      description,
      scheduledStartTime,
      scheduledEndTime,
      isAllBatches = false,
      batchIds = [],
    } = req.body;

    const instituteId = req.user.institute_id || 1;
    const instructorId = req.user.id;

    if (!title || !subject || !scheduledStartTime || !scheduledEndTime) {
      return res.status(400).json({ error: 'Title, subject, and scheduled times are required' });
    }

    // Generate local stream credentials ready for SRS live streaming ingest & playback
    const streamId = `stream_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const streamKey = `live_${crypto.randomBytes(12).toString('hex')}`;
    const rtmpUrl = process.env.LIVE_STREAM_RTMP_URL || 'rtmp://localhost/live';
    const hlsBase = process.env.LIVE_STREAM_HLS_URL || 'http://localhost:8080/live';
    const playbackUrl = `${hlsBase.replace(/\/+$/, '')}/${streamId}.m3u8`;

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO live_classes 
        (institute_id, instructor_id, title, description, subject, scheduled_start_time, scheduled_end_time, status, stream_id, stream_key, rtmp_url, hls_playback_url, is_all_batches)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?)`,
      [
        instituteId,
        instructorId,
        title,
        description || null,
        subject,
        new Date(scheduledStartTime),
        new Date(scheduledEndTime),
        streamId,
        streamKey,
        rtmpUrl,
        playbackUrl,
        isAllBatches ? 1 : 0,
      ]
    );

    const liveClassId = result.insertId;

    if (!isAllBatches && Array.isArray(batchIds) && batchIds.length > 0) {
      const batchValues = batchIds.map((bId) => [liveClassId, bId]);
      await conn.query(
        `INSERT IGNORE INTO live_class_batches (live_class_id, batch_id) VALUES ?`,
        [batchValues]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Live class scheduled successfully',
      liveClassId,
      streamId,
      streamKey,
      rtmpUrl,
      playbackUrl,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[LIVE CLASSES] Failed to schedule live class:', err);
    res.status(500).json({ error: 'Failed to schedule live class' });
  } finally {
    conn.release();
  }
});

/**
 * 2. GET /api/live-classes
 * List live classes with batch-wise access control
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const instituteId = user.institute_id || 1;
    const isAdmin = ['institute_admin', 'super_admin', 'admin'].includes(user.role);
    const { status, batchId } = req.query;

    let query = `
      SELECT lc.*, u.full_name AS instructor_name,
        GROUP_CONCAT(b.name SEPARATOR ', ') AS assigned_batches,
        GROUP_CONCAT(b.id) AS assigned_batch_ids
      FROM live_classes lc
      LEFT JOIN users u ON lc.instructor_id = u.id
      LEFT JOIN live_class_batches lcb ON lc.id = lcb.live_class_id
      LEFT JOIN batches b ON lcb.batch_id = b.id
      WHERE lc.institute_id = ?
    `;
    const params = [instituteId];

    if (!isAdmin) {
      // Student: only items where is_all_batches = 1 OR student in assigned batch
      const approvedBatchIds = await getStudentApprovedBatchIds(user.id);
      if (approvedBatchIds.length === 0) {
        query += ` AND lc.is_all_batches = 1`;
      } else {
        query += ` AND (lc.is_all_batches = 1 OR lcb.batch_id IN (?))`;
        params.push(approvedBatchIds);
      }
    } else if (batchId) {
      query += ` AND (lc.is_all_batches = 1 OR lcb.batch_id = ?)`;
      params.push(batchId);
    }

    if (status) {
      query += ` AND lc.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY lc.id ORDER BY 
      CASE lc.status 
        WHEN 'live' THEN 1 
        WHEN 'scheduled' THEN 2 
        ELSE 3 
      END, lc.scheduled_start_time ASC`;

    const [rows] = await pool.query(query, params);

    const classes = rows.map((r) => ({
      ...r,
      is_all_batches: Boolean(r.is_all_batches),
      assigned_batch_ids: r.assigned_batch_ids
        ? r.assigned_batch_ids.split(',').map((id) => parseInt(id, 10))
        : [],
    }));

    res.json({ classes });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to fetch live classes:', err);
    res.status(500).json({ error: 'Failed to fetch live classes' });
  }
});

/**
 * 3. GET /api/live-classes/:id/join
 * Authenticate student and return live playback credentials with watermark
 */
router.get('/:id/join', requireAuth, async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const user = req.user;
    const instituteId = user.institute_id || 1;
    const isAdmin = ['institute_admin', 'super_admin', 'admin'].includes(user.role);

    const [rows] = await pool.query(
      `SELECT lc.*, u.full_name AS instructor_name,
        GROUP_CONCAT(lcb.batch_id) AS batch_ids
       FROM live_classes lc
       LEFT JOIN users u ON lc.instructor_id = u.id
       LEFT JOIN live_class_batches lcb ON lc.id = lcb.live_class_id
       WHERE lc.id = ? AND lc.institute_id = ?
       GROUP BY lc.id`,
      [liveClassId, instituteId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    const liveClass = rows[0];

    // Check batch permission
    if (!isAdmin && !liveClass.is_all_batches) {
      const allowedBatchIds = liveClass.batch_ids
        ? liveClass.batch_ids.split(',').map((id) => parseInt(id, 10))
        : [];
      const studentBatchIds = await getStudentApprovedBatchIds(user.id);
      const hasAccess = studentBatchIds.some((id) => allowedBatchIds.includes(id));

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied. You are not in the batch for this live class.' });
      }
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    res.json({
      id: liveClass.id,
      title: liveClass.title,
      subject: liveClass.subject,
      status: liveClass.status,
      instructorName: liveClass.instructor_name,
      playbackUrl: liveClass.hls_playback_url,
      streamKey: isAdmin ? liveClass.stream_key : null,
      rtmpUrl: isAdmin ? (liveClass.rtmp_url || process.env.LIVE_STREAM_RTMP_URL || 'rtmp://localhost/live') : null,
      isInstructor: isAdmin || liveClass.instructor_id === user.id,
      watermark: {
        text: `${user.full_name || 'Student'} • ${user.email || 'N/A'}`,
        subText: `Roll: ${user.id} • IP: ${clientIp.toString().split(',')[0]}`,
      },
    });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to join live class:', err);
    res.status(500).json({ error: 'Failed to access live class' });
  }
});

/**
 * 4. POST /api/live-classes/:id/start
 * Teacher starts broadcasting
 */
router.post('/:id/start', requireAdmin, async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const instituteId = req.user.institute_id || 1;

    await pool.query(
      `UPDATE live_classes SET status = 'live', actual_start_time = NOW() WHERE id = ? AND institute_id = ?`,
      [liveClassId, instituteId]
    );

    const io = getIO();
    if (io) {
      io.of('/live-class').to(`class_${liveClassId}`).emit('class_status_changed', { status: 'live' });
    }

    res.json({ message: 'Live class started', status: 'live' });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to start live class:', err);
    res.status(500).json({ error: 'Failed to start live class' });
  }
});

/**
 * 5. POST /api/live-classes/:id/end
 * Teacher ends class; automatically creates replay video in video_lectures
 */
router.post('/:id/end', requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const liveClassId = req.params.id;
    const instituteId = req.user.institute_id || 1;

    const [rows] = await conn.query(
      `SELECT * FROM live_classes WHERE id = ? AND institute_id = ?`,
      [liveClassId, instituteId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    const liveClass = rows[0];

    await conn.beginTransaction();

    await conn.query(
      `UPDATE live_classes 
       SET status = 'completed', 
           actual_start_time = COALESCE(actual_start_time, created_at, NOW()), 
           actual_end_time = NOW() 
       WHERE id = ?`,
      [liveClassId]
    );

    const { broadcastMode = 'obs' } = req.body || {};

    // Auto-create recorded lecture entry for replay in video_lectures
    let replayVideoId = liveClass.replay_video_id;

    if (!replayVideoId) {
      const startTime = new Date(liveClass.actual_start_time || liveClass.created_at || Date.now());
      const durationSeconds = Math.max(60, Math.round((Date.now() - startTime.getTime()) / 1000));
      const replayTitle = `${liveClass.title} (Live Class Replay)`;
      const streamId = liveClass.stream_id || liveClass.bunny_stream_id || `stream_${liveClassId}`;
      const replayStatus = 'ready';

      const [vResult] = await conn.query(
        `INSERT INTO video_lectures 
          (institute_id, created_by, title, subject, chapter, description, bunny_video_id, duration_seconds, status, is_all_batches)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          instituteId,
          liveClass.instructor_id,
          replayTitle,
          liveClass.subject,
          'Live Class Recordings',
          liveClass.description || `Recorded session from live classroom: ${liveClass.title}`,
          streamId,
          durationSeconds,
          replayStatus,
          liveClass.is_all_batches ? 1 : 0,
        ]
      );

      replayVideoId = vResult.insertId;

      // Copy batch mappings from live class to recorded lecture
      const [batches] = await conn.query(
        `SELECT batch_id FROM live_class_batches WHERE live_class_id = ?`,
        [liveClassId]
      );

      if (batches.length > 0) {
        const batchValues = batches.map((b) => [replayVideoId, b.batch_id]);
        await conn.query(
          `INSERT IGNORE INTO video_lecture_batches (video_id, batch_id) VALUES ?`,
          [batchValues]
        );
      }

      await conn.query(
        `UPDATE live_classes SET replay_video_id = ? WHERE id = ?`,
        [replayVideoId, liveClassId]
      );
    }

    await conn.commit();

    const io = getIO();
    if (io) {
      io.of('/live-class').to(`class_${liveClassId}`).emit('class_status_changed', { status: 'completed' });
    }

    res.json({ message: 'Live class completed and replay archived', status: 'completed', replayVideoId });
  } catch (err) {
    await conn.rollback();
    console.error('[LIVE CLASSES] Failed to end live class:', err);
    res.status(500).json({ error: 'Failed to complete live class' });
  } finally {
    conn.release();
  }
});

/**
 * 5b. GET /api/live-classes/:id/stream-status
 * Live check for teacher studio: broadcast status for teacher studio
 */
router.get('/:id/stream-status', requireAuth, async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const [rows] = await pool.query(
      'SELECT id, stream_id, institute_id, status, actual_start_time FROM live_classes WHERE id = ?',
      [liveClassId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const liveClass = rows[0];
    const isLive = liveClass.status === 'live';
    const startedAt = liveClass.actual_start_time;
    const durationSeconds = (isLive && startedAt)
      ? Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000))
      : 0;

    res.json({
      isLive,
      isObsActive: isLive,
      startedAt,
      durationSeconds,
    });
  } catch (err) {
    console.error('Check stream status error:', err);
    res.status(500).json({ error: 'Error checking stream status' });
  }
});

/**
 * 5c. POST /api/live-classes/:id/save-browser-recording
 * Teacher uploads in-browser webcam/screen recorded stream blob
 */
router.post(
  '/:id/save-browser-recording',
  requireAdmin,
  recordingUpload.single('recording'),
  async (req, res) => {
    try {
      const liveClassId = req.params.id;
      const instituteId = req.user.institute_id || 1;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No recording file provided' });
      }

      const [rows] = await pool.query('SELECT * FROM live_classes WHERE id = ?', [liveClassId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Live class not found' });
      }

      const liveClass = rows[0];
      const instituteConfig = await getInstituteBunnyConfig(liveClass.institute_id || instituteId);

      // Create video entry in Bunny
      const replayTitle = `${liveClass.title} (Live Class Replay)`;
      const bunnyVideo = await createBunnyVideo({ title: replayTitle, config: instituteConfig });

      // Direct binary upload to Bunny
      if (!bunnyVideo.isMock) {
        try {
          await fetch(
            `https://video.bunnycdn.com/library/${instituteConfig.libraryId}/videos/${bunnyVideo.videoId}`,
            {
              method: 'PUT',
              headers: {
                AccessKey: instituteConfig.apiKey,
                'Content-Type': 'application/octet-stream',
              },
              body: file.buffer,
            }
          );
        } catch (upErr) {
          console.warn('[BROWSER RECORDING] Bunny upload warning:', upErr.message);
        }
      }

      let replayVideoId = liveClass.replay_video_id;
      if (replayVideoId) {
        await pool.query(
          `UPDATE video_lectures SET bunny_video_id = ?, status = 'ready' WHERE id = ?`,
          [bunnyVideo.videoId, replayVideoId]
        );
      } else {
        const [vResult] = await pool.query(
          `INSERT INTO video_lectures 
            (institute_id, created_by, title, subject, chapter, description, bunny_video_id, duration_seconds, status, is_all_batches)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?)`,
          [
            liveClass.institute_id,
            liveClass.instructor_id,
            replayTitle,
            liveClass.subject,
            'Live Class Recordings',
            liveClass.description || `Recorded session from live classroom: ${liveClass.title}`,
            bunnyVideo.videoId,
            Math.max(60, Math.round(file.size / (100 * 1024))), // estimated duration
            'ready',
            liveClass.is_all_batches ? 1 : 0,
          ]
        );
        replayVideoId = vResult.insertId;

        const [batches] = await pool.query(
          `SELECT batch_id FROM live_class_batches WHERE live_class_id = ?`,
          [liveClassId]
        );
        if (batches.length > 0) {
          const batchValues = batches.map((b) => [replayVideoId, b.batch_id]);
          await pool.query(`INSERT IGNORE INTO video_lecture_batches (video_id, batch_id) VALUES ?`, [batchValues]);
        }

        await pool.query(`UPDATE live_classes SET replay_video_id = ? WHERE id = ?`, [replayVideoId, liveClassId]);
      }

      res.json({
        message: 'Browser recording successfully saved and attached as video lecture replay',
        replayVideoId,
        videoId: bunnyVideo.videoId,
      });
    } catch (err) {
      console.error('[BROWSER RECORDING] Error saving browser recording:', err);
      res.status(500).json({ error: 'Failed to save browser recording' });
    }
  }
);

/**
 * 6. POST /api/live-classes/:id/polls
 * Teacher launches an in-class MCQ poll
 */
router.post('/:id/polls', requireAdmin, async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const { question, options, correctOption = -1, durationSeconds = 30 } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options are required' });
    }

    // Deactivate existing active polls for this class
    await pool.query(`UPDATE live_polls SET is_active = 0 WHERE live_class_id = ?`, [liveClassId]);

    const [result] = await pool.query(
      `INSERT INTO live_polls 
        (live_class_id, question, options_json, correct_option, duration_seconds, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [liveClassId, question, JSON.stringify(options), correctOption, durationSeconds]
    );

    res.status(201).json({
      message: 'Poll created',
      pollId: result.insertId,
      question,
      options,
      durationSeconds,
    });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to create poll:', err);
    res.status(500).json({ error: 'Failed to launch live poll' });
  }
});

/**
 * 7. POST /api/live-classes/polls/:pollId/vote
 * Student votes in active live poll
 */
router.post('/polls/:pollId/vote', requireAuth, async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const userId = req.user.id;
    const { selectedOption, responseTimeMs } = req.body;

    if (selectedOption === undefined || selectedOption === null) {
      return res.status(400).json({ error: 'selectedOption is required' });
    }

    const [polls] = await pool.query(`SELECT is_active FROM live_polls WHERE id = ?`, [pollId]);
    if (polls.length === 0 || !polls[0].is_active) {
      return res.status(400).json({ error: 'Poll is no longer active' });
    }

    const safeResponseTimeMs =
      Number.isInteger(responseTimeMs) && responseTimeMs > 0 ? responseTimeMs : null;

    await pool.query(
      `INSERT INTO live_poll_responses (poll_id, user_id, selected_option, response_time_ms)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         selected_option = VALUES(selected_option),
         response_time_ms = COALESCE(VALUES(response_time_ms), response_time_ms)`,
      [pollId, userId, selectedOption, safeResponseTimeMs]
    );

    // Calculate aggregated vote counts
    const [counts] = await pool.query(
      `SELECT selected_option, COUNT(*) as vote_count 
       FROM live_poll_responses WHERE poll_id = ? GROUP BY selected_option`,
      [pollId]
    );

    res.json({ message: 'Vote recorded', counts });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to submit vote:', err);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

/**
 * 8. GET /api/live-classes/polls/:pollId/leaderboard
 * Fetch Top 10 fastest correct responses for a live poll
 */
router.get('/polls/:pollId/leaderboard', requireAuth, async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const [polls] = await pool.query(
      `SELECT id, live_class_id, question, options_json, correct_option, duration_seconds, is_active FROM live_polls WHERE id = ?`,
      [pollId]
    );
    if (polls.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    const poll = polls[0];
    const options = typeof poll.options_json === 'string' ? JSON.parse(poll.options_json) : poll.options_json;

    let query = `
      SELECT 
        r.user_id,
        COALESCE(u.full_name, u.email, 'Student') AS name,
        r.selected_option,
        r.response_time_ms,
        r.answered_at
      FROM live_poll_responses r
      JOIN users u ON r.user_id = u.id
      WHERE r.poll_id = ?
    `;
    const params = [pollId];

    if (poll.correct_option !== null && poll.correct_option !== undefined) {
      query += ` AND r.selected_option = ?`;
      params.push(poll.correct_option);
    }

    query += ` ORDER BY COALESCE(r.response_time_ms, 999999) ASC, r.answered_at ASC LIMIT 10`;

    const [rows] = await pool.query(query, params);

    const leaderboard = rows.map((r, idx) => ({
      rank: idx + 1,
      userId: r.user_id,
      name: r.name,
      selectedOption: r.selected_option,
      responseTimeMs: r.response_time_ms,
      responseTimeSec: r.response_time_ms ? (r.response_time_ms / 1000).toFixed(1) + 's' : 'Fast',
    }));

    res.json({
      pollId: poll.id,
      liveClassId: poll.live_class_id,
      question: poll.question,
      options,
      correctOption: poll.correct_option,
      leaderboard,
    });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to fetch leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * 9. POST /api/live-classes/polls/:pollId/share-leaderboard
 * Teacher shares top 10 fastest leaderboard with the whole live classroom
 */
router.post('/polls/:pollId/share-leaderboard', requireAdmin, async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const [polls] = await pool.query(
      `SELECT id, live_class_id, question, options_json, correct_option, duration_seconds, is_active FROM live_polls WHERE id = ?`,
      [pollId]
    );
    if (polls.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    const poll = polls[0];
    const options = typeof poll.options_json === 'string' ? JSON.parse(poll.options_json) : poll.options_json;

    // Mark poll closed so voting ceases
    await pool.query(`UPDATE live_polls SET is_active = FALSE WHERE id = ?`, [pollId]);

    let query = `
      SELECT 
        r.user_id,
        COALESCE(u.full_name, u.email, 'Student') AS name,
        r.selected_option,
        r.response_time_ms,
        r.answered_at
      FROM live_poll_responses r
      JOIN users u ON r.user_id = u.id
      WHERE r.poll_id = ?
    `;
    const params = [pollId];

    if (poll.correct_option !== null && poll.correct_option !== undefined) {
      query += ` AND r.selected_option = ?`;
      params.push(poll.correct_option);
    }

    query += ` ORDER BY COALESCE(r.response_time_ms, 999999) ASC, r.answered_at ASC LIMIT 10`;

    const [rows] = await pool.query(query, params);

    const leaderboard = rows.map((r, idx) => ({
      rank: idx + 1,
      userId: r.user_id,
      name: r.name,
      selectedOption: r.selected_option,
      responseTimeMs: r.response_time_ms,
      responseTimeSec: r.response_time_ms ? (r.response_time_ms / 1000).toFixed(1) + 's' : 'Fast',
    }));

    const payload = {
      pollId: poll.id,
      liveClassId: poll.live_class_id,
      question: poll.question,
      options,
      correctOption: poll.correct_option,
      leaderboard,
    };

    // Broadcast through socket.io to the live class room
    const io = getIO();
    if (io) {
      const liveNamespace = io.of('/live-class');
      liveNamespace.to(`class_${poll.live_class_id}`).emit('poll_leaderboard_published', payload);
      liveNamespace.to(`class_${poll.live_class_id}`).emit('active_poll_closed', { pollId: poll.id });
    }

    res.json({ message: 'Leaderboard broadcasted to class', ...payload });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to share leaderboard:', err);
    res.status(500).json({ error: 'Failed to share leaderboard' });
  }
});

/**
 * 10. POST /api/live-classes/polls/:pollId/close
 * Close active poll
 */
router.post('/polls/:pollId/close', requireAdmin, async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const [polls] = await pool.query(`SELECT live_class_id FROM live_polls WHERE id = ?`, [pollId]);
    if (polls.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    const liveClassId = polls[0].live_class_id;

    await pool.query(`UPDATE live_polls SET is_active = FALSE WHERE id = ?`, [pollId]);

    const io = getIO();
    if (io) {
      const liveNamespace = io.of('/live-class');
      liveNamespace.to(`class_${liveClassId}`).emit('active_poll_closed', { pollId });
    }

    res.json({ message: 'Poll closed', pollId });
  } catch (err) {
    console.error('[LIVE CLASSES] Failed to close poll:', err);
    res.status(500).json({ error: 'Failed to close poll' });
  }
});

export default router;
