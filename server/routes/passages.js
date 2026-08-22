import express from 'express';
import pool from '../db.js';
import { requireAuth, requireInstituteAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Passages for Institute
router.get('/', requireAuth, async (req, res) => {
  try {
    const instId = req.user.institute_id;
    let sql = 'SELECT * FROM passages WHERE 1=1';
    const params = [];

    if (req.user.role !== 'super_admin' && instId) {
      sql += ' AND institute_id = ?';
      params.push(instId);
    }

    sql += ' ORDER BY created_at DESC';
    const [passages] = await pool.query(sql, params);
    res.json({ passages });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching passages.' });
  }
});

// 2. Create Comprehension Passage
router.post('/', requireInstituteAdmin, async (req, res) => {
  try {
    const { passage_text_en, passage_text_hi } = req.body;
    if (!passage_text_en) return res.status(400).json({ error: 'English passage text is required.' });

    const instId = req.user.role === 'super_admin' ? (req.body.institute_id || 1) : req.user.institute_id;

    const [result] = await pool.query(
      'INSERT INTO passages (institute_id, passage_text_en, passage_text_hi, created_by) VALUES (?, ?, ?, ?)',
      [instId, passage_text_en, passage_text_hi || '', req.user.id]
    );

    res.status(201).json({ message: 'Passage created successfully.', passageId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error creating passage.' });
  }
});

// 3. Update Passage
router.put('/:id', requireInstituteAdmin, async (req, res) => {
  try {
    const passageId = req.params.id;
    const { passage_text_en, passage_text_hi } = req.body;

    await pool.query(
      'UPDATE passages SET passage_text_en = ?, passage_text_hi = ? WHERE id = ?',
      [passage_text_en, passage_text_hi || '', passageId]
    );

    res.json({ message: 'Passage updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating passage.' });
  }
});

// 4. Delete Passage
router.delete('/:id', requireInstituteAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM passages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Passage deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting passage.' });
  }
});

export default router;
