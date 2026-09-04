import { apiRequest } from '../services/api.js';
import { renderAdminDashboard } from './AdminDashboard.js';
import { createModal } from '../components/Modal.js';

let currentNavigate = null;

export function renderInstituteAdminView(navigate, initialTab = 'exams') {
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
      <!-- Sub-Tab Navigation Header -->
      <div style="display: flex; gap: 10px; border-bottom: 2px solid var(--border-color); margin-bottom: 20px; flex-wrap: wrap;">
        <button id="subtab-inst-batches-list" class="btn-text active" style="font-weight: 700; padding: 8px 14px; border-bottom: 3px solid var(--primary); color: var(--text-main);">
          🏷️ Batches & Classes Directory
        </button>
        <button id="subtab-inst-batches-pending" class="btn-text" style="font-weight: 700; padding: 8px 14px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 6px;">
          ⏳ Pending Join Requests <span id="subtab-pending-badge" class="badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 700; font-size: 0.78rem; padding: 2px 8px; border-radius: 12px;">0</span>
        </button>
      </div>

      <!-- Sub-Tab 1: Batches Directory List -->
      <div id="subtab-content-batches-list" class="card" style="padding: 20px;">
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

      <!-- Sub-Tab 2: Pending Student Join Requests Card -->
      <div id="subtab-content-batches-pending" class="card" style="padding: 20px; display: none; border-left: 4px solid var(--warning, #f59e0b);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
              ⏳ Pending Student Batch Join Requests
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Review and approve student requests to join specific classes and target batches.
            </p>
          </div>
          <span id="pending-requests-count-badge" class="badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 700; font-size: 0.85rem; padding: 4px 10px; border-radius: 20px;">
            0 Pending
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Requested Batch</th>
                <th>Requested Date</th>
                <th>Action Controls</th>
              </tr>
            </thead>
            <tbody id="pending-requests-table-body">
              <tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">Loading pending requests...</td></tr>
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

    <!-- Modal: View & Manage Enrolled Students in Batch -->
    <div id="modal-batch-students" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1050; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 760px; max-height: 85vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h3 id="modal-batch-students-title" style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0;">👥 Enrolled Students</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Review active batch members or revoke batch access.</p>
          </div>
          <button id="close-modal-batch-students" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <!-- Search Bar -->
        <div style="margin-bottom: 16px;">
          <input
            type="text"
            id="search-batch-students"
            class="form-control"
            placeholder="🔍 Search student by name or email..."
            style="padding: 8px 14px; font-size: 0.9rem;"
          />
        </div>

        <!-- Student Table -->
        <div style="overflow-y: auto; flex: 1; border: 1px solid var(--border-color); border-radius: 8px;">
          <table class="custom-table" style="width: 100%; font-size: 0.88rem;">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Enrolled Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="table-body-batch-students">
              <tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">Loading batch students...</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button type="button" id="btn-close-batch-students-modal" class="btn btn-outline">Close Window</button>
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

          <!-- Dynamic Exam Sections Setup (1 to 10 Sections) -->
          <div class="form-group" style="margin-bottom: 14px; background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label class="form-label" style="font-weight: 700; color: var(--primary); margin: 0;">📁 Exam Sections (1 to 10 Sections)</label>
              <span style="font-size: 0.8rem; color: var(--text-muted);" id="sec-count-badge">1 / 10 Sections</span>
            </div>
            <div style="margin-bottom: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline btn-sm btn-sec-preset" data-preset="single">🚀 1 Sec (General)</button>
              <button type="button" class="btn btn-outline btn-sm btn-sec-preset" data-preset="ssc">📚 SSC (4 Sec)</button>
              <button type="button" class="btn btn-outline btn-sm btn-sec-preset" data-preset="bank">🏦 Bank PO (3 Sec)</button>
            </div>
            <div id="exam-sections-input-container" style="display: flex; flex-direction: column; gap: 8px;">
              <div class="sec-input-row" style="display: flex; gap: 8px; align-items: center;">
                <input type="text" class="form-control exam-sec-name-input" value="General" placeholder="Section Name (e.g. Quantitative Aptitude)" required>
                <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
              </div>
            </div>
            <button type="button" id="btn-add-sec-input-row" class="btn btn-outline btn-sm" style="margin-top: 10px; display: inline-flex; align-items: center; gap: 4px;">
              ➕ Add Section
            </button>
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
    setupInstituteAdminEvents(container, initialTab);
    loadInstituteAdminData(container, initialTab);
  }, 0);

  return container;
}

