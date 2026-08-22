import { apiRequest } from '../services/api.js';
import { renderAdminDashboard } from './AdminDashboard.js';
import { createModal } from '../components/Modal.js';

let currentNavigate = null;

export function renderInstituteAdminView(navigate) {
  currentNavigate = navigate;
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <div class="saas-header">
      <div class="saas-title-group">
        <h1 id="inst-title">Institute Admin Portal 🏢</h1>
        <p id="inst-subtitle">Manage your coaching institute's students, multi-section CBT mock exams, and practice quizzes.</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <span class="institute-badge" id="inst-code-badge"><i class="ri-key-2-line"></i> Code: Loading...</span>
      </div>
    </div>

    <!-- Stats Overview Cards -->
    <div class="saas-stats-grid">
      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-user-follow-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="inst-stat-students">-</span>
          <span class="saas-stat-label">Enrolled Students</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-computer-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="inst-stat-exams">-</span>
          <span class="saas-stat-label">Live Online Exams</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-file-list-3-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="inst-stat-quizzes">-</span>
          <span class="saas-stat-label">Practice Quizzes</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px; flex-wrap: wrap;">
      <button id="tab-inst-exams" class="btn-text active" style="font-weight: 700; padding: 10px 16px; border-bottom: 3px solid var(--primary);">CBT Exam Engine</button>
      <button id="tab-inst-batches" class="btn-text" style="font-weight: 700; padding: 10px 16px; color: var(--text-muted);">🏫 Batches & Classes</button>
      <button id="tab-inst-students" class="btn-text" style="font-weight: 700; padding: 10px 16px; color: var(--text-muted);">Student Roster</button>
    </div>

    <!-- Tab 1: CBT Exam Engine -->
    <div id="section-inst-exams">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Multi-Section Online CBT Exams</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Create scheduled CBT exams with positive/negative marking and multi-section layouts.</p>
          </div>
          <button id="btn-create-exam" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
            <i class="ri-add-circle-line"></i> Create New Online Exam
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Schedule Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="exams-table-body">
              <tr><td colspan="8" style="text-align: center; padding: 30px;">Loading institute exams...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 2: Batches & Classes -->
    <div id="section-inst-batches" style="display: none;">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Batches, Classes & Standards Management</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Create batches (e.g. SSC CGL Morning 2026, Class 10 Science) to target exams specifically to student groups.</p>
          </div>
          <button id="btn-create-batch" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
            <i class="ri-team-line"></i> + Create New Batch/Class
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Batch / Class Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Enrolled Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="batches-table-body">
              <tr><td colspan="5" style="text-align: center; padding: 30px;">Loading batches...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 3: Student Roster -->
    <div id="section-inst-students" style="display: none;">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Enrolled Student Roster</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Students linked to your institute using your unique institute code.</p>
          </div>
          <button id="btn-copy-code" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;">
            <i class="ri-file-copy-line"></i> Copy Student Invite Link
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Enrolled Batch</th>
                <th>Total Attempts</th>
                <th>Average Accuracy</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody id="students-table-body">
              <tr><td colspan="7" style="text-align: center; padding: 30px;">Loading student roster...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit Online CBT Exam -->
    <div id="modal-create-exam" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; padding: 24px; background: var(--card-bg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="modal-exam-heading" style="font-size: 1.3rem; font-weight: 800;">Create Online CBT Exam</h3>
          <button id="close-modal-exam" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <form id="form-create-exam">
          <input type="hidden" id="edit-exam-id" value="">

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Exam Title *</label>
            <input type="text" id="exam-title" class="form-control" placeholder="e.g. Competitive Mock Test #01" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label">Multilevel Category Bundle</label>
              <select id="exam-category-id" class="form-control">
                <option value="">-- Select Category / Subcategory --</option>
              </select>
              <div id="exam-category-hint" style="font-size:0.8rem; color:var(--danger); font-weight:600; margin-top:4px; display:none;">
                ⚠️ Global Open Tests require selecting a standardized Global Master Category (created by Super Admin). Private categories are disabled.
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Exam Type</label>
              <select id="exam-type" class="form-control">
                <option value="COMPETITIVE">Competitive Exam (UPSC, SSC, Bank)</option>
                <option value="ENTRANCE">Entrance Test (GATE, JEE, NEET)</option>
                <option value="SELECTION">Selection & Recruitment Exam</option>
                <option value="ACADEMIC">Academic Test (School/University)</option>
                <option value="MOCK_TEST">Full Mock Test Series</option>
                <option value="CUSTOM">Custom Exam Series</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label">Access Visibility</label>
              <select id="exam-visibility" class="form-control">
                <option value="private">Coaching Students Only (Private)</option>
                <option value="public">Global Open Test (Public for All)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Exam Mode</label>
              <select id="exam-mode" class="form-control">
                <option value="actual">Actual Exam (Fixed Time Window)</option>
                <option value="practice">Practice Mode (Anytime)</option>
              </select>
            </div>
          </div>

          <!-- Target Batch / Class Allocation -->
          <div class="form-group" style="margin-bottom: 14px; background: var(--bg-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
            <label class="form-label" style="font-weight: 700; color: var(--primary);">🎯 Target Batch / Class Allocation</label>
            <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 8px;">
              <label style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
                <input type="radio" name="batch_allocation_mode" value="all" checked style="width: 16px; height: 16px;">
                <span>🌐 All Batches (Visible to all students in institute)</span>
              </label>
              <label style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
                <input type="radio" name="batch_allocation_mode" value="specific" style="width: 16px; height: 16px;">
                <span>🎯 Target Specific Batches/Classes</span>
              </label>
            </div>
            <div id="exam-batch-checklist" style="display: none; margin-top: 10px; padding: 10px; background: var(--card-bg); border-radius: 6px; max-height: 120px; overflow-y: auto;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Loading institute batches...</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label">Duration (Mins)</label>
              <input type="number" id="exam-duration" class="form-control" value="60" min="5" required>
            </div>
            <div class="form-group">
              <label class="form-label">+ Marks (Correct)</label>
              <input type="number" step="0.25" id="exam-pos" class="form-control" value="2.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">- Marks (Wrong)</label>
              <input type="number" step="0.25" id="exam-neg" class="form-control" value="0.50" required>
            </div>
          </div>

          <!-- Exam Tags Selection -->
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Exam Tags (Select multiple)</label>
            <div id="exam-tags-container" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; max-height: 100px; overflow-y: auto;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Loading tags...</span>
            </div>
          </div>

          <!-- Custom Exam Instructions -->
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Custom Exam Instructions (Rendered in Exam Lobby)</label>
            <textarea id="exam-instructions" class="form-control" rows="3" placeholder="e.g. 1. Scientific calculators are not allowed.&#10;2. Each section has a 15 minute target timing."></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
            <div class="form-group">
              <label class="form-label">Scheduled Start (Optional)</label>
              <input type="datetime-local" id="exam-start" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Scheduled End (Optional)</label>
              <input type="datetime-local" id="exam-end" class="form-control">
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" id="cancel-modal-exam" class="btn btn-outline">Cancel</button>
            <button type="submit" id="submit-modal-exam" class="btn btn-primary">Create Exam</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setTimeout(() => {
    setupInstituteAdminEvents(container);
    loadInstituteAdminData(container);
  }, 0);

  return container;
}

let cachedExams = [];
let cachedStudents = [];
let cachedBatches = [];

async function loadInstituteAdminData(container) {
  try {
    const userRes = await apiRequest('/auth/me');
    const user = userRes.user;

    if (user.institute_name) {
      container.querySelector('#inst-title').textContent = `${user.institute_name} Admin Portal 🏢`;
    }
    if (user.institute_code) {
      container.querySelector('#inst-code-badge').innerHTML = `<i class="ri-key-2-line"></i> Code: ${user.institute_code}`;
    }

    if (!user.institute_id && user.role !== 'super_admin') {
      container.querySelector('#exams-table-body').innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Your account is not assigned to a coaching institute yet. Contact Super Admin.</td></tr>';
      return;
    }

    const [examsRes, studentsRes, quizzesRes, catRes, tagRes, batchesRes] = await Promise.all([
      apiRequest('/exams'),
      user.institute_id ? apiRequest(`/institutes/${user.institute_id}/students`) : Promise.resolve({ students: [] }),
      apiRequest('/quizzes'),
      apiRequest('/categories').catch(() => ({ flatCategories: [] })),
      apiRequest('/tags').catch(() => ({ tags: [] })),
      apiRequest('/exams/batches/all').catch(() => ({ batches: [] }))
    ]);

    cachedExams = examsRes.exams || [];
    cachedStudents = studentsRes.students || [];
    cachedBatches = batchesRes.batches || [];

    // Populate category dropdown with Optgroups (Global Master vs Institute Private)
    const catSelect = container.querySelector('#exam-category-id');
    const visSelect = container.querySelector('#exam-visibility');
    const catHint = container.querySelector('#exam-category-hint');

    let privateCatIds = new Set();

    if (catSelect) {
      const cats = catRes.flatCategories || [];
      const globalCats = cats.filter(c => !c.institute_id || c.is_global);
      const privateCats = cats.filter(c => c.institute_id && !c.is_global);
      privateCatIds = new Set(privateCats.map(c => c.id.toString()));

      let optionsHtml = '<option value="">-- Select Category / Subcategory --</option>';
      if (globalCats.length > 0) {
        optionsHtml += `<optgroup label="🌐 Global Master Categories (For Public & Private Exams)">` +
          globalCats.map(c => `<option value="${c.id}" data-type="global">${c.icon || '📂'} ${c.name}</option>`).join('') +
          `</optgroup>`;
      }
      if (privateCats.length > 0) {
        optionsHtml += `<optgroup id="exam-optgroup-private" label="🏫 My Institute Private Categories (Internal Exams Only)">` +
          privateCats.map(c => `<option value="${c.id}" data-type="private">${c.icon || '📂'} ${c.name}</option>`).join('') +
          `</optgroup>`;
      }
      catSelect.innerHTML = optionsHtml;
    }

    // Dynamic Filter handler for Visibility vs Category Scope
    function updateExamCategoryOptions() {
      if (!visSelect || !catSelect) return;
      const isPublic = visSelect.value === 'public';
      const privateGroup = catSelect.querySelector('#exam-optgroup-private');

      if (privateGroup) {
        const privateOptions = privateGroup.querySelectorAll('option');
        if (isPublic) {
          privateGroup.style.display = 'none';
          privateOptions.forEach(opt => { opt.disabled = true; });

          // Reset if private category was selected
          if (privateCatIds.has(catSelect.value)) {
            catSelect.value = '';
          }
          if (catHint) catHint.style.display = 'block';
        } else {
          privateGroup.style.display = '';
          privateOptions.forEach(opt => { opt.disabled = false; });
          if (catHint) catHint.style.display = 'none';
        }
      }
    }

    if (visSelect) {
      visSelect.addEventListener('change', updateExamCategoryOptions);
      updateExamCategoryOptions();
    }

    // Populate tags checkboxes
    const tagsContainer = container.querySelector('#exam-tags-container');
    if (tagsContainer) {
      const tags = tagRes.tags || [];
      if (tags.length === 0) {
        tagsContainer.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">No tags created yet. Add tags in Quiz Manager!</span>';
      } else {
        tagsContainer.innerHTML = tags.map(t => `
          <label style="display:inline-flex; align-items:center; gap:4px; font-size:0.82rem; cursor:pointer; background:var(--bg-color); padding:4px 8px; border-radius:4px; border:1px solid var(--border-color);">
            <input type="checkbox" class="exam-tag-cb" value="${t.id}">
            <span>${t.name}</span>
          </label>
        `).join('');
      }
    }

    // Populate exam batch allocation checklist
    const batchChecklist = container.querySelector('#exam-batch-checklist');
    if (batchChecklist) {
      if (cachedBatches.length === 0) {
        batchChecklist.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">No custom batches created yet. All exams apply to General Batch.</span>';
      } else {
        batchChecklist.innerHTML = cachedBatches.map(b => `
          <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; cursor:pointer; padding:4px 0;">
            <input type="checkbox" class="exam-batch-cb" value="${b.id}">
            <span><strong>${b.name}</strong> ${b.code ? `(${b.code})` : ''}</span>
          </label>
        `).join('');
      }
    }

    container.querySelector('#inst-stat-exams').textContent = cachedExams.length;
    container.querySelector('#inst-stat-students').textContent = cachedStudents.length;
    container.querySelector('#inst-stat-quizzes').textContent = (quizzesRes.quizzes || []).length;

    renderExamsTable(container, cachedExams);
    renderBatchesTable(container, cachedBatches);
    renderStudentsTable(container, cachedStudents);
  } catch (err) {
    console.error('Failed to load institute admin data:', err);
  }
}

function renderBatchesTable(container, list) {
  const tbody = container.querySelector('#batches-table-body');
  if (!tbody) return;
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">No custom batches created yet. Click "+ Create New Batch/Class" above to add one.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(b => `
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${b.name}</td>
      <td><span class="badge-tag">${b.code || 'DEFAULT'}</span></td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">${b.description || '-'}</td>
      <td style="font-weight: 700;">${b.student_count || 0} Students</td>
      <td>
        <button class="icon-action-btn btn-danger btn-delete-batch" data-id="${b.id}" title="Delete Batch">
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-delete-batch').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this batch? Enrolled students will revert to general access.')) {
        try {
          await apiRequest(`/exams/batches/${btn.dataset.id}`, { method: 'DELETE' });
          loadInstituteAdminData(container);
        } catch (e) { alert(e.message); }
      }
    });
  });
}

