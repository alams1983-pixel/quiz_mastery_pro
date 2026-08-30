import { apiRequest } from '../services/api.js';
import { renderMath } from '../services/katexRenderer.js';
import { showLoadingOverlay, hideLoadingOverlay } from './LoadingOverlayModal.js';

export async function openQuestionBankSelectorModal(sectionId, sectionName, examTitle, onComplete) {
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-backdrop fade-in';
  modalContainer.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `;

  modalContainer.innerHTML = `
    <div class="card" style="width: 100%; max-width: 920px; max-height: 92vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 4px; color: var(--text-main);">
            ➕ Assign Private Questions to Exam Section
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
            Exam: <strong>${examTitle}</strong> ➔ Section: <strong>${sectionName}</strong> • (Private Questions Only)
          </p>
        </div>
        <button id="close-selector-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <!-- Filter Controls Bar (4-Way Filters) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px; background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Category (Hierarchy)</label>
          <select id="selector-filter-cat" class="form-control" style="font-size: 0.82rem;">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Difficulty</label>
          <select id="selector-filter-diff" class="form-control" style="font-size: 0.82rem;">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Question Tag</label>
          <select id="selector-filter-tag" class="form-control" style="font-size: 0.82rem;">
            <option value="">-- All Tags --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="selector-filter-search" class="form-control" placeholder="Search questions..." style="font-size: 0.82rem;">
        </div>
      </div>

      <!-- Action & Selection Info Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
        <label style="font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-main);">
          <input type="checkbox" id="selector-select-all-page" style="width: 16px; height: 16px; cursor: pointer;">
          <span>Select All Questions on This Page</span>
        </label>
        <span id="selector-selected-count" style="font-size: 0.88rem; font-weight: 800; color: var(--primary);">0 question(s) selected</span>
      </div>

      <!-- Questions List Area -->
      <div id="selector-questions-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; padding-right: 4px; min-height: 220px;">
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          Loading Private Question Bank...
        </div>
      </div>

      <!-- Bottom Pagination Bar -->
      <div id="selector-bottom-pagination" style="margin-bottom: 14px;"></div>

      <!-- Modal Footer -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 14px;">
        <button id="cancel-selector-modal" class="btn btn-outline">Cancel</button>
        <button id="submit-attach-selected" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
          <i class="ri-link"></i> Attach Selected Questions to Section
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // Modal State
  let currentPage = 1;
  let currentLimit = 20;
  let paginationMeta = { total: 0, page: 1, limit: 20, totalPages: 1 };

  let masterQuestions = [];
  let selectedQIds = new Set();
  let initialPreSelectDone = false;

  let cachedCategories = [];
  let cachedTags = [];
  let searchDebounceTimer = null;

  async function loadModalData() {
    const catVal = modalContainer.querySelector('#selector-filter-cat')?.value || '';
    const diffVal = modalContainer.querySelector('#selector-filter-diff')?.value || '';
    const tagVal = modalContainer.querySelector('#selector-filter-tag')?.value || '';
    const searchVal = modalContainer.querySelector('#selector-filter-search')?.value.trim() || '';

    showLoadingOverlay('Loading Private Question Bank...', 'Fetching questions & metadata...');

    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: currentLimit,
        scope: 'mine',
        section_id: sectionId
      });

      if (catVal) queryParams.append('category_id', catVal);
      if (diffVal) queryParams.append('difficulty', diffVal);
      if (tagVal) queryParams.append('tag', tagVal);
      if (searchVal) queryParams.append('search', searchVal);

      const [qRes, catRes, tagRes] = await Promise.all([
        apiRequest(`/exams/questions/all?${queryParams.toString()}`),
        cachedCategories.length > 0 ? Promise.resolve({ flatCategories: cachedCategories }) : apiRequest('/categories').catch(() => ({ flatCategories: [] })),
        cachedTags.length > 0 ? Promise.resolve({ tags: cachedTags }) : apiRequest('/tags').catch(() => ({ tags: [] }))
      ]);

      masterQuestions = qRes.questions || [];
      paginationMeta = qRes.pagination || { total: masterQuestions.length, page: currentPage, limit: currentLimit, totalPages: 1 };
      cachedCategories = catRes.flatCategories || [];
      cachedTags = tagRes.tags || [];

      // Pre-select already attached questions on initial load
      if (!initialPreSelectDone) {
        masterQuestions.forEach(q => {
          if (q.is_attached) selectedQIds.add(q.id);
        });
        initialPreSelectDone = true;
      }

      populateModalFilters();
      renderModalPaginationBars();
      renderModalQuestionsList();
    } catch (err) {
      console.error('Error loading question bank selector data:', err);
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

  function populateModalFilters() {
    const catSel = modalContainer.querySelector('#selector-filter-cat');
    const tagSel = modalContainer.querySelector('#selector-filter-tag');

    if (catSel && catSel.options.length <= 1) {
      const hierarchicalOpts = buildHierarchicalCategoryOptions(cachedCategories);
      catSel.innerHTML = '<option value="">-- All Categories (Hierarchy) --</option>' +
        hierarchicalOpts.map(o => `<option value="${o.id}">${o.label}</option>`).join('');
    }

    if (tagSel && tagSel.options.length <= 1) {
      tagSel.innerHTML = '<option value="">-- All Tags --</option>' +
        cachedTags.map(t => `<option value="${t.name}">🏷️ ${t.name}</option>`).join('');
    }
  }

  function renderModalPaginationBars() {
    const bottomBox = modalContainer.querySelector('#selector-bottom-pagination');
    if (!bottomBox) return;

    const { total, page, limit, totalPages } = paginationMeta;
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(total, page * limit);

    bottomBox.innerHTML = `
      <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:8px 12px; background:var(--card-bg); border-radius:6px; border:1px solid var(--border-color); font-size:0.82rem;">
        <div style="color:var(--text-muted); font-weight:600;">
          Showing <strong style="color:var(--text-main);">${startItem}–${endItem}</strong> of <strong style="color:var(--primary);">${total.toLocaleString()}</strong> questions
        </div>

        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm btn-page-first" ${page <= 1 ? 'disabled' : ''} style="padding:2px 8px; font-size:0.78rem;">
            <i class="ri-skip-left-line"></i> First
          </button>
          <button class="btn btn-outline btn-sm btn-page-prev" ${page <= 1 ? 'disabled' : ''} style="padding:2px 8px; font-size:0.78rem;">
            <i class="ri-arrow-left-s-line"></i> Prev
          </button>

          <span style="font-weight:700; color:var(--text-main); padding:0 2px;">
            Page ${page} of ${totalPages}
          </span>

          <button class="btn btn-outline btn-sm btn-page-next" ${page >= totalPages ? 'disabled' : ''} style="padding:2px 8px; font-size:0.78rem;">
            Next <i class="ri-arrow-right-s-line"></i>
          </button>
          <button class="btn btn-outline btn-sm btn-page-last" ${page >= totalPages ? 'disabled' : ''} style="padding:2px 8px; font-size:0.78rem;">
            Last <i class="ri-skip-right-line"></i>
          </button>

          <select class="form-control select-page-limit" style="width: auto; padding: 2px 6px; font-size: 0.78rem; font-weight:700;">
            <option value="20" ${limit === 20 ? 'selected' : ''}>20 / page</option>
            <option value="50" ${limit === 50 ? 'selected' : ''}>50 / page</option>
            <option value="100" ${limit === 100 ? 'selected' : ''}>100 / page</option>
          </select>
        </div>
      </div>
    `;

    bottomBox.querySelector('.btn-page-first')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage = 1; loadModalData(); }
    });
    bottomBox.querySelector('.btn-page-prev')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; loadModalData(); }
    });
    bottomBox.querySelector('.btn-page-next')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; loadModalData(); }
    });
    bottomBox.querySelector('.btn-page-last')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage = totalPages; loadModalData(); }
    });
    bottomBox.querySelector('.select-page-limit')?.addEventListener('change', (e) => {
      currentLimit = parseInt(e.target.value, 10) || 20;
      currentPage = 1;
      loadModalData();
    });
  }

  function renderModalQuestionsList() {
    const listEl = modalContainer.querySelector('#selector-questions-list');
    if (!listEl) return;

    if (masterQuestions.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          No private master questions found matching the selected filters.
        </div>
      `;
      updateSelectedCount();
      return;
    }

    const startOffset = (paginationMeta.page - 1) * paginationMeta.limit;

    listEl.innerHTML = masterQuestions.map((q, idx) => {
      const isChecked = selectedQIds.has(q.id);
      const tagsArr = Array.isArray(q.tags) && q.tags.length > 0
        ? q.tags
        : (q.tag_names ? q.tag_names.split(',').map(t => t.trim()) : []);

      const optsEn = q.options_en || [];
      const optsHi = q.options_hi || [];
      const optsImgs = q.options_images || [];

      const hasPassage = q.passage_text_en || q.passage_text_hi || q.passage_image_url;
      const hasExplanation = q.explanation_en || q.explanation_hi || q.explanation_image_url;

      return `
        <div class="card" style="padding: 12px 16px; border: 1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}; background: ${isChecked ? 'var(--primary-light)' : 'var(--card-bg)'}; border-radius: 8px;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <input type="checkbox" class="q-select-cb" data-id="${q.id}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; margin-top: 3px; cursor: pointer;">
            <div style="flex: 1;">
              <!-- Header Bar (Badges & Expand Toggle) -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                  <span style="font-size: 0.78rem; font-weight: 800; color: var(--primary);">#${startOffset + idx + 1}</span>
                  ${q.category_name ? `<span class="badge-tag" style="font-size: 0.72rem;">${q.category_icon || '📂'} ${q.category_name}</span>` : ''}
                  <span class="badge-tag" style="font-size: 0.72rem; text-transform: capitalize;">⚡ ${q.difficulty || 'medium'}</span>
                  ${tagsArr.map(t => `<span class="badge-tag" style="font-size: 0.72rem;">🏷️ ${t}</span>`).join('')}
                  ${q.is_attached ? `<span class="badge-tag" style="font-size: 0.72rem; background: var(--success); color: white; font-weight:700;">✓ Currently Attached</span>` : ''}
                </div>
                <button class="btn btn-outline btn-sm btn-toggle-details" data-id="${q.id}" style="padding: 2px 8px; font-size: 0.76rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                  <i class="ri-eye-line"></i> <span class="btn-text">View Details</span>
                </button>
              </div>

              <!-- Collapsed Summary Question Statement -->
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px; white-space: pre-line;" class="katex-render">
                ${q.question_text_en}
              </div>

              <!-- Collapsed Summary Options List -->
              <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                ${optsEn.map((opt, oIdx) => `
                  <span><strong>${String.fromCharCode(65 + oIdx)}:</strong> <span class="katex-render">${opt}</span></span>
                `).join('')}
              </div>

              <!-- Expandable Full Details Accordion Drawer -->
              <div id="details-container-${q.id}" class="details-accordion-drawer" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
                <!-- Comprehension Passage (If Available) -->
                ${hasPassage ? `
                  <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 0.82rem; color: var(--primary); margin-bottom: 4px;">📖 Comprehension Passage:</div>
                    ${q.passage_text_en ? `<div style="font-size: 0.88rem; margin-bottom: 4px; white-space: pre-line;" class="katex-render">${q.passage_text_en}</div>` : ''}
                    ${q.passage_text_hi ? `<div style="font-size: 0.85rem; color: var(--text-muted); white-space: pre-line;" class="katex-render">हिंदी: ${q.passage_text_hi}</div>` : ''}
                    ${q.passage_image_url ? `<div style="margin-top: 6px;"><img src="${q.passage_image_url}" alt="Passage Image" style="max-width: 100%; max-height: 180px; border-radius: 6px;" onerror="this.style.display='none'" /></div>` : ''}
                  </div>
                ` : ''}

                <!-- Hindi Question Statement (If Available) -->
                ${q.question_text_hi ? `
                  <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px; white-space: pre-line;" class="katex-render">
                    <strong>हिंदी text:</strong> ${q.question_text_hi}
                  </div>
                ` : ''}

                <!-- Question Diagram Image (If Available) -->
                ${q.image_url ? `
                  <div style="margin-bottom: 10px;">
                    <img src="${q.image_url}" alt="Question Diagram" style="max-width: 100%; max-height: 180px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" />
                  </div>
                ` : ''}

                <!-- Full Options Grid (Bilingual & Option Images) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-bottom: 12px;">
                  ${optsEn.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correct_option_index;
                    const optHiText = optsHi[oIdx] || '';
                    const optImgUrl = optsImgs[oIdx] || '';

                    return `
                      <div style="padding: 8px 10px; border-radius: 6px; border: 1px solid ${isCorrect ? 'var(--success)' : 'var(--border-color)'}; background: ${isCorrect ? 'rgba(34,197,94,0.08)' : 'var(--bg-color)'}; font-size: 0.85rem;">
                        <div style="display: flex; align-items: flex-start; gap: 6px;">
                          <strong style="color: ${isCorrect ? 'var(--success)' : 'var(--primary)'}; min-width: 20px;">
                            ${String.fromCharCode(65 + oIdx)}:
                          </strong>
                          <div style="flex: 1;">
                            <div style="white-space: pre-line;" class="katex-render">${opt}</div>
                            ${optHiText ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; white-space: pre-line;" class="katex-render">${optHiText}</div>` : ''}
                            ${optImgUrl ? `<div style="margin-top: 4px;"><img src="${optImgUrl}" alt="Option ${String.fromCharCode(65 + oIdx)}" style="max-width: 100%; max-height: 100px; border-radius: 4px;" onerror="this.style.display='none'" /></div>` : ''}
                          </div>
                          ${isCorrect ? '<span style="color:var(--success); font-weight:bold; font-size:1rem;">✓</span>' : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Solution Explanation (If Available) -->
                ${hasExplanation ? `
                  <div style="font-size: 0.85rem; color: var(--text-muted); background: var(--bg-color); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                    <div style="font-weight: 700; color: var(--text-main); margin-bottom: 2px;">💡 Solution Explanation:</div>
                    ${q.explanation_en ? `<div style="white-space: pre-line; margin-bottom: 2px;" class="katex-render">${q.explanation_en}</div>` : ''}
                    ${q.explanation_hi ? `<div style="white-space: pre-line; color: var(--text-muted);" class="katex-render">हिंदी: ${q.explanation_hi}</div>` : ''}
                    ${q.explanation_image_url ? `<div style="margin-top: 4px;"><img src="${q.explanation_image_url}" alt="Explanation Diagram" style="max-width: 100%; max-height: 160px; border-radius: 6px;" onerror="this.style.display='none'" /></div>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    renderMath(listEl);

    // Attach Toggle Details Accordion Handlers
    listEl.querySelectorAll('.btn-toggle-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.id;
        const drawer = listEl.querySelector(`#details-container-${qId}`);
        const btnText = btn.querySelector('.btn-text');
        const btnIcon = btn.querySelector('i');

        if (drawer) {
          const isHidden = drawer.style.display === 'none';
          drawer.style.display = isHidden ? 'block' : 'none';
          if (btnText) btnText.textContent = isHidden ? 'Hide Details' : 'View Details';
          if (btnIcon) btnIcon.className = isHidden ? 'ri-eye-off-line' : 'ri-eye-line';
          if (isHidden) renderMath(drawer);
        }
      });
    });

    // Attach individual checkbox change handlers
    listEl.querySelectorAll('.q-select-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = parseInt(cb.dataset.id, 10);
        if (cb.checked) {
          selectedQIds.add(id);
        } else {
          selectedQIds.delete(id);
        }
        updateSelectedCount();
        updateSelectAllPageCheckboxState();
      });
    });

    updateSelectedCount();
    updateSelectAllPageCheckboxState();
  }

  function updateSelectedCount() {
    const countEl = modalContainer.querySelector('#selector-selected-count');
    if (countEl) {
      countEl.textContent = `${selectedQIds.size} question(s) selected`;
    }
  }

  function updateSelectAllPageCheckboxState() {
    const selectAllCb = modalContainer.querySelector('#selector-select-all-page');
    if (!selectAllCb || masterQuestions.length === 0) return;
    const allOnPageChecked = masterQuestions.every(q => selectedQIds.has(q.id));
    selectAllCb.checked = allOnPageChecked;
  }

  // Filter events (Server-side paginated queries)
  ['#selector-filter-cat', '#selector-filter-diff', '#selector-filter-tag'].forEach(sel => {
    const el = modalContainer.querySelector(sel);
    if (el) {
      el.addEventListener('change', () => {
        currentPage = 1;
        loadModalData();
      });
    }
  });

  const searchInput = modalContainer.querySelector('#selector-filter-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        currentPage = 1;
        loadModalData();
      }, 300);
    });
  }

  // Select All on This Page checkbox
  const selectAllCb = modalContainer.querySelector('#selector-select-all-page');
  if (selectAllCb) {
    selectAllCb.addEventListener('change', () => {
      const listEl = modalContainer.querySelector('#selector-questions-list');
      listEl.querySelectorAll('.q-select-cb').forEach(cb => {
        cb.checked = selectAllCb.checked;
        const id = parseInt(cb.dataset.id, 10);
        if (selectAllCb.checked) selectedQIds.add(id);
        else selectedQIds.delete(id);
      });
      updateSelectedCount();
      renderModalQuestionsList();
    });
  }

  // Close handlers
  const closeModal = () => modalContainer.remove();
  modalContainer.querySelector('#close-selector-modal').addEventListener('click', closeModal);
  modalContainer.querySelector('#cancel-selector-modal').addEventListener('click', closeModal);

  // Submit Attach Selected
  modalContainer.querySelector('#submit-attach-selected').addEventListener('click', async () => {
    if (selectedQIds.size === 0) {
      alert('Please select at least 1 question from your Private Master Bank to attach.');
      return;
    }

    try {
      const res = await apiRequest(`/exams/sections/${sectionId}/attach-questions`, {
        method: 'POST',
        body: JSON.stringify({ question_ids: Array.from(selectedQIds) })
      });

      alert(res.message || 'Questions attached successfully!');
      closeModal();
      if (typeof onComplete === 'function') onComplete();
    } catch (err) {
      alert(`Error attaching questions: ${err.message}`);
    }
  });

  // Initial Load
  loadModalData();
}
