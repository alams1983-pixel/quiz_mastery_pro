import express from 'express';
import pool from '../db.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Get All Tags (Scoped by Institute & Global Master)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const instId = req.user ? req.user.institute_id : null;
    let sql = `SELECT * FROM tags WHERE (institute_id IS NULL OR is_global = 1`;
    const params = [];
    if (instId) {
      sql += ` OR institute_id = ?`;
      params.push(instId);
    }
    sql += `) ORDER BY name ASC`;

    const [tags] = await pool.query(sql, params);
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tags.' });
  }
});

// 2. Create Tag (Super Admin creates Global; Teacher creates Institute Private)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Tag name is required.' });

    const isSuper = req.user.role === 'super_admin';
    const instId = isSuper ? null : req.user.institute_id;
    const isGlobal = isSuper ? 1 : 0;

    const [result] = await pool.query(
      'INSERT INTO tags (name, institute_id, is_global) VALUES (?, ?, ?)',
      [name.trim(), instId, isGlobal]
    );

    res.status(201).json({
      message: 'Tag created.',
      tag: { id: result.insertId, name: name.trim(), institute_id: instId, is_global: isGlobal }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating tag.' });
  }
});

// 3. Delete Tag (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const tagId = req.params.id;
    const [existing] = await pool.query('SELECT * FROM tags WHERE id = ?', [tagId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Tag not found.' });

    const tag = existing[0];
    const isGlobal = !tag.institute_id || tag.is_global;

    if (req.user.role !== 'super_admin') {
      if (isGlobal) {
        return res.status(403).json({ error: 'Access denied. Only Super Admins can delete Global Master Tags.' });
      }
      if (tag.institute_id !== req.user.institute_id) {
        return res.status(403).json({ error: 'Access denied. You do not have permission to delete tags belonging to another institute.' });
      }
    }

    await pool.query('DELETE FROM tags WHERE id = ?', [tagId]);
    res.json({ message: 'Tag deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting tag.' });
  }
});

export default router;