let cachedExams = [];
let cachedStudents = [];
let cachedBatches = [];

async function loadInstituteAdminData(container, initialTab = 'exams') {
  try {
    const userRes = await apiRequest('/auth/me');
    const user = userRes.user;

    const instName = user.institute_name || 'Coaching Institute';
    const titleEl = container.querySelector('#inst-title');
    const subtitleEl = container.querySelector('#inst-subtitle');

    if (titleEl && subtitleEl) {
      if (initialTab === 'batches') {
        titleEl.textContent = `🏷️ Batches & Classes Management`;
        subtitleEl.textContent = `Create custom batches, standards, manage student enrollments, and approve pending join requests.`;
      } else if (initialTab === 'students') {
        titleEl.textContent = `👥 Enrolled Student Roster`;
        subtitleEl.textContent = `Manage students enrolled in ${instName}, track test performance, and copy invite links.`;
      } else {
        titleEl.textContent = `💻 Online CBT Exam Engine Setup`;
        subtitleEl.textContent = `Create multi-section online CBT exams with positive/negative marking and schedule windows.`;
      }
    }

    if (user.institute_code) {
      container.querySelector('#inst-code-badge').innerHTML = `<i class="ri-key-2-line"></i> Code: ${user.institute_code}`;
    }

    if (!user.institute_id && user.role !== 'super_admin') {
      container.querySelector('#exams-table-body').innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Your account is not assigned to a coaching institute yet. Contact Super Admin.</td></tr>';
      return;
    }

    const [examsRes, studentsRes, quizzesRes, catRes, tagRes, batchesRes, instRes] = await Promise.all([
      apiRequest('/exams'),
      user.institute_id ? apiRequest(`/institutes/${user.institute_id}/students`) : Promise.resolve({ students: [] }),
      apiRequest('/quizzes'),
      apiRequest('/categories').catch(() => ({ flatCategories: [] })),
      apiRequest('/tags').catch(() => ({ tags: [] })),
      apiRequest('/exams/batches/all').catch(() => ({ batches: [] })),
      user.institute_id ? apiRequest(`/institutes/${user.institute_id}`).catch(() => null) : Promise.resolve(null)
    ]);

    cachedExams = examsRes.exams || [];
    cachedStudents = studentsRes.students || [];
    cachedBatches = batchesRes.batches || [];

    // Populate Branding & URLs if institute data returned
    if (instRes && instRes.institute) {
      const inst = instRes.institute;
      const origin = window.location.origin;
      const port = window.location.port ? `:${window.location.port}` : '';
      const slugOrCode = inst.slug || inst.code;

      const subUrl = `http://${slugOrCode}.localhost${port}`;
      const fallbackUrl = `${origin}/?institute=${slugOrCode}`;

      const subInput = container.querySelector('#branding-subdomain-url');
      const fallbackInput = container.querySelector('#branding-fallback-url');
      if (subInput) subInput.value = subUrl;
      if (fallbackInput) fallbackInput.value = fallbackUrl;

      const nameInput = container.querySelector('#brand-name');
      const slugInput = container.querySelector('#brand-slug');
      const logoInput = container.querySelector('#brand-logo');
      const colorInput = container.querySelector('#brand-color');
      const colorPicker = container.querySelector('#brand-color-picker');
      const titleInput = container.querySelector('#brand-title');
      const subtitleInput = container.querySelector('#brand-subtitle');
      const bannerInput = container.querySelector('#brand-banner');
      const allowGlobalCheck = container.querySelector('#brand-allow-global');

      if (nameInput) nameInput.value = inst.name || '';
      if (slugInput) slugInput.value = inst.slug || '';
      if (logoInput) logoInput.value = inst.logo_url || '';
      if (colorInput) colorInput.value = inst.primary_color || '#4f46e5';
      if (colorPicker) colorPicker.value = inst.primary_color || '#4f46e5';
      if (titleInput) titleInput.value = inst.welcome_title || '';
      if (subtitleInput) subtitleInput.value = inst.welcome_subtitle || '';
      if (bannerInput) bannerInput.value = inst.banner_url || '';
      if (allowGlobalCheck) allowGlobalCheck.checked = inst.allow_global_content !== 0;
    }

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

    const statExams = container.querySelector('#inst-stat-exams');
    const statStudents = container.querySelector('#inst-stat-students');
    const statQuizzes = container.querySelector('#inst-stat-quizzes');
    if (statExams) statExams.textContent = cachedExams.length;
    if (statStudents) statStudents.textContent = cachedStudents.length;
    if (statQuizzes) statQuizzes.textContent = (quizzesRes.quizzes || []).length;

    renderExamsTable(container, cachedExams);
    renderBatchesTable(container, cachedBatches);
    renderStudentsTable(container, cachedStudents);
    loadPendingBatchRequests(container);
  } catch (err) {
    console.error('Failed to load institute admin data:', err);
  }
}

