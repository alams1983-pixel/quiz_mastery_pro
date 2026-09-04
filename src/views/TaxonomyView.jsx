import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { ReactModal } from '../components/ReactModal.jsx';

export function TaxonomyView({ navigate }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'tags'
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📝');
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  // Tag Modal State
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [tagDesc, setTagDesc] = useState('');
  const [tagSaving, setTagSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, tagRes] = await Promise.all([
        api.getCategories().catch(() => ({ flatCategories: [] })),
        api.getTags().catch(() => ({ tags: [] }))
      ]);

      setCategories(catRes.flatCategories || []);
      setTags(tagRes.tags || []);
    } catch (err) {
      console.error('Error loading taxonomy:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCatId(cat.id);
      setCatName(cat.name || '');
      setCatIcon(cat.icon || '📝');
      setCatDesc(cat.description || '');
      setCatParentId(cat.parent_id || '');
    } else {
      setEditingCatId(null);
      setCatName('');
      setCatIcon('📝');
      setCatDesc('');
      setCatParentId('');
    }
    setShowCatModal(true);
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setCatSaving(true);
    try {
      const payload = {
        name: catName.trim(),
        icon: catIcon.trim() || '📝',
        description: catDesc.trim(),
        parent_id: catParentId ? parseInt(catParentId, 10) : null
      };

      if (editingCatId) {
        await api.updateCategory(editingCatId, payload);
      } else {
        await api.createCategory(payload);
      }

      setShowCatModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Error saving category.');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting category.');
    }
  };

  const handleOpenTagModal = (tag = null) => {
    if (tag) {
      setEditingTagId(tag.id);
      setTagName(tag.name || '');
      setTagSlug(tag.slug || '');
      setTagDesc(tag.description || '');
    } else {
      setEditingTagId(null);
      setTagName('');
      setTagSlug('');
      setTagDesc('');
    }
    setShowTagModal(true);
  };

  const handleSaveTag = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setTagSaving(true);
    try {
      const payload = {
        name: tagName.trim(),
        slug: tagSlug.trim() || tagName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: tagDesc.trim()
      };

      if (editingTagId) {
        await api.updateTag(editingTagId, payload);
      } else {
        await api.createTag(payload);
      }

      setShowTagModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Error saving tag.');
    } finally {
      setTagSaving(false);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    try {
      await api.deleteTag(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting tag.');
    }
  };

  return (
    <div className="view-container fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>🏷️ Master Taxonomy & Tag Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Single-source taxonomy shared across both Online CBT Exams and Practice Quizzes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleOpenCatModal()}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="ri-folder-add-line"></i> Add Category
          </button>
          <button
            type="button"
            onClick={() => handleOpenTagModal()}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="ri-price-tag-3-line"></i> Create Tag
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          type="button"
          className={`btn-text ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
          style={{ fontWeight: 700, padding: '10px 18px', borderBottom: activeTab === 'categories' ? '3px solid var(--primary)' : 'none', color: activeTab === 'categories' ? 'var(--text-main)' : 'var(--text-muted)' }}
        >
          📂 Categories & Emoji Icons
        </button>
        <button
          type="button"
          className={`btn-text ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
          style={{ fontWeight: 700, padding: '10px 18px', borderBottom: activeTab === 'tags' ? '3px solid var(--accent)' : 'none', color: activeTab === 'tags' ? 'var(--text-main)' : 'var(--text-muted)' }}
        >
          🏷️ Question & Exam Tags Dictionary
        </button>
      </div>

      {/* Main Content */}
      <div className="card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Loading taxonomy...
          </div>
        ) : activeTab === 'categories' ? (
          categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No categories created yet. Click "+ Add Category" to create one.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Category Name</th>
                    <th>Parent Category</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => {
                    const parentCat = categories.find(p => p.id === c.parent_id);
                    return (
                      <tr key={c.id}>
                        <td style={{ fontSize: '1.4rem' }}>{c.icon || '📝'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</td>
                        <td>{parentCat ? parentCat.name : <span style={{ color: 'var(--text-muted)' }}>Root</span>}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.description || '-'}</td>
                        <td>
                          <div className="btn-icon-group">
                            <button type="button" onClick={() => handleOpenCatModal(c)} className="btn btn-outline btn-icon-only btn-sm" title="Edit Category" aria-label="Edit Category">
                              <i className="ri-edit-line"></i>
                            </button>
                            <button type="button" onClick={() => handleDeleteCat(c.id)} className="btn btn-danger btn-icon-only btn-sm" title="Delete Category" aria-label="Delete Category">
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          tags.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No tags created yet. Click "+ Create Tag" to add one.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Tag Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        <span className="badge-tag">🏷️ {t.name}</span>
                      </td>
                      <td><code style={{ fontSize: '0.82rem' }}>{t.slug}</code></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.description || '-'}</td>
                      <td>
                        <div className="btn-icon-group">
                          <button type="button" onClick={() => handleOpenTagModal(t)} className="btn btn-outline btn-icon-only btn-sm" title="Edit Tag" aria-label="Edit Tag">
                            <i className="ri-edit-line"></i>
                          </button>
                          <button type="button" onClick={() => handleDeleteTag(t.id)} className="btn btn-danger btn-icon-only btn-sm" title="Delete Tag" aria-label="Delete Tag">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Category Modal */}
      <ReactModal
        isOpen={showCatModal}
        title={editingCatId ? '✏️ Edit Category' : '📂 Add Category'}
        onClose={() => setShowCatModal(false)}
      >
        <form onSubmit={handleSaveCat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Category Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Quantitative Aptitude"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Emoji Icon</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 📐"
              value={catIcon}
              onChange={(e) => setCatIcon(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Parent Category (Optional)</label>
            <select
              value={catParentId}
              onChange={(e) => setCatParentId(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
            >
              <option value="">None (Top-Level Category)</option>
              {categories.filter(c => c.id !== editingCatId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Brief summary of topics in this category..."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" disabled={catSaving} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}>
            {catSaving ? 'Saving...' : editingCatId ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      </ReactModal>

      {/* Tag Modal */}
      <ReactModal
        isOpen={showTagModal}
        title={editingTagId ? '✏️ Edit Tag' : '🏷️ Create Tag'}
        onClose={() => setShowTagModal(false)}
      >
        <form onSubmit={handleSaveTag} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Tag Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Percentage & Ratio"
              required
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Tag Slug</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. percentage-ratio"
              value={tagSlug}
              onChange={(e) => setTagSlug(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Tag description..."
              value={tagDesc}
              onChange={(e) => setTagDesc(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" disabled={tagSaving} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}>
            {tagSaving ? 'Saving...' : editingTagId ? 'Update Tag' : 'Create Tag'}
          </button>
        </form>
      </ReactModal>
    </div>
  );
}

export default TaxonomyView;
