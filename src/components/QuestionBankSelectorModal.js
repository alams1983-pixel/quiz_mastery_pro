import { apiRequest } from '../services/api.js';
import { renderMath } from '../services/katexRenderer.js';

export async function openQuestionBankSelectorModal(sectionId, sectionName, examTitle, onComplete) {
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-backdrop fade-in';
  modalContainer.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `;

  modalContainer.innerHTML = `
    <div class="card" style="width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 4px;">➕ Assign Questions from Master Question Bank</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            Exam: <strong>${examTitle}</strong> ➔ Section: <strong>${sectionName}</strong>
          </p>
        </div>
        <button id="close-selector-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer;">&times;</button>
      </div>

      <!-- Filter Controls Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Category Filter</label>
          <select id="selector-filter-cat" class="form-control">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Difficulty</label>
          <select id="selector-filter-diff" class="form-control">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="selector-filter-search" class="form-control" placeholder="Search master questions...">
        </div>
      </div>

      <!-- Action Sub-header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <label style="font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <input type="checkbox" id="selector-select-all" style="width: 16px; height: 16px;">
          <span>Select All Filtered Questions</span>
        </label>
        <span id="selector-selected-count" style="font-size: 0.88rem; font-weight: 700; color: var(--primary);">0 questions selected</span>
      </div>

      <!-- Questions List Area -->
      <div id="selector-questions-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding-right: 6px;">
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          Loading Master Question Bank...
        </div>
      </div>

      <!-- Modal Footer -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 14px;">
        <button id="cancel-selector-modal" class="btn btn-outline">Cancel</button>
        <button id="submit-attach-selected" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
          <i class="ri-link"></i> Attach Selected Questions to Section
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // State
  let masterQuestions = [];
  let selectedQIds = new Set();

  try {
    // Load categories for filter
    const [catRes, qRes] = await Promise.all([
      apiRequest('/categories').catch(() => ({ flatCategories: [] })),
      apiRequest(`/exams/questions/all?section_id=${sectionId}`)
    ]);

    const catSelect = modalContainer.querySelector('#selector-filter-cat');
    if (catSelect) {
      catSelect.innerHTML = '<option value="">-- All Categories --</option>' +
        (catRes.flatCategories || []).map(c => `<option value="${c.id}">${c.icon || '📂'} ${c.name}</option>`).join('');
    }

    masterQuestions = qRes.questions || [];

    // Pre-select questions that are already attached
    masterQuestions.forEach(q => {
      if (q.is_attached) {
        selectedQIds.add(q.id);
      }
    });

    renderList();
  } catch (err) {
    console.error('Error opening question bank selector modal:', err);
  }

  function renderList() {
    const listEl = modalContainer.querySelector('#selector-questions-list');
    const catVal = modalContainer.querySelector('#selector-filter-cat').value;
    const diffVal = modalContainer.querySelector('#selector-filter-diff').value;
    const searchVal = modalContainer.querySelector('#selector-filter-search').value.toLowerCase().trim();

    const filtered = masterQuestions.filter(q => {
      if (catVal && q.category_id != catVal) return false;
      if (diffVal && q.difficulty !== diffVal) return false;
      if (searchVal && !(q.question_text_en.toLowerCase().includes(searchVal) || (q.question_text_hi && q.question_text_hi.toLowerCase().includes(searchVal)))) return false;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          No master questions found matching the selected filters.
        </div>
      `;
      updateSelectedCount();
      return;
    }

    listEl.innerHTML = filtered.map(q => {
      const isChecked = selectedQIds.has(q.id);
      return `
        <div class="card" style="padding: 12px 16px; border: 1px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}; background: ${isChecked ? 'var(--primary-light)' : 'var(--card-bg)'}; border-radius: 8px;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <input type="checkbox" class="q-select-cb" data-id="${q.id}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; margin-top: 3px; cursor: pointer;">
            <div style="flex: 1;">
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">#${q.id}</span>
                ${q.category_name ? `<span class="badge-tag" style="font-size: 0.72rem;">${q.category_icon || '📂'} ${q.category_name}</span>` : ''}
                <span class="badge-tag" style="font-size: 0.72rem; text-transform: capitalize;">${q.difficulty}</span>
                ${q.is_attached ? `<span class="badge-tag" style="font-size: 0.72rem; background: var(--success); color: white;">✓ Currently in Section</span>` : ''}
              </div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;" class="katex-render">
                ${q.question_text_en}
              </div>
              <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                ${(q.options_en || []).map((opt, idx) => `
                  <span><strong>${String.fromCharCode(65 + idx)}:</strong> <span class="katex-render">${opt}</span></span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    renderMath(listEl);

    listEl.querySelectorAll('.q-select-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = parseInt(cb.dataset.id, 10);
        if (cb.checked) {
          selectedQIds.add(id);
        } else {
          selectedQIds.delete(id);
        }
        updateSelectedCount();
      });
    });

    updateSelectedCount();
  }

  function updateSelectedCount() {
    const countEl = modalContainer.querySelector('#selector-selected-count');
    if (countEl) {
      countEl.textContent = `${selectedQIds.size} question(s) selected`;
    }
  }

  // Filter events
  ['#selector-filter-cat', '#selector-filter-diff'].forEach(sel => {
    const el = modalContainer.querySelector(sel);
    if (el) el.addEventListener('change', renderList);
  });

  const searchInput = modalContainer.querySelector('#selector-filter-search');
  if (searchInput) searchInput.addEventListener('input', renderList);

  const selectAllCb = modalContainer.querySelector('#selector-select-all');
  if (selectAllCb) {
    selectAllCb.addEventListener('change', () => {
      const listEl = modalContainer.querySelector('#selector-questions-list');
      listEl.querySelectorAll('.q-select-cb').forEach(cb => {
        cb.checked = selectAllCb.checked;
        const id = parseInt(cb.dataset.id, 10);
        if (selectAllCb.checked) selectedQIds.add(id);
        else selectedQIds.delete(id);
      });
      renderList();
    });
  }

  // Close handlers
  const closeModal = () => modalContainer.remove();
  modalContainer.querySelector('#close-selector-modal').addEventListener('click', closeModal);
  modalContainer.querySelector('#cancel-selector-modal').addEventListener('click', closeModal);

  // Submit Attach Selected
  modalContainer.querySelector('#submit-attach-selected').addEventListener('click', async () => {
    if (selectedQIds.size === 0) {
      alert('Please select at least 1 question from the Master Question Bank to attach.');
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
}