async function loadPendingBatchRequests(container) {
  const tbody = container.querySelector('#pending-requests-table-body');
  const countBadge = container.querySelector('#pending-requests-count-badge');
  const subtabBadge = container.querySelector('#subtab-pending-badge');
  if (!tbody) return;

  try {
    const res = await apiRequest('/exams/batches/pending-requests');
    const requests = res.requests || [];

    if (countBadge) countBadge.textContent = `${requests.length} Pending`;
    if (subtabBadge) subtabBadge.textContent = requests.length;

    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No pending student batch join requests.</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(r => `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${r.student_name}</td>
        <td>${r.student_email}</td>
        <td>
          <span class="badge-tag" style="background: rgba(79, 70, 229, 0.1); color: var(--primary); font-weight: 700;">
            ${r.batch_name} ${r.batch_code ? `(${r.batch_code})` : ''}
          </span>
        </td>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-success btn-approve-batch-req" data-uid="${r.user_id}" data-bid="${r.batch_id}" style="padding: 4px 10px; font-weight: 700;">
              ✓ Approve
            </button>
            <button class="btn btn-sm btn-secondary btn-reject-batch-req" data-uid="${r.user_id}" data-bid="${r.batch_id}" style="padding: 4px 10px; color: #ef4444;">
              ✕ Reject
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-approve-batch-req').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Approving...';
        try {
          await apiRequest('/exams/batches/approve-request', {
            method: 'POST',
            body: JSON.stringify({ user_id: btn.dataset.uid, batch_id: btn.dataset.bid, action: 'approve' })
          });
          loadInstituteAdminData(container);
        } catch (e) {
          alert('Error approving request: ' + e.message);
          btn.disabled = false;
        }
      });
    });

    tbody.querySelectorAll('.btn-reject-batch-req').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Rejecting...';
        try {
          await apiRequest('/exams/batches/approve-request', {
            method: 'POST',
            body: JSON.stringify({ user_id: btn.dataset.uid, batch_id: btn.dataset.bid, action: 'reject' })
          });
          loadInstituteAdminData(container);
        } catch (e) {
          alert('Error rejecting request: ' + e.message);
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    console.error('Error loading pending batch requests:', err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Failed to load pending requests.</td></tr>';
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
      <td style="font-weight: 700;">
        <span class="btn-view-batch-students-count" data-id="${b.id}" data-name="${b.name}" style="cursor: pointer; color: var(--primary); text-decoration: underline;" title="Click to view enrolled students">
          ${b.student_count || 0} Students
        </span>
      </td>
      <td>
        <div className="btn-icon-group" style="display: flex; gap: 8px;">
          <button class="btn btn-outline btn-sm btn-view-batch-students" data-id="${b.id}" data-name="${b.name}" title="View Enrolled Students in Batch" aria-label="View Enrolled Students in Batch">
            <i class="ri-user-shared-line"></i> <span class="btn-text-desktop">Enrolled Students</span>
          </button>
          <button class="icon-action-btn btn-danger btn-delete-batch" data-id="${b.id}" title="Delete Batch" aria-label="Delete Batch">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-view-batch-students, .btn-view-batch-students-count').forEach(el => {
    el.addEventListener('click', () => {
      openBatchStudentsModal(container, el.dataset.id, el.dataset.name);
    });
  });

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

let currentBatchStudentList = [];

async function openBatchStudentsModal(container, batchId, batchName) {
  const modal = container.querySelector('#modal-batch-students');
  const title = container.querySelector('#modal-batch-students-title');
  const tbody = container.querySelector('#table-body-batch-students');
  const searchInput = container.querySelector('#search-batch-students');
  if (!modal || !tbody) return;

  if (title) title.textContent = `👥 Enrolled Students - ${batchName}`;
  if (searchInput) searchInput.value = '';
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">Loading batch students...</td></tr>';
  modal.style.display = 'flex';

  try {
    const res = await apiRequest(`/exams/batches/${batchId}/enrolled-students`);
    currentBatchStudentList = res.students || [];

    renderBatchStudentsTable(container, batchId, batchName, currentBatchStudentList, '');

    if (searchInput) {
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        renderBatchStudentsTable(container, batchId, batchName, currentBatchStudentList, query);
      };
    }

  } catch (err) {
    console.error('Error fetching batch students:', err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #ef4444;">Failed to load batch students.</td></tr>';
  }
}

function renderBatchStudentsTable(container, batchId, batchName, students, searchQuery) {
  const tbody = container.querySelector('#table-body-batch-students');
  if (!tbody) return;

  const filtered = students.filter(s =>
    (s.student_name || '').toLowerCase().includes(searchQuery) ||
    (s.student_email || '').toLowerCase().includes(searchQuery)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">No enrolled students found matching search.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isApproved = s.status === 'approved';
    const isPending = s.status === 'pending';
    const isRejected = s.status === 'rejected';

    let statusBadge = `<span class="badge badge-success" style="background: rgba(34, 197, 94, 0.15); color: #16a34a; font-weight: 700; padding: 4px 10px; border-radius: 20px;">Active Enrolled</span>`;
    if (isPending) {
      statusBadge = `<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 700; padding: 4px 10px; border-radius: 20px;">Pending Approval</span>`;
    } else if (isRejected) {
      statusBadge = `<span class="badge badge-danger" style="background: rgba(239, 68, 68, 0.15); color: #dc2626; font-weight: 700; padding: 4px 10px; border-radius: 20px;">Access Revoked</span>`;
    }

    return `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${s.student_name}</td>
        <td>${s.student_email}</td>
        <td>${new Date(s.enrolled_at).toLocaleDateString()}</td>
        <td>${statusBadge}</td>
        <td>
          ${isApproved ? `
            <button class="btn btn-danger btn-sm btn-action-revoke-student" data-uid="${s.user_id}" data-bid="${batchId}" data-name="${s.student_name}" title="Revoke Student Batch Access">
              <i class="ri-user-unfollow-line"></i> <span class="btn-text-desktop">Revoke Access</span>
            </button>
          ` : `
            <button class="btn btn-success btn-sm btn-action-approve-student" data-uid="${s.user_id}" data-bid="${batchId}" data-name="${s.student_name}" title="Approve/Restore Student Batch Access">
              <i class="ri-user-follow-line"></i> <span class="btn-text-desktop">Re-Approve Access</span>
            </button>
          `}
        </td>
      </tr>
    `;
  }).join('');

  // Handle Revoke
  tbody.querySelectorAll('.btn-action-revoke-student').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm(`Revoke batch access for ${btn.dataset.name}? The student will immediately lose access to all batch exams and quizzes.`)) return;
      btn.disabled = true;
      try {
        await apiRequest('/exams/batches/approve-request', {
          method: 'POST',
          body: JSON.stringify({ user_id: btn.dataset.uid, batch_id: btn.dataset.bid, action: 'revoke' })
        });
        openBatchStudentsModal(container, batchId, batchName);
        loadInstituteAdminData(container);
      } catch (e) {
        alert(e.message);
        btn.disabled = false;
      }
    };
  });

  // Handle Re-Approve
  tbody.querySelectorAll('.btn-action-approve-student').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      try {
        await apiRequest('/exams/batches/approve-request', {
          method: 'POST',
          body: JSON.stringify({ user_id: btn.dataset.uid, batch_id: btn.dataset.bid, action: 'approve' })
        });
        openBatchStudentsModal(container, batchId, batchName);
        loadInstituteAdminData(container);
      } catch (e) {
        alert(e.message);
        btn.disabled = false;
      }
    };
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

