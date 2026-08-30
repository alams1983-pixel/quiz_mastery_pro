import { apiRequest } from '../services/api.js';
import { renderMath } from '../services/katexRenderer.js';
import { showLoadingOverlay, hideLoadingOverlay } from '../components/LoadingOverlayModal.js';

let cachedBankCategories = [];
let cachedBankTags = [];
let cachedBankQuestions = [];
let currentNavigateFn = null;
let activeScope = 'all'; // 'all', 'global', 'mine'

let currentPage = 1;
let currentLimit = 20;
let paginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
};

let searchDebounceTimer = null;

export function renderExamQuestionBankView(navigate, params = {}) {
  currentNavigateFn = typeof navigate === 'function' ? navigate : null;
  currentPage = 1;

  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <!-- Header & Action Buttons -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">📚 Master Question Repository</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Central independent repository of questions with server-side pagination, multi-language support, KaTeX math, dynamic tags, and category hierarchy.
        </p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btn-bank-add" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;" title="Add New Master Question" aria-label="Add New Master Question">
          <i class="ri-add-circle-line"></i> <span class="btn-text-desktop">Add New Master Question</span>
        </button>
        <button id="btn-bank-bulk" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;" title="Bulk Import Master Questions" aria-label="Bulk Import Master Questions">
          <i class="ri-upload-2-line"></i> <span class="btn-text-desktop">Bulk Import Master Questions</span>
        </button>
      </div>
    </div>

    <!-- Scope Filter Tabs (All / Global / Private) -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 2px;">
      <button id="scope-tab-all" class="scope-tab-btn active" style="font-weight: 700; padding: 8px 16px; border-bottom: 3px solid var(--primary); background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; color: var(--primary);">
        <i class="ri-file-list-3-line"></i> All Questions
      </button>
      <button id="scope-tab-global" class="scope-tab-btn" style="font-weight: 700; padding: 8px 16px; background: none; border: none; cursor: pointer; color: var(--text-muted);">
        🌐 Global Master Questions
      </button>
      <button id="scope-tab-mine" class="scope-tab-btn" style="font-weight: 700; padding: 8px 16px; background: none; border: none; cursor: pointer; color: var(--text-muted);">
        🏫 My Institute Private Questions
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="card" style="padding: 18px; margin-bottom: 20px; background: var(--card-bg);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-items: center;">
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Category (Hierarchy)</label>
          <select id="filter-category" class="form-control">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Difficulty Level</label>
          <select id="filter-difficulty" class="form-control">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Question Tags</label>
          <select id="filter-tag" class="form-control">
            <option value="">-- All Tags --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="filter-search" class="form-control" placeholder="Search text, options, explanation...">
        </div>
      </div>
    </div>

    <!-- Top Pagination Bar Container -->
    <div id="top-pagination-container" style="margin-bottom: 16px;"></div>

    <!-- Question Bank Container -->
    <div id="questions-list-container" style="display: flex; flex-direction: column; gap: 16px;">
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Loading master question bank...
      </div>
    </div>

    <!-- Bottom Pagination Bar Container -->
    <div id="bottom-pagination-container" style="margin-top: 20px;"></div>
  `;

  loadData(container, params);
  setupEvents(container);
  return container;
}

async function loadData(container, params = {}) {
  const catVal = container.querySelector('#filter-category')?.value || '';
  const diffVal = container.querySelector('#filter-difficulty')?.value || '';
  const tagVal = container.querySelector('#filter-tag')?.value || '';
  const searchVal = container.querySelector('#filter-search')?.value.trim() || '';

  showLoadingOverlay('Loading Master Question Repository...', 'Fetching page & metadata from central repository...');

  try {
    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: currentLimit,
      scope: activeScope
    });

    if (catVal) queryParams.append('category_id', catVal);
    if (diffVal) queryParams.append('difficulty', diffVal);
    if (tagVal) queryParams.append('tag', tagVal);
    if (searchVal) queryParams.append('search', searchVal);

    const [qRes, catRes, tagRes] = await Promise.all([
      apiRequest(`/exams/questions/all?${queryParams.toString()}`),
      cachedBankCategories.length > 0 ? Promise.resolve({ flatCategories: cachedBankCategories }) : apiRequest('/categories').catch(() => ({ flatCategories: [] })),
      cachedBankTags.length > 0 ? Promise.resolve({ tags: cachedBankTags }) : apiRequest('/tags').catch(() => ({ tags: [] }))
    ]);

    cachedBankQuestions = qRes.questions || [];
    paginationMeta = qRes.pagination || { total: cachedBankQuestions.length, page: currentPage, limit: currentLimit, totalPages: 1 };
    cachedBankCategories = catRes.flatCategories || [];
    cachedBankTags = tagRes.tags || [];

    populateFilters(container);
    renderPaginationBars(container);
    renderQuestionsList(container, cachedBankQuestions);
  } catch (err) {
    console.error('Failed to load question bank data:', err);
  } finally {
    hideLoadingOverlay();
  }
}

function buildHierarchicalCategoryOptions(categories) {
  const map = new Map();
  categories.forEach(c => map.set(c.id, { ...c, children: [] }));

  const roots = [];
  categories.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id).children.push(map.get(c.id));
    } else {
      roots.push(map.get(c.id));
    }
  });

  const options = [];
  function traverse(node, depth = 0) {
    const indent = depth > 0 ? '— '.repeat(depth) : '';
    options.push({
      id: node.id,
      label: `${indent}${node.icon || '📂'} ${node.name}`
    });
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  }

  roots.forEach(root => traverse(root, 0));
  return options;
}

function populateFilters(container) {
  const catSel = container.querySelector('#filter-category');
  const tagSel = container.querySelector('#filter-tag');

  if (catSel && catSel.options.length <= 1) {
    const hierarchicalOpts = buildHierarchicalCategoryOptions(cachedBankCategories);
    catSel.innerHTML = '<option value="">-- All Categories (Hierarchy) --</option>' +
      hierarchicalOpts.map(o => `<option value="${o.id}">${o.label}</option>`).join('');
  }

  if (tagSel && tagSel.options.length <= 1) {
    tagSel.innerHTML = '<option value="">-- All Tags --</option>' +
      cachedBankTags.map(t => `<option value="${t.name}">🏷️ ${t.name}</option>`).join('');
  }
}

function renderPaginationBars(container) {
  const topBox = container.querySelector('#top-pagination-container');
  const bottomBox = container.querySelector('#bottom-pagination-container');

  const { total, page, limit, totalPages } = paginationMeta;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  const paginationHtml = `
    <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:12px 18px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <div style="font-size:0.88rem; color:var(--text-muted); font-weight:600;">
        Showing <strong style="color:var(--text-main);">${startItem}–${endItem}</strong> of <strong style="color:var(--primary);">${total.toLocaleString()}</strong> questions
      </div>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm btn-page-first" ${page <= 1 ? 'disabled' : ''} style="font-weight:700;">
          <i class="ri-skip-left-line"></i> First
        </button>
        <button class="btn btn-outline btn-sm btn-page-prev" ${page <= 1 ? 'disabled' : ''} style="font-weight:700;">
          <i class="ri-arrow-left-s-line"></i> Prev
        </button>

        <span style="font-size:0.88rem; font-weight:700; color:var(--text-main); padding:0 4px;">
          Page ${page} of ${totalPages}
        </span>

        <button class="btn btn-outline btn-sm btn-page-next" ${page >= totalPages ? 'disabled' : ''} style="font-weight:700;">
          Next <i class="ri-arrow-right-s-line"></i>
        </button>
        <button class="btn btn-outline btn-sm btn-page-last" ${page >= totalPages ? 'disabled' : ''} style="font-weight:700;">
          Last <i class="ri-skip-right-line"></i>
        </button>

        <select class="form-control select-page-limit" style="width: auto; padding: 4px 8px; font-size: 0.85rem; font-weight:700;">
          <option value="20" ${limit === 20 ? 'selected' : ''}>20 / page</option>
          <option value="50" ${limit === 50 ? 'selected' : ''}>50 / page</option>
          <option value="100" ${limit === 100 ? 'selected' : ''}>100 / page</option>
          <option value="200" ${limit === 200 ? 'selected' : ''}>200 / page</option>
        </select>
      </div>
    </div>
  `;

  if (topBox) topBox.innerHTML = paginationHtml;
  if (bottomBox) bottomBox.innerHTML = paginationHtml;

  // Attach Pagination Button Listeners
  [topBox, bottomBox].forEach(box => {
    if (!box) return;

    box.querySelector('.btn-page-first')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage = 1; loadData(container); }
    });
    box.querySelector('.btn-page-prev')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; loadData(container); }
    });
    box.querySelector('.btn-page-next')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; loadData(container); }
    });
    box.querySelector('.btn-page-last')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage = totalPages; loadData(container); }
    });
    box.querySelector('.select-page-limit')?.addEventListener('change', (e) => {
      currentLimit = parseInt(e.target.value, 10) || 20;
      currentPage = 1;
      loadData(container);
    });
  });
}

function renderQuestionsList(container, list) {
  const listContainer = container.querySelector('#questions-list-container');
  if (!listContainer) return;

  if (!list || list.length === 0) {
    listContainer.innerHTML = `
      <div class="card" style="padding: 36px; text-align: center; color: var(--text-muted);">
        No master questions found matching the selected filters.
      </div>
    `;
    return;
  }

  const startOffset = (paginationMeta.page - 1) * paginationMeta.limit;

  listContainer.innerHTML = list.map((q, idx) => {
    const tagsArr = Array.isArray(q.tags) && q.tags.length > 0
      ? q.tags
      : (q.tag_names ? q.tag_names.split(',').map(t => t.trim()) : []);

    const tagBadges = tagsArr.map(t => `
      <span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color); font-weight:600;">🏷️ ${t}</span>
    `).join('');

    const isGlobal = !!q.is_global;

    const optsEn = q.options_en || [];
    const optsHi = q.options_hi || [];
    const optsImgs = q.options_images || [];

    return `
      <div class="card" style="padding: 20px; border-left: 4px solid ${isGlobal ? 'var(--primary)' : 'var(--accent)'}; background: ${isGlobal ? 'rgba(59, 130, 246, 0.02)' : 'var(--card-bg)'};">
        <!-- Top Badges & Actions Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="badge-tag" style="background: var(--primary-light); color: var(--primary); font-weight: 700;">
              ${q.category_icon || '📂'} ${q.category_name || 'General'}
            </span>
            <span class="badge-tag" style="background: ${isGlobal ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)'}; color: ${isGlobal ? 'var(--primary)' : 'var(--accent)'}; font-weight:800; border: 1px solid ${isGlobal ? 'var(--primary)' : 'var(--accent)'};">
              ${isGlobal ? '🌐 Global Master (Super Admin)' : '🏫 Private (Institute)'}
            </span>
            <span class="badge-tag" style="text-transform: capitalize; font-weight: 700; color: ${q.difficulty === 'hard' ? 'var(--danger)' : (q.difficulty === 'easy' ? 'var(--success)' : 'var(--accent)')};">
              ⚡ ${q.difficulty || 'medium'}
            </span>
            ${tagBadges}
          </div>

          <div class="table-action-group" style="display:flex; gap:6px;">
            ${isGlobal ? `
              <button class="btn btn-outline btn-sm btn-dup-q" data-id="${q.id}" title="Duplicate to My Bank (Create Private Copy)" style="font-size:0.8rem; padding:4px 8px;">
                <i class="ri-file-copy-line"></i> Duplicate to My Bank
              </button>
            ` : ''}
            <button class="icon-action-btn btn-edit-q" data-id="${q.id}" title="Edit Master Question">
              <i class="ri-edit-line"></i>
            </button>
            <button class="icon-action-btn btn-danger btn-del-q" data-id="${q.id}" title="Delete Master Question">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Comprehension Passage (If Available) -->
        ${(q.passage_text_en || q.passage_text_hi || q.passage_image_url) ? `
          <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary); margin-bottom: 6px;">
              📖 Comprehension Passage:
            </div>
            ${q.passage_text_en ? `<div style="font-size: 0.9rem; margin-bottom: 6px; white-space: pre-line;" class="katex-render">${q.passage_text_en}</div>` : ''}
            ${q.passage_text_hi ? `<div style="font-size: 0.88rem; color: var(--text-muted); white-space: pre-line;" class="katex-render">हिंदी: ${q.passage_text_hi}</div>` : ''}
            ${q.passage_image_url ? `<div style="margin-top: 8px;"><img src="${q.passage_image_url}" alt="Passage Image" style="max-width: 100%; max-height: 220px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>` : ''}
          </div>
        ` : ''}

        <!-- Question Text (English & Hindi) -->
        <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 8px; color: var(--text-main); white-space: pre-line;" class="katex-render">Q${startOffset + idx + 1}. ${q.question_text_en}</div>
        ${q.question_text_hi ? `<div style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 12px; white-space: pre-line;" class="katex-render">हिंदी: ${q.question_text_hi}</div>` : ''}
        ${q.image_url ? `<div style="margin-bottom: 12px;"><img src="${q.image_url}" alt="Question Diagram" style="max-width: 100%; max-height: 220px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>` : ''}

        <!-- Options Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 14px;">
          ${optsEn.map((opt, oIdx) => {
            const isCorrect = oIdx === q.correct_option_index;
            const optHiText = optsHi[oIdx] || '';
            const optImgUrl = optsImgs[oIdx] || '';

            return `
              <div style="padding: 10px 12px; border-radius: 8px; border: 1px solid ${isCorrect ? 'var(--success)' : 'var(--border-color)'}; background: ${isCorrect ? 'rgba(34,197,94,0.08)' : 'var(--bg-color)'}; font-size: 0.9rem;">
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <strong style="color: ${isCorrect ? 'var(--success)' : 'var(--primary)'}; width: 24px;">
                    ${String.fromCharCode(65 + oIdx)}:
                  </strong>
                  <div style="flex: 1;">
                    <div style="white-space: pre-line;" class="katex-render">${opt}</div>
                    ${optHiText ? `<div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; white-space: pre-line;" class="katex-render">${optHiText}</div>` : ''}
                    ${optImgUrl ? `<div style="margin-top: 4px;"><img src="${optImgUrl}" alt="Option ${String.fromCharCode(65 + oIdx)}" style="max-width: 100%; max-height: 120px; border-radius: 4px;" onerror="this.style.display='none'" /></div>` : ''}
                  </div>
                  ${isCorrect ? '<span style="color:var(--success); font-weight:bold; font-size:1.1rem;">✓</span>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Solution Explanation -->
        ${(q.explanation_en || q.explanation_hi || q.explanation_image_url) ? `
          <div style="font-size: 0.88rem; color: var(--text-muted); background: var(--bg-color); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">💡 Solution Explanation:</div>
            ${q.explanation_en ? `<div style="white-space: pre-line; margin-bottom: 4px;" class="katex-render">${q.explanation_en}</div>` : ''}
            ${q.explanation_hi ? `<div style="white-space: pre-line; color: var(--text-muted);" class="katex-render">हिंदी: ${q.explanation_hi}</div>` : ''}
            ${q.explanation_image_url ? `<div style="margin-top: 6px;"><img src="${q.explanation_image_url}" alt="Explanation Diagram" style="max-width: 100%; max-height: 200px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  renderMath(listContainer);

  // Attach Handlers
  listContainer.querySelectorAll('.btn-edit-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.dataset.id;
      if (typeof currentNavigateFn === 'function') {
        currentNavigateFn('question-editor', { questionId: qId, returnView: 'exam-questions' });
      }
    });
  });

  listContainer.querySelectorAll('.btn-del-q').forEach(btn => {
    btn.addEventListener('click', async () => {
      const qId = btn.dataset.id;
      if (confirm('Are you sure you want to delete this master question?')) {
        try {
          await apiRequest(`/exams/questions/${qId}`, { method: 'DELETE' });
          loadData(container);
        } catch (err) {
          alert(err.message || 'Error deleting master question.');
        }
      }
    });
  });

  listContainer.querySelectorAll('.btn-dup-q').forEach(btn => {
    btn.addEventListener('click', async () => {
      const qId = btn.dataset.id;
      const target = cachedBankQuestions.find(q => q.id == qId);
      if (!target) return;

      if (confirm('Duplicate this Global Master question to your institute private question bank?')) {
        try {
          const payload = {
            category_id: target.category_id,
            difficulty: target.difficulty,
            passage_text_en: target.passage_text_en || '',
            passage_text_hi: target.passage_text_hi || '',
            passage_image_url: target.passage_image_url || '',
            question_text_en: target.question_text_en,
            question_text_hi: target.question_text_hi || '',
            image_url: target.image_url || '',
            options_en: target.options_en || [],
            options_hi: target.options_hi || [],
            options_images: target.options_images || [],
            correct_option_index: target.correct_option_index || 0,
            explanation_en: target.explanation_en || '',
            explanation_hi: target.explanation_hi || '',
            explanation_image_url: target.explanation_image_url || '',
            is_global: false,
            tags: target.tags || (target.tag_names ? target.tag_names.split(',').map(t => t.trim()) : [])
          };

          await apiRequest('/exams/questions', {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          alert('Question duplicated to your Private Bank successfully!');
          loadData(container);
        } catch (err) {
          alert(err.message || 'Failed to duplicate question.');
        }
      }
    });
  });
}

function setupEvents(container) {
  // Scope Tabs Switching
  const scopeTabs = [
    { id: '#scope-tab-all', scope: 'all' },
    { id: '#scope-tab-global', scope: 'global' },
    { id: '#scope-tab-mine', scope: 'mine' }
  ];

  scopeTabs.forEach(tabInfo => {
    const btn = container.querySelector(tabInfo.id);
    if (btn) {
      btn.addEventListener('click', () => {
        activeScope = tabInfo.scope;
        container.querySelectorAll('.scope-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.style.borderBottom = 'none';
          b.style.color = 'var(--text-muted)';
        });
        btn.classList.add('active');
        btn.style.borderBottom = '3px solid var(--primary)';
        btn.style.color = 'var(--primary)';
        currentPage = 1;
        loadData(container);
      });
    }
  });

  ['#filter-category', '#filter-difficulty', '#filter-tag'].forEach(sel => {
    const el = container.querySelector(sel);
    if (el) el.addEventListener('change', () => {
      currentPage = 1;
      loadData(container);
    });
  });

  const searchInp = container.querySelector('#filter-search');
  if (searchInp) {
    searchInp.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        currentPage = 1;
        loadData(container);
      }, 300);
    });
  }

  const btnAdd = container.querySelector('#btn-bank-add');
  const btnBulk = container.querySelector('#btn-bank-bulk');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (typeof currentNavigateFn === 'function') {
        currentNavigateFn('question-editor', { returnView: 'exam-questions' });
      }
    });
  }

  if (btnBulk) {
    btnBulk.addEventListener('click', async () => {
      const { renderBulkUploadModal } = await import('../components/BulkUploadModal.js');
      renderBulkUploadModal(null, 'question_bank', () => loadData(container));
    });
  }
}