function renderExamsTable(container, list) {
  const tbody = container.querySelector('#exams-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No exams created yet. Click "Create New Online Exam" above to add one.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(e => `
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">
        ${e.title}
        ${e.category_name ? `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal; margin-top:2px;">${e.category_icon || '📂'} ${e.category_name}</div>` : ''}
        ${e.tag_names ? `<div style="margin-top:4px;">${e.tag_names.split(',').map(tn => `<span class="badge-tag" style="font-size:0.7rem; margin-right:4px;">#${tn.trim()}</span>`).join('')}</div>` : ''}
      </td>
      <td><span class="badge-tag">${e.exam_type}</span></td>
      <td><span style="text-transform: capitalize; font-weight: 600;">${e.mode}</span></td>
      <td>${e.total_duration_mins} Mins</td>
      <td>+${parseFloat(e.positive_marks).toFixed(2)} / -${parseFloat(e.negative_marks).toFixed(2)}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">
        ${e.scheduled_start ? new Date(e.scheduled_start).toLocaleString() : 'Anytime'}
      </td>
      <td>
        <span class="status-badge ${e.is_published ? 'status-active' : 'status-inactive'}">
          ${e.is_published ? 'Published' : 'Draft'}
        </span>
      </td>
      <td>
        <div class="table-action-group">
          <button class="icon-action-btn btn-primary-accent btn-manage-exam-q" data-id="${e.id}" title="Manage Exam Sections & Questions">
            <i class="ri-list-check-2"></i>
          </button>
          <button class="icon-action-btn btn-edit-exam" data-id="${e.id}" title="Edit Exam Details & Instructions">
            <i class="ri-edit-line"></i>
          </button>
          <button class="icon-action-btn btn-toggle-publish" data-id="${e.id}" data-pub="${e.is_published}" title="${e.is_published ? 'Unpublish Exam' : 'Publish Exam'}">
            <i class="${e.is_published ? 'ri-eye-off-line' : 'ri-eye-line'}"></i>
          </button>
          <button class="icon-action-btn btn-view-leaderboard" data-id="${e.id}" title="View Student Leaderboard & Class Analytics">
            <i class="ri-trophy-line"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-manage-exam-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const examId = btn.dataset.id;
      const exam = cachedExams.find(x => x.id == examId);
      if (exam) {
        openExamSectionManagerModal(container, exam);
      }
    });
  });

  tbody.querySelectorAll('.btn-edit-exam').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const exam = cachedExams.find(x => x.id == id);
      if (!exam) return;

      const modal = container.querySelector('#modal-create-exam');
      container.querySelector('#modal-exam-heading').textContent = '✏️ Edit Online CBT Exam';
      container.querySelector('#edit-exam-id').value = exam.id;
      container.querySelector('#exam-title').value = exam.title || '';
      container.querySelector('#exam-duration').value = exam.total_duration_mins || 60;
      container.querySelector('#exam-pos').value = exam.positive_marks || 2.00;
      container.querySelector('#exam-neg').value = exam.negative_marks || 0.50;
      container.querySelector('#exam-instructions').value = exam.instructions || '';
      container.querySelector('#exam-type').value = exam.exam_type || 'COMPETITIVE';
      container.querySelector('#exam-mode').value = exam.mode || 'actual';
      if (container.querySelector('#exam-category-id')) {
        container.querySelector('#exam-category-id').value = exam.category_id || '';
      }
      if (container.querySelector('#exam-visibility')) {
        container.querySelector('#exam-visibility').value = exam.is_public ? 'public' : 'private';
      }

      if (exam.scheduled_start) {
        container.querySelector('#exam-start').value = new Date(exam.scheduled_start).toISOString().slice(0, 16);
      }
      if (exam.scheduled_end) {
        container.querySelector('#exam-end').value = new Date(exam.scheduled_end).toISOString().slice(0, 16);
      }

      modal.style.display = 'flex';
    });
  });

  tbody.querySelectorAll('.btn-toggle-publish').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const currentPub = btn.dataset.pub === 'true' || btn.dataset.pub === '1';
      try {
        await apiRequest(`/exams/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ is_published: !currentPub })
        });
        loadInstituteAdminData(container);
      } catch (err) {
        alert('Error updating exam status.');
      }
    });
  });

  tbody.querySelectorAll('.btn-view-leaderboard').forEach(btn => {
    btn.addEventListener('click', async () => {
      const examId = btn.dataset.id;
      const { renderLeaderboardModal } = await import('../components/LeaderboardModal.js');
      renderLeaderboardModal(examId);
    });
  });
}

function renderStudentsTable(container, list) {
  const tbody = container.querySelector('#students-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No students have joined your institute yet. Share your institute code for them to register!</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(s => `
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${s.full_name}</td>
      <td>${s.email}</td>
      <td>${s.phone_number || '-'}</td>
      <td><span class="badge-tag" style="background:var(--accent-light); color:var(--accent); font-weight:700;">${s.batch_name || 'General Batch'}</span></td>
      <td style="font-weight: 700;">${s.attempts_count || 0}</td>
      <td>
        <span style="font-weight: 700; color: ${s.avg_accuracy >= 70 ? 'var(--success)' : 'var(--text-main)'};">
          ${s.avg_accuracy ? Math.round(s.avg_accuracy) + '%' : '-'}
        </span>
      </td>
      <td>${new Date(s.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function setupInstituteAdminEvents(container) {
  const tabExams = container.querySelector('#tab-inst-exams');
  const tabBatches = container.querySelector('#tab-inst-batches');
  const tabStud = container.querySelector('#tab-inst-students');

  const secExams = container.querySelector('#section-inst-exams');
  const secBatches = container.querySelector('#section-inst-batches');
  const secStud = container.querySelector('#section-inst-students');

  const switchTab = (activeBtn, showSec) => {
    [tabExams, tabBatches, tabStud].forEach(b => {
      if (b) {
        b.classList.remove('active');
        b.style.borderBottom = 'none';
        b.style.color = 'var(--text-muted)';
      }
    });
    [secExams, secBatches, secStud].forEach(s => { if (s) s.style.display = 'none'; });

    if (activeBtn && showSec) {
      activeBtn.classList.add('active');
      activeBtn.style.borderBottom = '3px solid var(--primary)';
      activeBtn.style.color = 'var(--text-main)';
      showSec.style.display = 'block';
    }
  };

  tabExams.addEventListener('click', () => switchTab(tabExams, secExams));
  if (tabBatches) tabBatches.addEventListener('click', () => switchTab(tabBatches, secBatches));
  tabStud.addEventListener('click', () => switchTab(tabStud, secStud));

  // Batch Allocation Radios in Modal
  const batchRadios = container.querySelectorAll('input[name="batch_allocation_mode"]');
  const batchChecklist = container.querySelector('#exam-batch-checklist');
  batchRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (batchChecklist) {
        batchChecklist.style.display = e.target.value === 'specific' ? 'block' : 'none';
      }
    });
  });

  // Create Batch Button Handler (Rich Modal Popup Form)
  const btnCreateBatch = container.querySelector('#btn-create-batch');
  if (btnCreateBatch) {
    btnCreateBatch.addEventListener('click', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 700;">Batch / Class Name *</label>
          <input type="text" id="new-batch-name" class="form-control" placeholder="e.g. SSC CGL Morning 2026, Class 10 Science" required style="padding: 10px;" />
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 700;">Batch Code (Optional)</label>
          <input type="text" id="new-batch-code" class="form-control" placeholder="e.g. BATCH-CGL-01" style="padding: 10px; text-transform: uppercase;" />
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" style="font-weight: 700;">Description / Target Exam Notes (Optional)</label>
          <textarea id="new-batch-desc" class="form-control" rows="3" placeholder="Enter batch timing, target competitive exam, or class schedule details..."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" id="btn-cancel-batch-modal" class="btn btn-outline">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 700;">Create Batch →</button>
        </div>
      `;

      const modal = createModal({
        title: '🏫 Create New Batch / Class',
        content: form
      });

      form.querySelector('#btn-cancel-batch-modal').addEventListener('click', () => modal.close());

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.querySelector('#new-batch-name').value.trim();
        const code = form.querySelector('#new-batch-code').value.trim();
        const description = form.querySelector('#new-batch-desc').value.trim();

        if (!name) return;

        try {
          await apiRequest('/exams/batches', {
            method: 'POST',
            body: JSON.stringify({ name, code, description })
          });
          modal.close();
          loadInstituteAdminData(container);
        } catch (err) {
          alert(err.message || 'Error creating batch.');
        }
      });
    });
  }

  // Modal handlers
  const modal = container.querySelector('#modal-create-exam');
  const btnCreate = container.querySelector('#btn-create-exam');
  const btnClose = container.querySelector('#close-modal-exam');
  const btnCancel = container.querySelector('#cancel-modal-exam');
  const form = container.querySelector('#form-create-exam');

  const openModal = () => {
    container.querySelector('#modal-exam-heading').textContent = 'Create Online CBT Exam';
    container.querySelector('#edit-exam-id').value = '';
    container.querySelector('#submit-modal-exam').textContent = 'Create Exam';
    form.reset();
    if (batchChecklist) batchChecklist.style.display = 'none';
    modal.style.display = 'flex';
  };

  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
  };

  btnCreate.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = container.querySelector('#edit-exam-id').value;
    const visVal = container.querySelector('#exam-visibility') ? container.querySelector('#exam-visibility').value : 'private';
    const catSelectEl = container.querySelector('#exam-category-id');
    const selectedCatOpt = catSelectEl ? catSelectEl.options[catSelectEl.selectedIndex] : null;

    if (visVal === 'public' && selectedCatOpt && selectedCatOpt.dataset.type === 'private') {
      alert('To publish a Global Open Test, you must select a Global Master Category (created by Super Admin). Private categories cannot be used for global tests.');
      return;
    }

    const selectedTagIds = Array.from(container.querySelectorAll('.exam-tag-cb:checked')).map(cb => parseInt(cb.value, 10));

    const allocMode = container.querySelector('input[name="batch_allocation_mode"]:checked')?.value || 'all';
    const isAllBatches = allocMode === 'all';
    const selectedBatchIds = isAllBatches ? [] : Array.from(container.querySelectorAll('.exam-batch-cb:checked')).map(cb => parseInt(cb.value, 10));

    const payload = {
      title: container.querySelector('#exam-title').value.trim(),
      category_id: container.querySelector('#exam-category-id').value ? parseInt(container.querySelector('#exam-category-id').value, 10) : null,
      exam_type: container.querySelector('#exam-type').value,
      mode: container.querySelector('#exam-mode').value || 'actual',
      is_public: visVal === 'public',
      total_duration_mins: parseInt(container.querySelector('#exam-duration').value, 10),
      positive_marks: parseFloat(container.querySelector('#exam-pos').value),
      negative_marks: parseFloat(container.querySelector('#exam-neg').value),
      instructions: container.querySelector('#exam-instructions').value.trim() || null,
      tag_ids: selectedTagIds,
      is_all_batches: isAllBatches,
      batch_ids: selectedBatchIds,
      scheduled_start: container.querySelector('#exam-start').value || null,
      scheduled_end: container.querySelector('#exam-end').value || null
    };

    try {
      if (editId) {
        await apiRequest(`/exams/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        alert(`Exam "${payload.title}" updated successfully!`);
      } else {
        await apiRequest('/exams', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        alert(`Online Exam "${payload.title}" created successfully!`);
      }
      closeModal();
      loadInstituteAdminData(container);
    } catch (err) {
      alert(`Error saving exam: ${err.message}`);
    }
  });

  container.querySelector('#btn-copy-code').addEventListener('click', async () => {
    try {
      const userRes = await apiRequest('/auth/me');
      const code = userRes.user.institute_code;
      if (code) {
        await navigator.clipboard.writeText(code);
        alert(`Institute Code "${code}" copied to clipboard! Share this code with your students.`);
      }
    } catch (e) {
      alert('Failed to copy code.');
    }
  });
}

