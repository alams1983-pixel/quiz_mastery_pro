import { api } from '../services/api.js';
import { createModal } from '../components/Modal.js';

export function renderTaxonomyView(navigate) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px;">🏷️ Master Taxonomy & Tag Management</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Single-source taxonomy shared across both Online CBT Exams and Practice Quizzes.
        </p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btn-add-category" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;" title="Add Category" aria-label="Add Category">
          <i class="ri-folder-add-line"></i> <span class="btn-text-desktop">Add Category</span>
        </button>
        <button id="btn-add-tag" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" title="Create Tag" aria-label="Create Tag">
          <i class="ri-price-tag-3-line"></i> <span class="btn-text-desktop">Create Tag</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px;">
      <button id="tab-tax-cat" class="btn-text active" style="font-weight: 700; padding: 10px 18px; border-bottom: 3px solid var(--primary);">
        📂 Categories & Emoji Icons
      </button>
      <button id="tab-tax-tags" class="btn-text" style="font-weight: 700; padding: 10px 18px; color: var(--text-muted);">
        🏷️ Question & Exam Tags Dictionary
      </button>
    </div>

    <!-- Section Content -->
    <div id="taxonomy-content">
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Loading taxonomy...
      </div>
    </div>
  `;

  setTimeout(() => {
    setupTaxonomy(container, navigate);
  }, 0);

  return container;
}

async function setupTaxonomy(container, navigate) {
  const tabCat = container.querySelector('#tab-tax-cat');
  const tabTags = container.querySelector('#tab-tax-tags');
  const content = container.querySelector('#taxonomy-content');
  const btnAddCat = container.querySelector('#btn-add-category');
  const btnAddTag = container.querySelector('#btn-add-tag');

  let activeTab = 'categories';
  let categories = [];
  let tags = [];

  function setActiveTab(t) {
    activeTab = t;
    [tabCat, tabTags].forEach(b => b.classList.remove('active'));
    tabCat.style.borderBottom = 'none';
    tabTags.style.borderBottom = 'none';

    if (t === 'categories') {
      tabCat.classList.add('active');
      tabCat.style.borderBottom = '3px solid var(--primary)';
    } else {
      tabTags.classList.add('active');
      tabTags.style.borderBottom = '3px solid var(--accent)';
    }

    renderContent();
  }

  tabCat.addEventListener('click', () => setActiveTab('categories'));
  tabTags.addEventListener('click', () => setActiveTab('tags'));

  async function loadData() {
    try {
      const [catRes, tagRes] = await Promise.all([
        api.getCategories().catch(() => ({ flatCategories: [] })),
        api.getTags().catch(() => ({ tags: [] }))
      ]);

      categories = catRes.flatCategories || [];
      tags = tagRes.tags || [];

      renderContent();
    } catch (err) {
      content.innerHTML = `<div style="color:var(--danger); padding:20px;">Error loading taxonomy: ${err.message}</div>`;
    }
  }

  function renderContent() {
    if (activeTab === 'categories') {
      if (categories.length === 0) {
        content.innerHTML = '<div class="card" style="padding:30px; text-align:center; color:var(--text-muted);">No categories created yet. Click "+ Add Category" to create one.</div>';
        return;
      }

      content.innerHTML = `
        <div class="card" style="padding: 20px;">
          <div class="table-wrap">
            <table class="custom-table mobile-card-table" style="width: 100%;">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Category Name</th>
                  <th>Scope / Ownership</th>
                  <th>Parent Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${categories.map(c => {
                  const isGlobal = !c.institute_id || c.is_global;
                  return `
                  <tr>
                    <td data-label="Icon" style="font-size: 1.4rem; text-align: center;">${c.icon || '📂'}</td>
                    <td data-label="Category Name" style="font-weight: 700;">${c.name}</td>
                    <td data-label="Scope">
                      <span class="badge-tag" style="background: ${isGlobal ? 'var(--primary-light)' : 'var(--accent-light)'}; color: ${isGlobal ? 'var(--primary)' : 'var(--accent)'}; font-weight: 700;">
                        ${isGlobal ? '🌐 Global Master' : `🏫 Private (${c.institute_name || 'Institute'})`}
                      </span>
                    </td>
                    <td data-label="Parent">${c.parent_id ? (categories.find(p => p.id === c.parent_id)?.name || c.parent_id) : 'Root (Top Level)'}</td>
                    <td data-label="Description" style="color: var(--text-muted); font-size: 0.88rem;">${c.description || '-'}</td>
                    <td data-label="Actions">
                      <div class="table-action-group">
                        <button class="icon-action-btn edit-cat-btn" data-id="${c.id}" title="Edit Category">
                          <i class="ri-edit-line"></i>
                        </button>
                        <button class="icon-action-btn btn-danger delete-cat-btn" data-id="${c.id}" title="Delete Category">
                          <i class="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      content.querySelectorAll('.edit-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = categories.find(c => c.id == btn.dataset.id);
          showCategoryForm(cat);
        });
      });

      content.querySelectorAll('.delete-cat-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete category?')) {
            try {
              await api.deleteCategory(btn.dataset.id);
              loadData();
            } catch (e) { alert(e.message); }
          }
        });
      });

    } else if (activeTab === 'tags') {
      if (tags.length === 0) {
        content.innerHTML = '<div class="card" style="padding:30px; text-align:center; color:var(--text-muted);">No tags created yet. Click "+ Create Tag" to add tags.</div>';
        return;
      }

      content.innerHTML = `
        <div class="card" style="padding: 24px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 16px;">Tag Dictionary (Global & Institute Private)</h3>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${tags.map(t => {
              const isGlobal = !t.institute_id || t.is_global;
              return `
              <div style="background: var(--bg-color); border: 1.5px solid var(--border-color); border-radius: var(--radius-pill); padding: 8px 16px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem;">
                <span>${isGlobal ? '🌐' : '🏫'} #${t.name}</span>
                <button class="btn-delete-tag" data-id="${t.id}" data-name="${t.name}" style="background: none; border: none; color: var(--danger); font-weight: 900; cursor: pointer; font-size: 1.1rem;">&times;</button>
              </div>
            `;
            }).join('')}
          </div>
        </div>
      `;

      content.querySelectorAll('.btn-delete-tag').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm(`Delete tag "${btn.dataset.name}"?`)) {
            try {
              await api.deleteTag(btn.dataset.id);
              loadData();
            } catch (e) { alert(e.message); }
          }
        });
      });
    }
  }

  btnAddCat.addEventListener('click', () => showCategoryForm(null));
  btnAddTag.addEventListener('click', async () => {
    const name = prompt('Enter new Tag name (e.g. Algebra, Tier1, PYQ):');
    if (!name) return;
    try {
      await api.createTag({ name: name.trim() });
      loadData();
    } catch (e) { alert(e.message); }
  });

  async function showCategoryForm(category = null) {
    const { getUser } = await import('../services/api.js');
    const user = getUser() || {};
    const isSuper = user.role === 'super_admin';

    const emojiPresets = ['📂', '⚛️', '🧪', '📐', '🧬', '🌍', '💻', '📘', '⚡', '🏆', '🧠', '📜'];

    const availableParents = categories.filter(c => !category || c.id !== category.id);
    const globalParents = availableParents.filter(c => !c.institute_id || c.is_global);
    const privateParents = availableParents.filter(c => c.institute_id && !c.is_global);

    let parentOptionsHtml = '<option value="">-- None (Top Level Root) --</option>';
    if (isSuper) {
      if (globalParents.length > 0) {
        parentOptionsHtml += `<optgroup label="🌐 Global Master Categories">` +
          globalParents.map(c => `<option value="${c.id}" ${category && category.parent_id === c.id ? 'selected' : ''}>${c.icon || '📂'} ${c.name}</option>`).join('') +
          `</optgroup>`;
      }
    } else {
      if (privateParents.length > 0) {
        parentOptionsHtml += `<optgroup label="🏫 My Institute Private Categories">` +
          privateParents.map(c => `<option value="${c.id}" ${category && category.parent_id === c.id ? 'selected' : ''}>${c.icon || '📂'} ${c.name}</option>`).join('') +
          `</optgroup>`;
      }
    }

    const form = document.createElement('form');
    form.innerHTML = `
      <div style="margin-bottom: 14px; padding: 10px 14px; border-radius: 8px; background: ${isSuper ? 'var(--primary-light)' : 'var(--accent-light)'}; color: ${isSuper ? 'var(--primary)' : 'var(--accent)'}; font-size: 0.85rem; font-weight: 700;">
        ${isSuper ? '🌐 Creating Global Master Category (Visible platform-wide)' : '🏫 Creating Private Category (Exclusive to your Coaching Institute)'}
      </div>

      <div class="form-group">
        <label>Category Emoji Icon</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" id="catIcon" class="form-input" style="width:80px; text-align:center; font-size:1.4rem;" value="${category ? (category.icon || '📂') : '📂'}" required />
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${emojiPresets.map(e => `<button type="button" class="btn btn-sm btn-secondary emoji-preset-btn">${e}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Category Name *</label>
        <input type="text" id="catName" class="form-input" value="${category ? category.name : ''}" required />
      </div>
      <div class="form-group">
        <label>Parent Category (Optional)</label>
        <select id="catParent" class="form-select">
          ${parentOptionsHtml}
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="catDesc" class="form-textarea" rows="2">${category ? category.description || '' : ''}</textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:12px; font-weight:700;">${category ? 'Update Category' : 'Create Category'}</button>
    `;

    const modal = createModal({ title: category ? '✏️ Edit Category' : '➕ Add Category', content: form });

    const iconInput = form.querySelector('#catIcon');
    form.querySelectorAll('.emoji-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => { iconInput.value = btn.textContent.trim(); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const body = {
          name: form.querySelector('#catName').value.trim(),
          icon: form.querySelector('#catIcon').value.trim(),
          parent_id: form.querySelector('#catParent').value || null,
          description: form.querySelector('#catDesc').value.trim()
        };

        if (category) await api.updateCategory(category.id, body);
        else await api.createCategory(body);

        modal.close();
        loadData();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  loadData();
}
