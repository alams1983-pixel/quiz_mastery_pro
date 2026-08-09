import express from 'express';
import pool from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to build category tree
function buildCategoryTree(categories, parentId = null) {
  return categories
    .filter(cat => cat.parent_id === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id)
    }));
}

// 1. Get Category Taxonomy Tree
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    const tree = buildCategoryTree(categories, null);
    res.json({ categories: tree, flatCategories: categories });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching categories.' });
  }
});

// 2. Create Category (Admin - with Emoji support)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, parent_id, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const categoryIcon = (icon && icon.trim()) ? icon.trim() : '📂';

    const [result] = await pool.query(
      'INSERT INTO categories (name, parent_id, description, icon) VALUES (?, ?, ?, ?)',
      [name, parent_id || null, description || '', categoryIcon]
    );

    res.status(201).json({
      message: 'Category created.',
      category: { id: result.insertId, name, parent_id: parent_id || null, description, icon: categoryIcon }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating category.' });
  }
});

// 3. Update Category (Admin - with Emoji support)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, parent_id, description, icon } = req.body;
    const catId = req.params.id;

    const categoryIcon = (icon && icon.trim()) ? icon.trim() : '📂';

    await pool.query(
      'UPDATE categories SET name = ?, parent_id = ?, description = ?, icon = ? WHERE id = ?',
      [name, parent_id || null, description || '', categoryIcon, catId]
    );

    res.json({ message: 'Category updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating category.' });
  }
});

// 4. Delete Category (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const catId = req.params.id;
    await pool.query('DELETE FROM categories WHERE id = ?', [catId]);
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting category.' });
  }
});

export default router;