async function openExamSectionManagerModal(container, exam) {
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-backdrop fade-in';
  modalContainer.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `;

  modalContainer.innerHTML = `
    <div class="card" style="width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
      <!-- Modal Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 4px;">📋 Exam Section Question Builder</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            Exam: <strong>${exam.title}</strong> (${exam.total_duration_mins} Mins | +${parseFloat(exam.positive_marks).toFixed(1)} / -${parseFloat(exam.negative_marks).toFixed(1)})
          </p>
        </div>
        <button id="close-builder-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer;">&times;</button>
      </div>

      <!-- Sections & Questions Body -->
      <div id="builder-body-content" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding-right: 6px;">
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          Loading exam sections and attached questions...
        </div>
      </div>

      <!-- Footer -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 12px;">
        <button id="done-builder-modal" class="btn btn-primary">Done / Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  const closeModal = () => modalContainer.remove();
  modalContainer.querySelector('#close-builder-modal').addEventListener('click', closeModal);
  modalContainer.querySelector('#done-builder-modal').addEventListener('click', closeModal);

  await reloadBuilderContent();

  async function reloadBuilderContent() {
    const bodyEl = modalContainer.querySelector('#builder-body-content');
    try {
      const res = await apiRequest(`/exams/${exam.id}/sections-questions`);
      const sections = res.sections || [];

      if (sections.length === 0) {
        bodyEl.innerHTML = `
          <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
            No sections created in this exam yet.
          </div>
        `;
        return;
      }

      const { openQuestionBankSelectorModal } = await import('../components/QuestionBankSelectorModal.js');
      const { renderMath } = await import('../services/katexRenderer.js');

      bodyEl.innerHTML = sections.map(sec => `
        <div class="card" style="padding: 18px; border: 1px solid var(--border-color); background: var(--bg-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">
                📁 ${sec.section_name}
              </h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                ${sec.questions ? sec.questions.length : 0} Question(s) Attached
              </span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm btn-attach-bank" data-secid="${sec.id}" data-secname="${sec.section_name}">
                <i class="ri-link"></i> ➕ Attach Questions from Master Bank
              </button>
            </div>
          </div>

          <!-- Questions attached to this section -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${(!sec.questions || sec.questions.length === 0) ? `
              <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; padding: 12px; text-align: center;">
                No questions attached to this section yet. Click "Attach Questions from Master Bank" above to add questions!
              </div>
            ` : sec.questions.map((q, qIdx) => `
              <div class="card" style="padding: 12px 14px; background: var(--card-bg); border-left: 3px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary);">Question #${qIdx + 1} (Bank ID: #${q.id})</span>
                  <button class="btn btn-outline btn-sm btn-detach-q" data-secid="${sec.id}" data-qid="${q.id}" style="color: var(--danger); border-color: var(--danger);" title="Remove this question from exam (keeps question in Master Bank)">
                    ❌ Detach from Exam
                  </button>
                </div>
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;" class="katex-render">
                  ${q.question_text_en}
                </div>
                <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                  ${(q.options_en || []).map((opt, oIdx) => `
                    <span style="color: ${oIdx === q.correct_option_index ? 'var(--success)' : 'inherit'}; font-weight: ${oIdx === q.correct_option_index ? 'bold' : 'normal'};">
                      ${String.fromCharCode(65 + oIdx)}: <span class="katex-render">${opt}</span> ${oIdx === q.correct_option_index ? '✓' : ''}
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');

      renderMath(bodyEl);

      // Wire Attach buttons
      bodyEl.querySelectorAll('.btn-attach-bank').forEach(btn => {
        btn.addEventListener('click', () => {
          const sId = parseInt(btn.dataset.secid, 10);
          const sName = btn.dataset.secname;
          openQuestionBankSelectorModal(sId, sName, exam.title, () => {
            reloadBuilderContent();
            loadInstituteAdminData(container);
          });
        });
      });

      // Wire Detach buttons
      bodyEl.querySelectorAll('.btn-detach-q').forEach(btn => {
        btn.addEventListener('click', async () => {
          const sId = btn.dataset.secid;
          const qId = btn.dataset.qid;
          if (confirm('Detach this question from the exam? (The question will remain safe in your Master Question Bank)')) {
            try {
              await apiRequest(`/exams/sections/${sId}/detach-questions/${qId}`, { method: 'DELETE' });
              reloadBuilderContent();
              loadInstituteAdminData(container);
            } catch (err) {
              alert('Error detaching question from exam.');
            }
          }
        });
      });

    } catch (err) {
      console.error('Error loading builder content:', err);
      bodyEl.innerHTML = `<div style="color: var(--danger); padding: 20px;">Error loading exam sections: ${err.message}</div>`;
    }
  }
}
