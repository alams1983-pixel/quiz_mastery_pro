import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { generateR2UploadUrl, generateR2DownloadUrl, deleteR2Object } from '../utils/r2Helper.js';

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
 * 1. POST /api/study-materials/presigned-upload
 * Generate pre-signed URL to upload a document directly to Cloudflare R2
 */
router.post('/presigned-upload', requireAdmin, async (req, res) => {
  try {
    const { fileName, mimeType = 'application/pdf', category = 'notes' } = req.body;
    const instituteId = req.user.institute_id || 1;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const cleanExt = fileName.split('.').pop() || 'pdf';
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeBase = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const r2Key = `tenants/inst-${instituteId}/study-materials/${category}/${Date.now()}_${randomHex}_${safeBase}.${cleanExt}`;

    const { uploadUrl, key, isMock } = await generateR2UploadUrl({
      key: r2Key,
      mimeType,
      expiresIn: 900,
    });

    res.json({
      uploadUrl,
      fileKey: key,
      isMock,
    });
  } catch (err) {
    console.error('[STUDY MATERIALS] Failed to generate presigned upload URL:', err);
    res.status(500).json({ error: 'Failed to initiate secure upload' });
  }
});

/**
 * 2. POST /api/study-materials
 * Save metadata of uploaded study material and map to specific batches
 */
