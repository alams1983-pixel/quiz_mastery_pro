import { apiRequest } from '../services/api.js';
import { renderMath } from '../services/katexRenderer.js';

let cachedBankExams = [];
let cachedBankCategories = [];
let cachedBankQuestions = [];
let currentNavigateFn = null;

export function renderExamQuestionBankView(navigate, params = {}) {
  currentNavigateFn = typeof navigate === 'function' ? navigate : null;

  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">📚 Master Question Repository</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Manage your institute's central question bank with taxonomy validation, multi-language support, line breaks, and hybrid image+text content.
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

    <!-- Filters Bar -->
    <div class="card" style="padding: 18px; margin-bottom: 24px; background: var(--card-bg);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-items: center;">
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Filter by Category</label>
          <select id="filter-category" class="form-control">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Filter by Exam</label>
          <select id="filter-exam" class="form-control">
            <option value="">-- All Exams --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Filter by Difficulty</label>
          <select id="filter-difficulty" class="form-control">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="filter-search" class="form-control" placeholder="Search text, explanation, passage...">
        </div>
      </div>
    </div>

    <!-- Question Bank Container -->
    <div id="questions-list-container" style="display: flex; flex-direction: column; gap: 16px;">
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Loading master question bank...
      </div>
    </div>
  `;

  // Internal State & Handlers
  loadData(container, params);

  return container;
}

async function loadData(container, params = {}) {
  try {
    const [examsRes, qRes, catRes] = await Promise.all([
      apiRequest('/exams'),
      apiRequest('/exams/questions/all'),
      apiRequest('/categories').catch(() => ({ flatCategories: [] }))
    ]);

    cachedBankExams = examsRes.exams || [];
    cachedBankQuestions = qRes.questions || [];
    cachedBankCategories = catRes.flatCategories || [];

    populateFilters(container);
    renderQuestionsList(container, cachedBankQuestions);
    setupEvents(container);

    if (params.examId) {
      const examSel = container.querySelector('#filter-exam');
      if (examSel) {
        examSel.value = params.examId;
        applyFilters(container);
      }
    }
  } catch (err) {
    console.error('Failed to load question bank data:', err);
  }
}

function populateFilters(container) {
  const catSel = container.querySelector('#filter-category');
  const examSel = container.querySelector('#filter-exam');

  if (catSel) {
    catSel.innerHTML = '<option value="">-- All Categories --</option>' +
      cachedBankCategories.map(c => `<option value="${c.id}">${c.icon || '📂'} ${c.name}</option>`).join('');
  }

  if (examSel) {
    examSel.innerHTML = '<option value="">-- All Exams --</option>' +
      cachedBankExams.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
  }
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

  listContainer.innerHTML = list.map((q, idx) => {
    const tagBadges = q.tag_names
      ? q.tag_names.split(',').map(t => `<span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color);">🏷️ ${t.trim()}</span>`).join('')
      : '';

    const optsEn = q.options_en || [];
    const optsHi = q.options_hi || [];
    const optsImgs = q.options_images || [];

    return `
      <div class="card" style="padding: 20px; border-left: 4px solid var(--primary);">
        <!-- Top Badges & Actions Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="badge-tag" style="background: var(--primary-light); color: var(--primary); font-weight: 700;">
              ${q.category_icon || '📂'} ${q.category_name || 'General'}
            </span>
            <span class="badge-tag" style="background: ${q.is_global ? 'var(--primary-light)' : 'var(--accent-light)'}; color: ${q.is_global ? 'var(--primary)' : 'var(--accent)'}; font-weight:700;">
              ${q.is_global ? '🌐 Global' : '🏫 Private'}
            </span>
            <span class="badge-tag" style="text-transform: capitalize; font-weight: 700; color: ${q.difficulty === 'hard' ? 'var(--danger)' : (q.difficulty === 'easy' ? 'var(--success)' : 'var(--accent)')};">
              ⚡ ${q.difficulty || 'medium'}
            </span>
            ${tagBadges}
          </div>

          <div class="table-action-group">
            <button class="icon-action-btn btn-edit-q" data-id="${q.id}" title="Edit Question (Math & Image Editor)">
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

        <!-- Question Text (English & Hindi) with Line Breaks -->
        <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 8px; color: var(--text-main); white-space: pre-line;" class="katex-render">Q${idx + 1}. ${q.question_text_en}</div>
        ${q.question_text_hi ? `<div style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 12px; white-space: pre-line;" class="katex-render">हिंदी: ${q.question_text_hi}</div>` : ''}
        ${q.image_url ? `<div style="margin-bottom: 12px;"><img src="${q.image_url}" alt="Question Diagram" style="max-width: 100%; max-height: 220px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>` : ''}

        <!-- Options Grid (Dynamic 2-6 Choices) -->
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

        <!-- Explanation Section -->
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

  // Attach Edit and Delete handlers
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
          alert('Error deleting master question.');
        }
      }
    });
  });
}

function applyFilters(container) {
  const catId = container.querySelector('#filter-category').value;
  const examId = container.querySelector('#filter-exam').value;
  const diff = container.querySelector('#filter-difficulty').value;
  const search = container.querySelector('#filter-search').value.toLowerCase().trim();

  let filtered = cachedBankQuestions.filter(q => {
    if (catId && q.category_id != catId) return false;
    if (examId && q.exam_id != examId) return false;
    if (diff && q.difficulty !== diff) return false;

    if (search) {
      const matchEn = q.question_text_en && q.question_text_en.toLowerCase().includes(search);
      const matchHi = q.question_text_hi && q.question_text_hi.toLowerCase().includes(search);
      const matchExpEn = q.explanation_en && q.explanation_en.toLowerCase().includes(search);
      const matchExpHi = q.explanation_hi && q.explanation_hi.toLowerCase().includes(search);
      const matchPassEn = q.passage_text_en && q.passage_text_en.toLowerCase().includes(search);
      const matchPassHi = q.passage_text_hi && q.passage_text_hi.toLowerCase().includes(search);
      const matchTags = q.tag_names && q.tag_names.toLowerCase().includes(search);

      if (!matchEn && !matchHi && !matchExpEn && !matchExpHi && !matchPassEn && !matchPassHi && !matchTags) {
        return false;
      }
    }
    return true;
  });

  renderQuestionsList(container, filtered);
}

function setupEvents(container) {
  ['#filter-category', '#filter-exam', '#filter-difficulty'].forEach(sel => {
    const el = container.querySelector(sel);
    if (el) el.addEventListener('change', () => applyFilters(container));
  });

  const searchInp = container.querySelector('#filter-search');
  if (searchInp) searchInp.addEventListener('input', () => applyFilters(container));

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
