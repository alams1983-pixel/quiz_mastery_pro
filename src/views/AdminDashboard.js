import { api, apiRequest, getUser } from '../services/api.js';
import { renderMathLiveEditor } from '../components/MathLiveEditor.js';
import { openQuizBulkUploadModal } from '../components/QuizBulkUploadModal.js';
import { createModal } from '../components/Modal.js';
import { renderMath } from '../services/katexRenderer.js';

export function renderAdminDashboard(navigate) {
  const user = getUser();
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
      <div>
        <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:4px;">📚 Practice Quiz Manager</h1>
        <p style="color:var(--text-muted); font-size:0.95rem;">Create, edit, and organize self-paced practice quizzes and questions with MathLive editor.</p>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <button class="btn btn-primary" id="createQuizBtn" style="display:flex; align-items:center; gap:6px; font-weight:700;">
          <i class="ri-add-line"></i> + Create New Quiz
        </button>
      </div>
    </div>

    <!-- Main Quizzes Area -->
    <div id="adminSectionContent">
      <div id="adminQuizList" class="grid">
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          Loading practice quizzes...
        </div>
      </div>
    </div>
  `;

  const contentArea = container.querySelector('#adminSectionContent');
  container.querySelector('#createQuizBtn').addEventListener('click', () => showQuizForm());

  // Render Quizzes Management List
  async function renderQuizzesList() {
    try {
      const res = await api.getQuizzes();
      const quizzes = res.quizzes || [];
      contentArea.innerHTML = '<div id="adminQuizList" class="grid"></div>';
      const grid = contentArea.querySelector('#adminQuizList');

      if (quizzes.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            No practice quizzes found. Click "+ Create New Quiz" to get started!
          </div>
        `;
        return;
      }

      quizzes.forEach(q => {
        const card = document.createElement('div');
        card.className = 'card';

        const tagBadges = q.tag_names
          ? q.tag_names.split(',').map(t => `<span class="badge-tag">🏷️ ${t.trim()}</span>`).join('')
          : '';

        const catIcon = q.category_icon || '📂';
        const isPublic = q.is_public;
        const isPublished = q.is_published;

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
            <span style="font-size:0.8rem; font-weight:700; color:var(--primary); background:var(--primary-light); padding:3px 10px; border-radius:var(--radius-pill);">
              ${catIcon} ${q.category_name || 'General'}
            </span>
            <div style="display:flex; gap:4px; align-items:center;">
              <span class="badge-tag" style="background: ${isPublic ? 'var(--primary-light)' : 'var(--accent-light)'}; color: ${isPublic ? 'var(--primary)' : 'var(--accent)'}; font-weight:700; font-size:0.75rem;">
                ${isPublic ? '🌐 Global' : '🏫 Institute'}
              </span>
              <span class="badge-tag" style="background: ${isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isPublished ? 'var(--success)' : 'var(--danger)'}; font-weight:700; font-size:0.75rem;">
                ${isPublished ? '📢 Published' : '🔒 Draft'}
              </span>
              <span style="font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-left:4px;">
                ${q.question_count || 0} Qs
              </span>
            </div>
          </div>

          <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:6px;">${q.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); flex:1; margin-bottom:10px; line-height:1.4;">${q.description || ''}</p>
          <div style="margin-bottom:14px;">${tagBadges}</div>

          <div class="table-action-group" style="margin-top:auto;">
            <button class="icon-action-btn btn-primary-accent manage-q-btn" title="Manage Questions in Quiz">
              <i class="ri-list-check-2"></i>
            </button>
            <button class="icon-action-btn edit-quiz-btn" title="Edit Quiz Details">
              <i class="ri-edit-line"></i>
            </button>
            <button class="icon-action-btn bulk-q-btn" title="Bulk Import Questions">
              <i class="ri-upload-2-line"></i>
            </button>
            <button class="icon-action-btn btn-danger delete-quiz-btn" title="Delete Quiz">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        `;

        card.querySelector('.manage-q-btn').addEventListener('click', () => renderQuestionsManager(q.id, q.title));
        card.querySelector('.edit-quiz-btn').addEventListener('click', () => showQuizForm(q));
        card.querySelector('.bulk-q-btn').addEventListener('click', () => openQuizBulkUploadModal(q.id, () => renderQuizzesList()));
        card.querySelector('.delete-quiz-btn').addEventListener('click', async () => {
          if (confirm(`Are you sure you want to delete quiz "${q.title}"?`)) {
            try {
              await api.deleteQuiz(q.id);
              renderQuizzesList();
            } catch (err) {
              alert(err.message || 'Error deleting quiz');
            }
          }
        });

        grid.appendChild(card);
      });
    } catch (err) {
      contentArea.innerHTML = `<div style="color:var(--danger); padding:20px;">Error loading quizzes: ${err.message}</div>`;
    }
  }

  // Quiz Form Modal with Dynamic Real-Time Category Scope Filtering
  async function showQuizForm(quiz = null) {
    const isSuper = user && user.role === 'super_admin';

    const [categoriesRes, tagsRes, batchesRes] = await Promise.all([
      api.getCategories().catch(() => ({ flatCategories: [] })),
      api.getTags().catch(() => ({ tags: [] })),
      apiRequest('/exams/batches/all').catch(() => ({ batches: [] }))
    ]);

    const flatCats = categoriesRes.flatCategories || [];
    const allTags = tagsRes.tags || [];
    const allBatches = batchesRes.batches || [];

    const existingTagNames = quiz && quiz.tag_names ? quiz.tag_names.split(',').map(t => t.trim()) : [];
    const existingBatchIds = quiz && quiz.batch_ids ? quiz.batch_ids.split(',').map(b => parseInt(b.trim(), 10)) : [];

    // Separate Categories into Global Master vs Private
    const globalCats = flatCats.filter(c => !c.institute_id || c.is_global);
    const privateCats = flatCats.filter(c => c.institute_id && !c.is_global);

    const privateCatIds = new Set(privateCats.map(c => c.id.toString()));

    const form = document.createElement('form');
    form.innerHTML = `
      <div class="form-group">
        <label>Quiz Title *</label>
        <input type="text" id="qTitle" class="form-input" value="${quiz ? quiz.title : ''}" required />
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="qDesc" class="form-textarea" rows="2">${quiz ? quiz.description || '' : ''}</textarea>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Publishing Status</label>
          <select id="qPublished" class="form-select">
            <option value="1" ${!quiz || quiz.is_published ? 'selected' : ''}>📢 Published (Visible)</option>
            <option value="0" ${quiz && !quiz.is_published ? 'selected' : ''}>🔒 Draft (Hidden)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Visibility Scope</label>
          <select id="qPublic" class="form-select">
            <option value="0" ${!quiz || !quiz.is_public ? 'selected' : ''}>🏫 Institute Private (Internal Students)</option>
            <option value="1" ${quiz && quiz.is_public ? 'selected' : ''}>🌐 Global Public (All Portal Students)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Category</label>
        <select id="qCategory" class="form-select">
          <option value="">-- Select Category --</option>
          ${globalCats.length > 0 ? `
            <optgroup label="🌐 Global Master Categories (For Public & Private Quizzes)">
              ${globalCats.map(c => `<option value="${c.id}" data-type="global" ${quiz && quiz.category_id === c.id ? 'selected' : ''}>${c.icon || '📂'} ${c.name}</option>`).join('')}
            </optgroup>
          ` : ''}
          ${privateCats.length > 0 ? `
            <optgroup label="🏫 Institute Private Categories (Private Quizzes Only)" id="optgroup-private-cats">
              ${privateCats.map(c => `<option value="${c.id}" data-type="private" ${quiz && quiz.category_id === c.id ? 'selected' : ''}>${c.icon || '📂'} ${c.name}</option>`).join('')}
            </optgroup>
          ` : ''}
        </select>
        <div id="qCatHint" style="font-size:0.8rem; color:var(--danger); font-weight:600; margin-top:4px; display:none;">
          ⚠️ Global public quizzes require selecting a standardized Global Master Category (created by Super Admin). Private categories are disabled.
        </div>
      </div>

      <!-- Batch Target Assignment -->
      ${allBatches.length > 0 ? `
        <div class="form-group">
          <label>Target Student Batches / Classes</label>
          <div style="margin-bottom:8px;">
            <label style="font-size:0.85rem; font-weight:700; display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" id="qAllBatches" ${!quiz || quiz.is_all_batches ? 'checked' : ''} />
              <span>Make Available to All Batches</span>
            </label>
          </div>

          <div id="batchListContainer" style="display:${quiz && !quiz.is_all_batches ? 'flex' : 'none'}; gap:8px; flex-wrap:wrap; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; max-height:100px; overflow-y:auto;">
            ${allBatches.map(b => `
              <label style="font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:4px; cursor:pointer;">
                <input type="checkbox" class="batch-checkbox" value="${b.id}" ${existingBatchIds.includes(b.id) ? 'checked' : ''} />
                ${b.name} (${b.code || 'Batch'})
              </label>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="form-group">
        <label>Assign Tags</label>
        <div style="display:flex; gap:10px; flex-wrap:wrap; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; max-height:100px; overflow-y:auto;">
          ${allTags.map(t => `
            <label style="font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="tag-checkbox" value="${t.id}" ${existingTagNames.includes(t.name) ? 'checked' : ''} />
              ${t.name}
            </label>
          `).join('')}
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:12px; font-weight:700;">${quiz ? 'Update Quiz' : 'Create Quiz'}</button>
    `;

    const modal = createModal({ title: quiz ? '✏️ Edit Quiz Details' : '➕ Create New Quiz', content: form });

    const qPublic = form.querySelector('#qPublic');
    const qCategory = form.querySelector('#qCategory');
    const qCatHint = form.querySelector('#qCatHint');
    const privateOptgroup = form.querySelector('#optgroup-private-cats');

    // Dynamic Category Scope Filter Logic
    function updateCategoryOptionsByScope() {
      const isGlobalPublic = qPublic && qPublic.value === '1';

      if (privateOptgroup) {
        const privateOptions = privateOptgroup.querySelectorAll('option');
        if (isGlobalPublic) {
          privateOptgroup.style.display = 'none';
          privateOptions.forEach(opt => { opt.disabled = true; });

          // If a private category was selected, reset to empty
          if (privateCatIds.has(qCategory.value)) {
            qCategory.value = '';
          }
          if (qCatHint) qCatHint.style.display = 'block';
        } else {
          privateOptgroup.style.display = '';
          privateOptions.forEach(opt => { opt.disabled = false; });
          if (qCatHint) qCatHint.style.display = 'none';
        }
      }
    }

    if (qPublic) {
      qPublic.addEventListener('change', updateCategoryOptionsByScope);
      updateCategoryOptionsByScope();
    }

    const allBatchesCb = form.querySelector('#qAllBatches');
    const batchListContainer = form.querySelector('#batchListContainer');
    if (allBatchesCb && batchListContainer) {
      allBatchesCb.addEventListener('change', () => {
        batchListContainer.style.display = allBatchesCb.checked ? 'none' : 'flex';
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isGlobalPublic = qPublic ? qPublic.value === '1' : false;
      const selectedCatId = qCategory.value;

      if (isGlobalPublic && selectedCatId && privateCatIds.has(selectedCatId)) {
        alert('To publish a quiz globally, you must select a Global Master Category (created by Super Admin). Private categories cannot be used for global quizzes.');
        return;
      }

      const selectedTagIds = Array.from(form.querySelectorAll('.tag-checkbox:checked')).map(cb => parseInt(cb.value, 10));
      const selectedBatchIds = Array.from(form.querySelectorAll('.batch-checkbox:checked')).map(cb => parseInt(cb.value, 10));
      const isAllBatchesVal = allBatchesCb ? allBatchesCb.checked : true;

      const body = {
        title: form.querySelector('#qTitle').value.trim(),
        description: form.querySelector('#qDesc').value.trim(),
        category_id: selectedCatId || null,
        is_published: form.querySelector('#qPublished').value === '1',
        is_public: isGlobalPublic,
        is_all_batches: isAllBatchesVal,
        batch_ids: selectedBatchIds,
        tag_ids: selectedTagIds
      };

      try {
        if (quiz) await api.updateQuiz(quiz.id, body);
        else await api.createQuiz(body);
        modal.close();
        renderQuizzesList();
      } catch (err) {
        alert(err.message || 'Error saving quiz');
      }
    });
  }

  // Manage Questions inside a selected Practice Quiz with Inline Accordion Editor
  async function renderQuestionsManager(quizId, quizTitle) {
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px;">
        <div>
          <button class="btn btn-sm btn-secondary" id="backQuizzesBtn" style="font-weight:600;" title="Back to All Quizzes" aria-label="Back to All Quizzes">
            <i class="ri-arrow-left-line"></i> <span class="btn-text-desktop">Back to All Quizzes</span>
          </button>
          <h3 style="font-size:1.3rem; font-weight:700; margin-top:8px;">Questions for: "${quizTitle}"</h3>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-outline" id="bulkImportQuizBtn" style="font-weight:700;" title="Bulk Import Quiz Questions" aria-label="Bulk Import Quiz Questions">
            <i class="ri-file-upload-line"></i> <span class="btn-text-desktop">Bulk Import Quiz Questions</span>
          </button>
          <button class="btn btn-primary" id="addQuestionBtn" style="font-weight:700;" title="Add New Question" aria-label="Add New Question">
            <i class="ri-add-line"></i> <span class="btn-text-desktop">Add New Question</span>
          </button>
        </div>
      </div>
      
      <div id="newQuestionEditorContainer" style="display:none; margin-bottom:20px;"></div>
      <div id="questionsList"></div>
    `;

    contentArea.querySelector('#backQuizzesBtn').addEventListener('click', () => renderQuizzesList());
    contentArea.querySelector('#bulkImportQuizBtn').addEventListener('click', async () => {
      const { renderQuizBulkUploadModal } = await import('../components/QuizBulkUploadModal.js');
      renderQuizBulkUploadModal(quizId, () => loadQuestions());
    });

    const newQuestionEditorContainer = contentArea.querySelector('#newQuestionEditorContainer');
    const questionsList = contentArea.querySelector('#questionsList');
    let activeInlineEditorContainer = null;

    async function loadQuestions() {
      try {
        const res = await api.getQuestions(quizId);
        const questions = res.questions || [];
        questionsList.innerHTML = '';
        newQuestionEditorContainer.style.display = 'none';
        newQuestionEditorContainer.innerHTML = '';
        activeInlineEditorContainer = null;

        if (questions.length === 0) {
          questionsList.innerHTML = '<div style="padding:30px; text-align:center; color:var(--text-muted); background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md);">No questions in this practice quiz yet. Click "+ Add New Question" or use "Bulk Import".</div>';
          return;
        }

        questions.forEach((q, idx) => {
          const wrapperDiv = document.createElement('div');
          wrapperDiv.className = 'question-card-wrapper';
          wrapperDiv.style.marginBottom = '14px';

          const card = document.createElement('div');
          card.className = 'card question-item-card';
          card.dataset.id = q.id;
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
              <h4 style="font-size:1rem; font-weight:700;" class="katex-render">Q${idx + 1}: ${q.question_text}</h4>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-secondary edit-q-btn" style="font-weight:600;">
                  <i class="ri-edit-line"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger delete-q-btn" style="font-weight:600;">
                  <i class="ri-delete-bin-line"></i> Delete
                </button>
              </div>
            </div>
            <div style="margin-top:10px; font-size:0.88rem; color:var(--text-muted);">
              Options: ${q.options ? q.options.join(' | ') : ''} (Correct: Option ${q.correct_answer_index + 1})
            </div>
          `;

          const inlineEditorSlot = document.createElement('div');
          inlineEditorSlot.className = 'inline-editor-slot';
          inlineEditorSlot.style.display = 'none';
          inlineEditorSlot.style.marginTop = '12px';

          wrapperDiv.appendChild(card);
          wrapperDiv.appendChild(inlineEditorSlot);

          card.querySelector('.edit-q-btn').addEventListener('click', () => {
            toggleInlineEditor(q, wrapperDiv, inlineEditorSlot);
          });

          card.querySelector('.delete-q-btn').addEventListener('click', async () => {
            if (confirm('Delete this question?')) {
              try {
                await api.deleteQuestion(q.id);
                loadQuestions();
              } catch (err) {
                alert(err.message || 'Error deleting question');
              }
            }
          });

          questionsList.appendChild(wrapperDiv);
        });

        renderMath(questionsList);
      } catch (err) {
        questionsList.innerHTML = `<div style="color:var(--danger); padding:20px;">Error loading questions: ${err.message}</div>`;
      }
    }

    // Toggle Inline Accordion Editor directly under target card wrapper
    function toggleInlineEditor(question, wrapperDiv, inlineEditorSlot) {
      if (activeInlineEditorContainer && activeInlineEditorContainer !== inlineEditorSlot) {
        activeInlineEditorContainer.style.display = 'none';
        activeInlineEditorContainer.innerHTML = '';
      }

      newQuestionEditorContainer.style.display = 'none';
      newQuestionEditorContainer.innerHTML = '';

      if (inlineEditorSlot.style.display === 'block') {
        inlineEditorSlot.style.display = 'none';
        inlineEditorSlot.innerHTML = '';
        activeInlineEditorContainer = null;
        return;
      }

      inlineEditorSlot.innerHTML = '';
      inlineEditorSlot.style.display = 'block';
      activeInlineEditorContainer = inlineEditorSlot;

      const editorNode = renderMathLiveEditor({
        initialQuestion: question,
        onSave: async (formData) => {
          try {
            await api.updateQuestion(question.id, formData);
            inlineEditorSlot.style.display = 'none';
            inlineEditorSlot.innerHTML = '';
            activeInlineEditorContainer = null;
            await loadQuestions();
          } catch (err) {
            alert(err.message);
          }
        },
        onCancel: () => {
          inlineEditorSlot.style.display = 'none';
          inlineEditorSlot.innerHTML = '';
          activeInlineEditorContainer = null;
        }
      });

      inlineEditorSlot.appendChild(editorNode);
      setTimeout(() => {
        wrapperDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }

    // Show New Question Editor at Top of list
    function showNewQuestionEditor() {
      if (activeInlineEditorContainer) {
        activeInlineEditorContainer.style.display = 'none';
        activeInlineEditorContainer.innerHTML = '';
        activeInlineEditorContainer = null;
      }

      if (newQuestionEditorContainer.style.display === 'block') {
        newQuestionEditorContainer.style.display = 'none';
        newQuestionEditorContainer.innerHTML = '';
        return;
      }

      newQuestionEditorContainer.innerHTML = '';
      newQuestionEditorContainer.style.display = 'block';

      const editorNode = renderMathLiveEditor({
        initialQuestion: null,
        onSave: async (formData) => {
          try {
            await api.addQuestion(quizId, formData);
            newQuestionEditorContainer.style.display = 'none';
            newQuestionEditorContainer.innerHTML = '';
            await loadQuestions();
          } catch (err) {
            alert(err.message);
          }
        },
        onCancel: () => {
          newQuestionEditorContainer.style.display = 'none';
          newQuestionEditorContainer.innerHTML = '';
        }
      });

      newQuestionEditorContainer.appendChild(editorNode);
      setTimeout(() => {
        newQuestionEditorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }

    contentArea.querySelector('#addQuestionBtn').addEventListener('click', () => showNewQuestionEditor());
    loadQuestions();
  }

  renderQuizzesList();
  return container;
}