router.post('/', requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      title,
      subject,
      chapter,
      category = 'notes',
      description,
      fileR2Key,
      fileName,
      fileSizeBytes = 0,
      mimeType = 'application/pdf',
      isAllBatches = false,
      isDownloadable = false,
      batchIds = [],
    } = req.body;

    const instituteId = req.user.institute_id || 1;
    const createdBy = req.user.id;

    if (!title || !subject || !fileR2Key || !fileName) {
      return res.status(400).json({ error: 'Title, subject, fileR2Key, and fileName are required' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO study_materials 
        (institute_id, created_by, title, subject, chapter, category, description, file_r2_key, file_name, file_size_bytes, mime_type, is_all_batches, is_downloadable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        instituteId,
        createdBy,
        title,
        subject,
        chapter || null,
        category,
        description || null,
        fileR2Key,
        fileName,
        fileSizeBytes,
        mimeType,
        isAllBatches ? 1 : 0,
        isDownloadable ? 1 : 0,
      ]
    );

    const materialId = result.insertId;

    // Map to specific batches if not all batches
    if (!isAllBatches && Array.isArray(batchIds) && batchIds.length > 0) {
      const batchValues = batchIds.map((bId) => [materialId, bId]);
      await conn.query(
        `INSERT IGNORE INTO study_material_batches (material_id, batch_id) VALUES ?`,
        [batchValues]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Study material published successfully',
      materialId,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[STUDY MATERIALS] Failed to save study material:', err);
    res.status(500).json({ error: 'Failed to publish study material' });
  } finally {
    conn.release();
  }
});

/**
 * 3. GET /api/study-materials
 * List materials with batch-wise access control
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const instituteId = user.institute_id || 1;
    const isAdmin = ['institute_admin', 'super_admin', 'admin'].includes(user.role);
    const { subject, category, search, batchId } = req.query;

    let query = `
      SELECT sm.*, 
        GROUP_CONCAT(b.name SEPARATOR ', ') AS assigned_batches,
        GROUP_CONCAT(b.id) AS assigned_batch_ids
      FROM study_materials sm
      LEFT JOIN study_material_batches smb ON sm.id = smb.material_id
      LEFT JOIN batches b ON smb.batch_id = b.id
      WHERE sm.institute_id = ?
    `;
    const params = [instituteId];

    if (!isAdmin) {
      // Student: only items that are is_all_batches OR where student is approved in mapped batch
      const approvedBatchIds = await getStudentApprovedBatchIds(user.id);
      if (approvedBatchIds.length === 0) {
        query += ` AND sm.is_all_batches = 1`;
      } else {
        query += ` AND (sm.is_all_batches = 1 OR smb.batch_id IN (?))`;
        params.push(approvedBatchIds);
      }
    } else if (batchId) {
      // Admin filter by specific batch
      query += ` AND (sm.is_all_batches = 1 OR smb.batch_id = ?)`;
      params.push(batchId);
    }

    if (subject) {
      query += ` AND sm.subject = ?`;
      params.push(subject);
    }
    if (category) {
      query += ` AND sm.category = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (sm.title LIKE ? OR sm.chapter LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY sm.id ORDER BY sm.created_at DESC`;

    const [rows] = await pool.query(query, params);

    const materials = rows.map((r) => ({
      ...r,
      is_all_batches: Boolean(r.is_all_batches),
      is_downloadable: Boolean(r.is_downloadable),
      assigned_batch_ids: r.assigned_batch_ids
        ? r.assigned_batch_ids.split(',').map((id) => parseInt(id, 10))
        : [],
    }));

    res.json({ materials });
  } catch (err) {
    console.error('[STUDY MATERIALS] Failed to fetch materials:', err);
    res.status(500).json({ error: 'Failed to fetch study materials' });
  }
});

/**
 * 4. GET /api/study-materials/:id/view
 * Authorize student and generate pre-signed URL + dynamic watermark payload
 */
router.get('/:id/view', requireAuth, async (req, res) => {
  try {
    const materialId = req.params.id;
    const user = req.user;
    const instituteId = user.institute_id || 1;
    const isAdmin = ['institute_admin', 'super_admin', 'admin'].includes(user.role);

    const [materials] = await pool.query(
      `SELECT sm.*, GROUP_CONCAT(smb.batch_id) AS batch_ids 
       FROM study_materials sm
       LEFT JOIN study_material_batches smb ON sm.id = smb.material_id
       WHERE sm.id = ? AND sm.institute_id = ?
       GROUP BY sm.id`,
      [materialId, instituteId]
    );

    if (materials.length === 0) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    const material = materials[0];

    // Batch authorization check for students
    if (!isAdmin && !material.is_all_batches) {
      const allowedBatchIds = material.batch_ids
        ? material.batch_ids.split(',').map((id) => parseInt(id, 10))
        : [];
      const studentBatchIds = await getStudentApprovedBatchIds(user.id);
      const hasAccess = studentBatchIds.some((id) => allowedBatchIds.includes(id));

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied. You are not enrolled in the batch for this study material.' });
      }
    }

    // Generate short-lived signed URL (1 hour)
    const viewUrl = await generateR2DownloadUrl({
      key: material.file_r2_key,
      expiresIn: 3600,
      downloadFilename: material.file_name,
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    res.json({
      viewUrl,
      fileName: material.file_name,
      title: material.title,
      isDownloadable: Boolean(material.is_downloadable),
      // Watermark metadata rendered on canvas over the PDF
      watermark: {
        text: `${user.full_name || 'Student'} • ${user.email || 'N/A'}`,
        subText: `Roll: ${user.id} • IP: ${clientIp.toString().split(',')[0]}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[STUDY MATERIALS] Failed to generate view link:', err);
    res.status(500).json({ error: 'Failed to access document' });
  }
});

/**
 * 5. DELETE /api/study-materials/:id
 * Delete document metadata and remove from Cloudflare R2
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const materialId = req.params.id;
    const instituteId = req.user.institute_id || 1;

    const [rows] = await pool.query(
      `SELECT file_r2_key FROM study_materials WHERE id = ? AND institute_id = ?`,
      [materialId, instituteId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    const { file_r2_key } = rows[0];

    // Delete from Cloudflare R2
    try {
      await deleteR2Object(file_r2_key);
    } catch (r2Err) {
      console.warn('[STUDY MATERIALS] Cloudflare R2 delete warning:', r2Err.message);
    }

    // Delete from DB (cascades to study_material_batches)
    await pool.query(`DELETE FROM study_materials WHERE id = ?`, [materialId]);

    res.json({ message: 'Study material deleted successfully' });
  } catch (err) {
    console.error('[STUDY MATERIALS] Failed to delete study material:', err);
    res.status(500).json({ error: 'Failed to delete study material' });
  }
});

export default router;