function setupInstituteAdminEvents(container, initialTab = 'exams') {
  const tabExams = container.querySelector('#tab-inst-exams');
  const tabBatches = container.querySelector('#tab-inst-batches');
  const tabStud = container.querySelector('#tab-inst-students');
  const tabBranding = container.querySelector('#tab-inst-branding');

  const secExams = container.querySelector('#section-inst-exams');
  const secBatches = container.querySelector('#section-inst-batches');
  const secStud = container.querySelector('#section-inst-students');
  const secBranding = container.querySelector('#section-inst-branding');

  const switchTab = (activeBtn, showSec) => {
    [tabExams, tabBatches, tabStud, tabBranding].forEach(b => {
      if (b) {
        b.classList.remove('active');
        b.style.borderBottom = 'none';
        b.style.color = 'var(--text-muted)';
      }
    });
    [secExams, secBatches, secStud, secBranding].forEach(s => { if (s) s.style.display = 'none'; });

    if (activeBtn && showSec) {
      activeBtn.classList.add('active');
      activeBtn.style.borderBottom = '3px solid var(--primary)';
      activeBtn.style.color = 'var(--text-main)';
      showSec.style.display = 'block';
    }
  };

  if (tabExams) tabExams.addEventListener('click', () => switchTab(tabExams, secExams));
  if (tabBatches) tabBatches.addEventListener('click', () => switchTab(tabBatches, secBatches));
  if (tabStud) tabStud.addEventListener('click', () => switchTab(tabStud, secStud));
  if (tabBranding) tabBranding.addEventListener('click', () => switchTab(tabBranding, secBranding));

  // Initial tab activation & section visibility for standalone pages
  [secExams, secBatches, secStud, secBranding].forEach(s => { if (s) s.style.display = 'none'; });

  if (initialTab === 'batches') {
    if (secBatches) secBatches.style.display = 'block';
  } else if (initialTab === 'students') {
    if (secStud) secStud.style.display = 'block';
  } else {
    if (secExams) secExams.style.display = 'block';
  }

  // Sub-Tab Navigation inside Batches & Classes
  const subTabList = container.querySelector('#subtab-inst-batches-list');
  const subTabPending = container.querySelector('#subtab-inst-batches-pending');
  const contentList = container.querySelector('#subtab-content-batches-list');
  const contentPending = container.querySelector('#subtab-content-batches-pending');

  const switchSubTab = (activeSubBtn, showSubContent) => {
    [subTabList, subTabPending].forEach(b => {
      if (b) {
        b.classList.remove('active');
        b.style.borderBottom = 'none';
        b.style.color = 'var(--text-muted)';
      }
    });
    [contentList, contentPending].forEach(c => { if (c) c.style.display = 'none'; });

    if (activeSubBtn && showSubContent) {
      activeSubBtn.classList.add('active');
      activeSubBtn.style.borderBottom = '3px solid var(--primary)';
      activeSubBtn.style.color = 'var(--text-main)';
      showSubContent.style.display = 'block';
    }
  };

  if (subTabList) subTabList.addEventListener('click', () => switchSubTab(subTabList, contentList));
  if (subTabPending) subTabPending.addEventListener('click', () => switchSubTab(subTabPending, contentPending));

  // Batch Students Modal Close handlers
  const modalBatchStudents = container.querySelector('#modal-batch-students');
  const closeBtn1 = container.querySelector('#close-modal-batch-students');
  const closeBtn2 = container.querySelector('#btn-close-batch-students-modal');

  const closeBatchModal = () => { if (modalBatchStudents) modalBatchStudents.style.display = 'none'; };
  if (closeBtn1) closeBtn1.addEventListener('click', closeBatchModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeBatchModal);

  // Copy Subdomain & Fallback Link handlers
  const btnCopySub = container.querySelector('#btn-copy-subdomain');
  const btnCopyFallback = container.querySelector('#btn-copy-fallback');
  const subInput = container.querySelector('#branding-subdomain-url');
  const fallbackInput = container.querySelector('#branding-fallback-url');

  if (btnCopySub && subInput) {
    btnCopySub.addEventListener('click', () => {
      navigator.clipboard.writeText(subInput.value);
      btnCopySub.textContent = 'Copied! ✓';
      setTimeout(() => btnCopySub.textContent = 'Copy', 2000);
    });
  }

  if (btnCopyFallback && fallbackInput) {
    btnCopyFallback.addEventListener('click', () => {
      navigator.clipboard.writeText(fallbackInput.value);
      btnCopyFallback.textContent = 'Copied! ✓';
      setTimeout(() => btnCopyFallback.textContent = 'Copy', 2000);
    });
  }

  // Color picker sync
  const colorPicker = container.querySelector('#brand-color-picker');
  const colorInput = container.querySelector('#brand-color');
  if (colorPicker && colorInput) {
    colorPicker.addEventListener('input', (e) => colorInput.value = e.target.value);
    colorInput.addEventListener('input', (e) => colorPicker.value = e.target.value);
  }

  // Branding Form submit
  const formBranding = container.querySelector('#form-branding');
  if (formBranding) {
    formBranding.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = container.querySelector('#btn-save-branding');
      try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving Branding...';

        const payload = {
          name: container.querySelector('#brand-name').value,
          slug: container.querySelector('#brand-slug').value,
          logo_url: container.querySelector('#brand-logo').value,
          primary_color: container.querySelector('#brand-color').value,
          welcome_title: container.querySelector('#brand-title').value,
          welcome_subtitle: container.querySelector('#brand-subtitle').value,
          banner_url: container.querySelector('#brand-banner').value,
          allow_global_content: container.querySelector('#brand-allow-global').checked
        };

        const res = await apiRequest('/institutes/my-branding', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });

        alert('✅ Portal branding saved successfully!');
        if (res.institute) {
          container.querySelector('#brand-slug').value = res.institute.slug;
          const origin = window.location.origin;
          const port = window.location.port ? `:${window.location.port}` : '';
          const slugOrCode = res.institute.slug || res.institute.code;
          if (subInput) subInput.value = `http://${slugOrCode}.localhost${port}`;
          if (fallbackInput) fallbackInput.value = `${origin}/?institute=${slugOrCode}`;
        }
      } catch (err) {
        alert(err.message || 'Error saving portal branding.');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save Portal Branding';
      }
    });
  }

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
  const openModal = () => {
    let currentModal = document.querySelector('#modal-create-exam') || container.querySelector('#modal-create-exam');
    if (!currentModal) return;

    if (!document.body.contains(currentModal)) {
      document.body.appendChild(currentModal);
    }

    const heading = currentModal.querySelector('#modal-exam-heading');
    const editId = currentModal.querySelector('#edit-exam-id');
    const submitBtn = currentModal.querySelector('#submit-modal-exam');
    const currentForm = currentModal.querySelector('#form-create-exam');
    const currentBatchChecklist = currentModal.querySelector('#exam-batch-checklist');

    if (heading) heading.textContent = 'Create Online CBT Exam';
    if (editId) editId.value = '';
    if (submitBtn) submitBtn.textContent = 'Create Exam';
    if (currentForm) currentForm.reset();
    if (currentBatchChecklist) currentBatchChecklist.style.display = 'none';

    currentModal.style.display = 'flex';
    currentModal.style.position = 'fixed';
    currentModal.style.inset = '0';
    currentModal.style.zIndex = '99999';
    currentModal.style.background = 'rgba(15, 23, 42, 0.75)';
    currentModal.style.backdropFilter = 'blur(4px)';
    currentModal.style.alignItems = 'center';
    currentModal.style.justifyContent = 'center';
  };

  const closeModal = () => {
    const currentModal = document.querySelector('#modal-create-exam') || container.querySelector('#modal-create-exam');
    if (!currentModal) return;
    const currentForm = currentModal.querySelector('#form-create-exam');
    currentModal.style.display = 'none';
    if (currentForm) currentForm.reset();
  };

  // Delegate click for Create Exam button across document & container
  const handleCreateExamClick = (e) => {
    const targetBtn = e.target.closest('#btn-create-exam, .btn-open-create-exam');
    if (targetBtn) {
      e.preventDefault();
      openModal();
    }
  };

  container.removeEventListener('click', handleCreateExamClick);
  container.addEventListener('click', handleCreateExamClick);

  // Close handlers
  const currentModalEl = document.querySelector('#modal-create-exam') || container.querySelector('#modal-create-exam');
  if (currentModalEl) {
    const btnClose = currentModalEl.querySelector('#close-modal-exam');
    const btnCancel = currentModalEl.querySelector('#cancel-modal-exam');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    currentModalEl.addEventListener('click', (e) => {
      if (e.target === currentModalEl) closeModal();
    });

    // Section input rows & presets logic
    const secInputContainer = currentModalEl.querySelector('#exam-sections-input-container');
    const btnAddSecRow = currentModalEl.querySelector('#btn-add-sec-input-row');
    const secBadge = currentModalEl.querySelector('#sec-count-badge');

    const updateSecBadge = () => {
      if (!secInputContainer) return;
      const count = secInputContainer.querySelectorAll('.sec-input-row').length;
      if (secBadge) secBadge.textContent = `${count} / 10 Sections`;
      if (btnAddSecRow) btnAddSecRow.disabled = count >= 10;
    };

    const setSectionsList = (names) => {
      if (!secInputContainer) return;
      secInputContainer.innerHTML = '';
      names.forEach(name => {
        const row = document.createElement('div');
        row.className = 'sec-input-row';
        row.style.cssText = 'display: flex; gap: 8px; align-items: center;';
        row.innerHTML = `
          <input type="text" class="form-control exam-sec-name-input" value="${name}" placeholder="Section Name" required>
          <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
        `;
        secInputContainer.appendChild(row);
      });
      updateSecBadge();
    };

    if (btnAddSecRow) {
      btnAddSecRow.addEventListener('click', () => {
        const count = secInputContainer.querySelectorAll('.sec-input-row').length;
        if (count >= 10) {
          alert('Maximum of 10 sections allowed per exam.');
          return;
        }
        const row = document.createElement('div');
        row.className = 'sec-input-row';
        row.style.cssText = 'display: flex; gap: 8px; align-items: center;';
        row.innerHTML = `
          <input type="text" class="form-control exam-sec-name-input" value="Section ${count + 1}" placeholder="Section Name" required>
          <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
        `;
        secInputContainer.appendChild(row);
        updateSecBadge();
      });
    }

    if (secInputContainer) {
      secInputContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-sec-row')) {
          const rows = secInputContainer.querySelectorAll('.sec-input-row');
          if (rows.length <= 1) {
            alert('An exam must have at least 1 section.');
            return;
          }
          e.target.closest('.sec-input-row').remove();
          updateSecBadge();
        }
      });
    }

    currentModalEl.querySelectorAll('.btn-sec-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'single') setSectionsList(['General']);
        else if (preset === 'ssc') setSectionsList(['General Intelligence & Reasoning', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension']);
        else if (preset === 'bank') setSectionsList(['Reasoning Ability', 'Quantitative Aptitude', 'English Language']);
      });
    });

    const form = currentModalEl.querySelector('#form-create-exam');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = currentModalEl.querySelector('#edit-exam-id')?.value || '';
        const visVal = currentModalEl.querySelector('#exam-visibility') ? currentModalEl.querySelector('#exam-visibility').value : 'private';
        const catSelectEl = currentModalEl.querySelector('#exam-category-id');
        const selectedCatOpt = catSelectEl && catSelectEl.selectedIndex >= 0 ? catSelectEl.options[catSelectEl.selectedIndex] : null;

        if (visVal === 'public' && selectedCatOpt && selectedCatOpt.dataset?.type === 'private') {
          alert('To publish a Global Open Test, you must select a Global Master Category (created by Super Admin). Private categories cannot be used for global tests.');
          return;
        }

        const selectedTagIds = Array.from(currentModalEl.querySelectorAll('.exam-tag-cb:checked')).map(cb => parseInt(cb.value, 10));
        const allocMode = currentModalEl.querySelector('input[name="batch_allocation_mode"]:checked')?.value || 'all';
        const isAllBatches = allocMode === 'all';
        const selectedBatchIds = isAllBatches ? [] : Array.from(currentModalEl.querySelectorAll('.exam-batch-cb:checked')).map(cb => parseInt(cb.value, 10));

        const sectionInputs = Array.from(currentModalEl.querySelectorAll('.exam-sec-name-input'))
          .map(inp => inp.value.trim())
          .filter(Boolean);

        const payload = {
          title: currentModalEl.querySelector('#exam-title').value.trim(),
          category_id: currentModalEl.querySelector('#exam-category-id').value ? parseInt(currentModalEl.querySelector('#exam-category-id').value, 10) : null,
          exam_type: currentModalEl.querySelector('#exam-type').value,
          mode: currentModalEl.querySelector('#exam-mode').value || 'actual',
          is_public: visVal === 'public',
          total_duration_mins: parseInt(currentModalEl.querySelector('#exam-duration').value, 10),
          positive_marks: parseFloat(currentModalEl.querySelector('#exam-pos').value),
          negative_marks: parseFloat(currentModalEl.querySelector('#exam-neg').value),
          instructions: currentModalEl.querySelector('#exam-instructions').value.trim() || null,
          tag_ids: selectedTagIds,
          is_all_batches: isAllBatches,
          batch_ids: selectedBatchIds,
          sections: sectionInputs.length > 0 ? sectionInputs : ['General'],
          scheduled_start: currentModalEl.querySelector('#exam-start').value || null,
          scheduled_end: currentModalEl.querySelector('#exam-end').value || null
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
    }
  }

  const btnCopyCode = container.querySelector('#btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', async () => {
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

      bodyEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 4px;">
          <div>
            <strong style="font-size: 1rem; color: var(--primary);">Exam Sections (${sections.length} / 10)</strong>
            <span style="font-size: 0.82rem; color: var(--text-muted); display: block;">Organize test into 1 to 10 custom sections</span>
          </div>
          <button id="btn-add-modal-section" class="btn btn-primary btn-sm" ${sections.length >= 10 ? 'disabled style="opacity: 0.6;"' : ''}>
            ➕ Add Section
          </button>
        </div>
      ` + sections.map((sec, idx) => `
        <div class="card" style="padding: 18px; border: 1px solid var(--border-color); background: var(--bg-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                📁 Section ${idx + 1}: ${sec.section_name}
              </h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                ${sec.questions ? sec.questions.length : 0} Question(s) Attached
              </span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-outline btn-sm btn-rename-sec" data-secid="${sec.id}" data-secname="${sec.section_name}" title="Rename Section">
                ✏️ Rename
              </button>
              ${idx > 0 ? `<button class="btn btn-outline btn-sm btn-move-sec-up" data-idx="${idx}" title="Move Up">⬆️</button>` : ''}
              ${idx < sections.length - 1 ? `<button class="btn btn-outline btn-sm btn-move-sec-down" data-idx="${idx}" title="Move Down">⬇️</button>` : ''}
              <button class="btn btn-outline btn-sm btn-delete-sec" data-secid="${sec.id}" data-secname="${sec.section_name}" data-qcount="${sec.questions ? sec.questions.length : 0}" style="color: var(--danger); border-color: var(--danger);" title="Delete Section">
                🗑️ Delete
              </button>
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

      // Wire Add Section button
      const btnAddModalSec = bodyEl.querySelector('#btn-add-modal-section');
      if (btnAddModalSec) {
        btnAddModalSec.addEventListener('click', async () => {
          if (sections.length >= 10) return alert('Maximum of 10 sections allowed per exam.');
          const secName = prompt('Enter new section name (e.g. Reasoning, Physics, General Knowledge):');
          if (secName && secName.trim()) {
            try {
              await apiRequest(`/exams/${exam.id}/sections`, {
                method: 'POST',
                body: JSON.stringify({ section_name: secName.trim() })
              });
              await reloadBuilderContent();
              loadInstituteAdminData(container);
            } catch (err) {
              alert(`Error adding section: ${err.message}`);
            }
          }
        });
      }

      // Wire Rename Section buttons
      bodyEl.querySelectorAll('.btn-rename-sec').forEach(btn => {
        btn.addEventListener('click', async () => {
          const sId = btn.dataset.secid;
          const oldName = btn.dataset.secname;
          const newName = prompt('Rename section:', oldName);
          if (newName && newName.trim() && newName.trim() !== oldName) {
            try {
              await apiRequest(`/exams/sections/${sId}`, {
                method: 'PUT',
                body: JSON.stringify({ section_name: newName.trim() })
              });
              await reloadBuilderContent();
              loadInstituteAdminData(container);
            } catch (err) {
              alert(`Error renaming section: ${err.message}`);
            }
          }
        });
      });

      // Wire Delete Section buttons
      bodyEl.querySelectorAll('.btn-delete-sec').forEach(btn => {
        btn.addEventListener('click', async () => {
          const sId = btn.dataset.secid;
          const sName = btn.dataset.secname;
          const qCount = parseInt(btn.dataset.qcount, 10);
          if (sections.length <= 1) {
            return alert('An exam must have at least 1 section. You cannot delete the only section.');
          }
          let msg = `Are you sure you want to delete section "${sName}"?`;
          if (qCount > 0) {
            msg += `\nWarning: This section has ${qCount} attached question(s). Deleting it will detach those questions from this exam.`;
          }
          if (confirm(msg)) {
            try {
              await apiRequest(`/exams/sections/${sId}`, { method: 'DELETE' });
              await reloadBuilderContent();
              loadInstituteAdminData(container);
            } catch (err) {
              alert(`Error deleting section: ${err.message}`);
            }
          }
        });
      });

      // Wire Move Up/Down buttons for section reordering
      const handleReorder = async (fromIdx, toIdx) => {
        const reordered = [...sections];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        const section_orders = reordered.map((s, idx) => ({ id: s.id, order: idx + 1 }));
        try {
          await apiRequest(`/exams/${exam.id}/sections/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ section_orders })
          });
          await reloadBuilderContent();
          loadInstituteAdminData(container);
        } catch (err) {
          alert(`Error reordering sections: ${err.message}`);
        }
      };

      bodyEl.querySelectorAll('.btn-move-sec-up').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx > 0) handleReorder(idx, idx - 1);
        });
      });

      bodyEl.querySelectorAll('.btn-move-sec-down').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx < sections.length - 1) handleReorder(idx, idx + 1);
        });
      });

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
