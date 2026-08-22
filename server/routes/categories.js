import express from 'express';
import pool from '../db.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';

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

// 1. Get Category Taxonomy Tree (Scoped by Institute & Global Master)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const instId = req.user ? req.user.institute_id : null;
    let sql = `
      SELECT c.*, i.name as institute_name
      FROM categories c
      LEFT JOIN institutes i ON c.institute_id = i.id
      WHERE (c.institute_id IS NULL OR c.is_global = 1
    `;

    const params = [];
    if (instId) {
      sql += ` OR c.institute_id = ?`;
      params.push(instId);
    }
    sql += `) ORDER BY c.name ASC`;

    const [categories] = await pool.query(sql, params);
    const tree = buildCategoryTree(categories, null);
    res.json({ categories: tree, flatCategories: categories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: 'Error fetching categories.' });
  }
});

// 2. Create Category (Strict Isolation: Super Admin creates Global Master; Teacher creates Institute Private)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, parent_id, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const categoryIcon = (icon && icon.trim()) ? icon.trim() : '📂';

    // Super Admin creates Global Master Category; Teacher creates Institute Private Category
    const isSuper = req.user.role === 'super_admin';
    const instId = isSuper ? null : req.user.institute_id;
    const isGlobal = isSuper ? 1 : 0;

    if (!isSuper && !instId) {
      return res.status(400).json({ error: 'Your teacher/admin account must be associated with a Coaching Institute to create private categories.' });
    }

    if (parent_id) {
      const [parents] = await pool.query('SELECT id, institute_id, is_global FROM categories WHERE id = ?', [parent_id]);
      if (parents.length === 0) {
        return res.status(400).json({ error: 'Selected parent category does not exist.' });
      }

      const parentCat = parents[0];
      const parentIsGlobal = !parentCat.institute_id || parentCat.is_global;

      if (isGlobal && !parentIsGlobal) {
        return res.status(400).json({ error: 'A Global Master Category can only have another Global Master Category as its parent.' });
      }
      if (!isGlobal && parentIsGlobal) {
        return res.status(400).json({ error: 'An Institute Private Category cannot be placed under a Global Master Category. Please select a Private Parent Category or set as Root.' });
      }
      if (!isGlobal && !parentIsGlobal && parentCat.institute_id !== instId) {
        return res.status(400).json({ error: 'An Institute Private Category can only be placed under a category belonging to the same institute.' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, parent_id, description, icon, institute_id, is_global) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), parent_id || null, description || '', categoryIcon, instId, isGlobal]
    );

    res.status(201).json({
      message: isSuper ? 'Global Master Category created.' : 'Private Institute Category created.',
      category: { id: result.insertId, name: name.trim(), parent_id: parent_id || null, description, icon: categoryIcon, institute_id: instId, is_global: isGlobal }
    });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Error creating category.' });
  }
});

// 4. Update Category (Strict Isolation Enforced)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, parent_id, description, icon } = req.body;
    const catId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [catId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Category not found.' });

    const currentCat = existing[0];
    const isGlobal = !currentCat.institute_id || currentCat.is_global;

    if (parent_id) {
      const [parents] = await pool.query('SELECT id, institute_id, is_global FROM categories WHERE id = ?', [parent_id]);
      if (parents.length === 0) return res.status(400).json({ error: 'Selected parent category does not exist.' });

      const parentCat = parents[0];
      const parentIsGlobal = !parentCat.institute_id || parentCat.is_global;

      if (isGlobal && !parentIsGlobal) {
        return res.status(400).json({ error: 'A Global Master Category can only have another Global Master Category as its parent.' });
      }
      if (!isGlobal && parentIsGlobal) {
        return res.status(400).json({ error: 'An Institute Private Category cannot be placed under a Global Master Category. Please select a Private Parent Category or set as Root.' });
      }
      if (!isGlobal && !parentIsGlobal && parentCat.institute_id !== currentCat.institute_id) {
        return res.status(400).json({ error: 'An Institute Private Category can only be placed under a category belonging to the same institute.' });
      }
    }

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

// 5. Delete Category
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
