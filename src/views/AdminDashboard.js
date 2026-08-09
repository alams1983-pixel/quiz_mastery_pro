import { api, getUser } from '../services/api.js';
import { renderMathLiveEditor } from '../components/MathLiveEditor.js';
import { openBulkUploadModal } from '../components/BulkUploadModal.js';
import { createModal } from '../components/Modal.js';
import { renderMath } from '../services/katexRenderer.js';

export function renderAdminDashboard(navigate) {
  const user = getUser();
  const container = document.createElement('div');
  container.className = 'view-container';

  const isSuperAdmin = user && user.role === 'super_admin';

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
      <div>
        <h1 style="font-size:1.8rem; font-weight:700;">⚙️ Admin Control Panel</h1>
        <p style="color:var(--text-muted); font-size:0.95rem;">Manage Quizzes, Questions, Categories with Emojis, Tags & User Roles</p>
      </div>
      <span class="role-badge ${user ? user.role : 'user'}">
        ${user ? user.role.replace('_', ' ') : 'Admin'}
      </span>
    </div>

    <!-- Admin Tabs -->
    <div style="display:flex; gap:10px; border-bottom:1.5px solid var(--border-color); margin-bottom:24px; flex-wrap:wrap;">
      <button class="nav-btn active" id="tabQuizzes">📚 Quizzes & Questions</button>
      <button class="nav-btn" id="tabCategories">📂 Categories & Emojis</button>
      <button class="nav-btn" id="tabTags">🏷️ Tags</button>
      ${isSuperAdmin ? `<button class="nav-btn" id="tabUsers">👑 User Role Management</button>` : ''}
    </div>

    <!-- Content Sections -->
    <div id="adminSectionContent"></div>
  `;

  const contentArea = container.querySelector('#adminSectionContent');
  const tabs = {
    tabQuizzes: container.querySelector('#tabQuizzes'),
    tabCategories: container.querySelector('#tabCategories'),
    tabTags: container.querySelector('#tabTags'),
    tabUsers: container.querySelector('#tabUsers')
  };

  function setActiveTab(activeId) {
    Object.keys(tabs).forEach(id => {
      if (tabs[id]) {
        if (id === activeId) tabs[id].classList.add('active');
        else tabs[id].classList.remove('active');
      }
    });
  }

  // 1. Quizzes & Questions Management
  async function renderQuizzesTab() {
    setActiveTab('tabQuizzes');
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <h3 style="font-size:1.2rem; font-weight:700;">All Quizzes</h3>
        <button class="btn" id="createQuizBtn">+ Create New Quiz</button>
      </div>
      <div id="adminQuizList" class="grid"></div>
    `;

    contentArea.querySelector('#createQuizBtn').addEventListener('click', () => showQuizForm());

    try {
      const res = await api.getQuizzes();
      const quizzes = res.quizzes || [];
      const grid = contentArea.querySelector('#adminQuizList');
      grid.innerHTML = '';

      quizzes.forEach(q => {
        const card = document.createElement('div');
        card.className = 'card';

        const tagBadges = q.tag_names
          ? q.tag_names.split(',').map(t => `<span class="badge-tag">🏷️ ${t.trim()}</span>`).join('')
          : '';

        const catIcon = q.category_icon || '📂';

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <span style="font-size:0.8rem; font-weight:700; color:var(--primary); background:var(--primary-light); padding:2px 8px; border-radius:var(--radius-pill);">
              ${catIcon} ${q.category_name || 'General'}
            </span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">
              ${q.question_count || 0} Qs
            </span>
          </div>

          <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:6px;">${q.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); flex:1; margin-bottom:10px;">${q.description || ''}</p>
          <div style="margin-bottom:14px;">${tagBadges}</div>

          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:auto;">
            <button class="btn btn-sm manage-q-btn">Manage Qs</button>
            <button class="btn btn-sm btn-secondary edit-quiz-btn">Edit Quiz</button>
            <button class="btn btn-sm btn-secondary bulk-q-btn">Bulk Import</button>
            <button class="btn btn-sm btn-danger delete-quiz-btn">Delete</button>
          </div>
        `;

        card.querySelector('.manage-q-btn').addEventListener('click', () => renderQuestionsManager(q.id, q.title));
        card.querySelector('.edit-quiz-btn').addEventListener('click', () => showQuizForm(q));
        card.querySelector('.bulk-q-btn').addEventListener('click', () => openBulkUploadModal(q.id, () => renderQuizzesTab()));
        card.querySelector('.delete-quiz-btn').addEventListener('click', async () => {
          if (confirm(`Are you sure you want to delete quiz "${q.title}"?`)) {
            await api.deleteQuiz(q.id);
            renderQuizzesTab();
          }
        });

        grid.appendChild(card);
      });
    } catch (err) {
      contentArea.innerHTML = `<div style="color:var(--danger)">Error loading quizzes: ${err.message}</div>`;
    }
  }

  // Quiz Form
  async function showQuizForm(quiz = null) {
    const categoriesRes = await api.getCategories();
    const flatCats = categoriesRes.flatCategories || [];
    const tagsRes = await api.getTags();
    const allTags = tagsRes.tags || [];

    const existingTagNames = quiz && quiz.tag_names ? quiz.tag_names.split(',').map(t => t.trim()) : [];

    const form = document.createElement('form');
    form.innerHTML = `
      <div class="form-group">
        <label>Quiz Title</label>
        <input type="text" id="qTitle" class="form-input" value="${quiz ? quiz.title : ''}" required />
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="qDesc" class="form-textarea" rows="3">${quiz ? quiz.description || '' : ''}</textarea>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="qCategory" class="form-select">
          <option value="">-- Select Category --</option>
          ${flatCats.map(c => `<option value="${c.id}" ${quiz && quiz.category_id === c.id ? 'selected' : ''}>${c.icon || '📂'} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Assign Tags</label>
        <div style="display:flex; gap:10px; flex-wrap:wrap; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; max-height:120px; overflow-y:auto;">
          ${allTags.map(t => `
            <label style="font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="tag-checkbox" value="${t.id}" ${existingTagNames.includes(t.name) ? 'checked' : ''} />
              ${t.name}
            </label>
          `).join('')}
        </div>
      </div>
      <button type="submit" class="btn" style="width:100%; margin-top:12px;">${quiz ? 'Update Quiz' : 'Create Quiz'}</button>
    `;

    const modal = createModal({ title: quiz ? 'Edit Quiz Details' : 'Create New Quiz', content: form });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const selectedTagIds = Array.from(form.querySelectorAll('.tag-checkbox:checked')).map(cb => parseInt(cb.value, 10));

      const body = {
        title: form.querySelector('#qTitle').value,
        description: form.querySelector('#qDesc').value,
        category_id: form.querySelector('#qCategory').value || null,
        tag_ids: selectedTagIds
      };

      try {
        if (quiz) await api.updateQuiz(quiz.id, body);
        else await api.createQuiz(body);
        modal.close();
        renderQuizzesTab();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Manage Questions for a specific Quiz
  async function renderQuestionsManager(quizId, quizTitle) {
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <div>
          <button class="btn btn-sm btn-secondary" id="backQuizzesBtn">← Back to Quizzes</button>
          <h3 style="font-size:1.3rem; font-weight:700; margin-top:8px;">Questions for: "${quizTitle}"</h3>
        </div>
        <button class="btn" id="addQuestionBtn">+ Add New Question (Math Editor)</button>
      </div>
      
      <div id="questionEditorContainer" style="display:none; margin-bottom:24px;"></div>
      <div id="questionsList"></div>
    `;

    contentArea.querySelector('#backQuizzesBtn').addEventListener('click', () => renderQuizzesTab());

    const editorContainer = contentArea.querySelector('#questionEditorContainer');
    const questionsList = contentArea.querySelector('#questionsList');

    async function loadQuestions() {
      try {
        const res = await api.getQuestions(quizId);
        const questions = res.questions || [];
        questionsList.innerHTML = '';

        if (questions.length === 0) {
          questionsList.innerHTML = '<div style="padding:20px; color:var(--text-muted);">No questions in this quiz yet. Click "+ Add New Question" or use "Bulk Import".</div>';
          return;
        }

        questions.forEach((q, idx) => {
          const div = document.createElement('div');
          div.className = 'card';
          div.style.marginBottom = '14px';
          div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <h4 style="font-size:1rem; font-weight:700;">Q${idx + 1}: ${q.question_text}</h4>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-secondary edit-q-btn">Edit</button>
                <button class="btn btn-sm btn-danger delete-q-btn">Delete</button>
              </div>
            </div>
            <div style="margin-top:10px; font-size:0.88rem; color:var(--text-muted);">
              Options: ${q.options ? q.options.join(' | ') : ''} (Correct: Choice ${q.correct_answer_index + 1})
            </div>
          `;

          div.querySelector('.edit-q-btn').addEventListener('click', () => {
            showEditor(q);
          });

          div.querySelector('.delete-q-btn').addEventListener('click', async () => {
            if (confirm('Delete this question?')) {
              await api.deleteQuestion(q.id);
              loadQuestions();
            }
          });

          questionsList.appendChild(div);
        });
        renderMath(questionsList);
      } catch (err) {
        questionsList.innerHTML = `<div style="color:var(--danger)">Error: ${err.message}</div>`;
      }
    }

    function showEditor(question = null) {
      editorContainer.innerHTML = '';
      editorContainer.style.display = 'block';

      const editorNode = renderMathLiveEditor({
        initialQuestion: question,
        onSave: async (formData) => {
          try {
            if (question) await api.updateQuestion(question.id, formData);
            else await api.addQuestion(quizId, formData);
            editorContainer.style.display = 'none';
            loadQuestions();
          } catch (err) {
            alert(err.message);
          }
        },
        onCancel: () => {
          editorContainer.style.display = 'none';
        }
      });

      editorContainer.appendChild(editorNode);
    }

    contentArea.querySelector('#addQuestionBtn').addEventListener('click', () => showEditor(null));
    loadQuestions();
  }

  // 2. Categories Management with Emoji Icon Support
  async function renderCategoriesTab() {
    setActiveTab('tabCategories');
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <h3 style="font-size:1.2rem; font-weight:700;">Category Taxonomy & Emojis</h3>
        <button class="btn" id="createCatBtn">+ Add Category</button>
      </div>
      <div id="categoryTableArea"></div>
    `;

    contentArea.querySelector('#createCatBtn').addEventListener('click', () => showCategoryForm());

    try {
      const res = await api.getCategories();
      const flatCats = res.flatCategories || [];
      const tableArea = contentArea.querySelector('#categoryTableArea');

      tableArea.innerHTML = `
        <div class="table-wrap">
          <table class="custom-table">
            <thead>
              <tr><th>Icon</th><th>Category Name</th><th>Parent Category</th><th>Description</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${flatCats.map(c => `
                <tr>
                  <td style="font-size:1.4rem;">${c.icon || '📂'}</td>
                  <td style="font-weight:700;">${c.name}</td>
                  <td>${c.parent_id ? (flatCats.find(p => p.id === c.parent_id)?.name || c.parent_id) : 'Root'}</td>
                  <td>${c.description || ''}</td>
                  <td>
                    <button class="btn btn-sm btn-secondary edit-cat-btn" data-id="${c.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-cat-btn" data-id="${c.id}">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      tableArea.querySelectorAll('.edit-cat-btn').forEach(b => {
        b.addEventListener('click', () => {
          const targetCat = flatCats.find(c => c.id === parseInt(b.dataset.id, 10));
          showCategoryForm(targetCat);
        });
      });

      tableArea.querySelectorAll('.delete-cat-btn').forEach(b => {
        b.addEventListener('click', async () => {
          if (confirm('Delete category?')) {
            await api.deleteCategory(b.dataset.id);
            renderCategoriesTab();
          }
        });
      });
    } catch (err) {
      contentArea.innerHTML = `<div style="color:var(--danger)">Error: ${err.message}</div>`;
    }
  }

  // Category Form with Emoji Field & Preset Quick Select
  async function showCategoryForm(category = null) {
    const res = await api.getCategories();
    const flatCats = res.flatCategories || [];

    const emojiPresets = ['📂', '⚛️', '🧪', '📐', '🧬', '🌍', '💻', '📘', '⚡', '🏆', '🧠', '📜'];

    const form = document.createElement('form');
    form.innerHTML = `
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
        <label>Category Name</label>
        <input type="text" id="catName" class="form-input" value="${category ? category.name : ''}" required />
      </div>
      <div class="form-group">
        <label>Parent Category (Optional)</label>
        <select id="catParent" class="form-select">
          <option value="">-- None (Top Level) --</option>
          ${flatCats.filter(c => !category || c.id !== category.id).map(c => `<option value="${c.id}" ${category && category.parent_id === c.id ? 'selected' : ''}>${c.icon || '📂'} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="catDesc" class="form-textarea" rows="2">${category ? category.description || '' : ''}</textarea>
      </div>
      <button type="submit" class="btn" style="width:100%; margin-top:12px;">${category ? 'Update Category' : 'Create Category'}</button>
    `;

    const modal = createModal({ title: category ? 'Edit Category' : 'Add Category', content: form });

    const iconInput = form.querySelector('#catIcon');
    form.querySelectorAll('.emoji-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        iconInput.value = btn.textContent.trim();
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const body = {
          name: form.querySelector('#catName').value,
          icon: form.querySelector('#catIcon').value,
          parent_id: form.querySelector('#catParent').value || null,
          description: form.querySelector('#catDesc').value
        };

        if (category) await api.updateCategory(category.id, body);
        else await api.createCategory(body);

        modal.close();
        renderCategoriesTab();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // 3. Tags Management
  async function renderTagsTab() {
    setActiveTab('tabTags');
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <h3 style="font-size:1.2rem; font-weight:700;">Tags Dictionary</h3>
        <button class="btn" id="createTagBtn">+ Create Tag</button>
      </div>
      <div id="tagsList" style="display:flex; gap:10px; flex-wrap:wrap;"></div>
    `;

    contentArea.querySelector('#createTagBtn').addEventListener('click', async () => {
      const name = prompt('Enter tag name:');
      if (!name) return;
      try {
        await api.createTag({ name });
        renderTagsTab();
      } catch (e) { alert(e.message); }
    });

    try {
      const res = await api.getTags();
      const tags = res.tags || [];
      const tagsList = contentArea.querySelector('#tagsList');
      tagsList.innerHTML = '';

      tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'role-badge user';
        span.style.padding = '8px 16px';
        span.style.fontSize = '0.88rem';
        span.innerHTML = `🏷️ ${t.name} <button style="background:none; border:none; color:var(--danger); font-weight:bold; cursor:pointer; margin-left:8px;" data-id="${t.id}">&times;</button>`;

        span.querySelector('button').addEventListener('click', async () => {
          if (confirm(`Delete tag "${t.name}"?`)) {
            await api.deleteTag(t.id);
            renderTagsTab();
          }
        });
        tagsList.appendChild(span);
      });
    } catch (err) {
      contentArea.innerHTML = `<div style="color:var(--danger)">Error: ${err.message}</div>`;
    }
  }

  // 4. Super Admin User Role Management
  async function renderUsersTab() {
    setActiveTab('tabUsers');
    contentArea.innerHTML = `
      <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:14px;">👑 User Access Control & Role Management</h3>
      <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:18px;">Promote users to Admin or demote them to standard User status.</p>
      <div id="usersTableArea"></div>
    `;

    try {
      const res = await api.getUsers();
      const users = res.users || [];
      const area = contentArea.querySelector('#usersTableArea');

      area.innerHTML = `
        <div class="table-wrap">
          <table class="custom-table">
            <thead>
              <tr><th>ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>${u.id}</td>
                  <td style="font-weight:700;">${u.full_name}</td>
                  <td>${u.email}</td>
                  <td><span class="role-badge ${u.role}">${u.role.replace('_', ' ')}</span></td>
                  <td>${new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    ${u.role === 'super_admin' ? '<em style="color:var(--text-muted);">Protected Super Admin</em>' : `
                      <button class="btn btn-sm btn-secondary change-role-btn" data-id="${u.id}" data-role="${u.role === 'admin' ? 'user' : 'admin'}">
                        ${u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      area.querySelectorAll('.change-role-btn').forEach(b => {
        b.addEventListener('click', async () => {
          const newRole = b.dataset.role;
          await api.updateUserRole(b.dataset.id, newRole);
          renderUsersTab();
        });
      });
    } catch (err) {
      contentArea.innerHTML = `<div style="color:var(--danger)">Error: ${err.message}</div>`;
    }
  }

  // Attach tab events
  container.querySelector('#tabQuizzes').addEventListener('click', renderQuizzesTab);
  container.querySelector('#tabCategories').addEventListener('click', renderCategoriesTab);
  container.querySelector('#tabTags').addEventListener('click', renderTagsTab);

  if (tabs.tabUsers) {
    tabs.tabUsers.addEventListener('click', renderUsersTab);
  }

  // Initial tab view
  renderQuizzesTab();

  return container;
}
