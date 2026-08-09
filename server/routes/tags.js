import express from 'express';
import pool from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get All Tags
router.get('/', async (req, res) => {
  try {
    const [tags] = await pool.query('SELECT * FROM tags ORDER BY name ASC');
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tags.' });
  }
});

// 2. Create Tag (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Tag name is required.' });

    const [result] = await pool.query(
      'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      [name.trim()]
    );

    res.status(201).json({
      message: 'Tag created.',
      tag: { id: result.insertId, name: name.trim() }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating tag.' });
  }
});

// 3. Delete Tag (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM tags WHERE id = ?', [req.params.id]);
    res.json({ message: 'Tag deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting tag.' });
  }
});

export default router;
