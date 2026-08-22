import { apiRequest } from '../services/api.js';

export function renderSuperAdminView() {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <div class="saas-header">
      <div class="saas-title-group">
        <h1>Super Admin Console 👑</h1>
        <p>Global multi-tenant platform oversight, coaching institute administration, and system metrics.</p>
      </div>
      <div>
        <button id="btn-create-institute" class="btn btn-primary">
          <i class="ri-add-line"></i> Create Coaching Institute
        </button>
      </div>
    </div>

    <!-- Platform Stats Cards -->
    <div class="saas-stats-grid">
      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-building-4-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-institutes">-</span>
          <span class="saas-stat-label">Coaching Institutes</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-user-star-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-students">-</span>
          <span class="saas-stat-label">Enrolled Students</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-questionnaire-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-quizzes">-</span>
          <span class="saas-stat-label">Active Quizzes</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-shield-user-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-users">-</span>
          <span class="saas-stat-label">Total Accounts</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px;">
      <button id="tab-institutes" class="btn-text active" style="font-weight: 700; padding: 10px 16px; border-bottom: 3px solid var(--primary);">Coaching Institutes</button>
      <button id="tab-users" class="btn-text" style="font-weight: 700; padding: 10px 16px; color: var(--text-muted);">Users & Roles</button>
    </div>

    <!-- Tab 1: Institutes Table -->
    <div id="section-institutes">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.2rem; font-weight: 700;">Coaching Institutes Directory</h3>
          <input type="text" id="search-institutes" placeholder="Search institute name or code..." style="padding: 8px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); width: 280px;">
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Institute Name</th>
                <th>Institute Code</th>
                <th>Contact Email</th>
                <th>Students</th>
                <th>Quizzes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="institutes-table-body">
              <tr><td colspan="7" style="text-align: center; padding: 30px;">Loading institutes...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 2: Users & Roles Table -->
    <div id="section-users" style="display: none;">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.2rem; font-weight: 700;">User Accounts & Role Permissions</h3>
          <input type="text" id="search-users" placeholder="Search by name or email..." style="padding: 8px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); width: 280px;">
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Institute</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="users-table-body">
              <tr><td colspan="6" style="text-align: center; padding: 30px;">Loading users...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Institute Modal -->
    <div id="modal-create-inst" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 540px; padding: 24px; background: var(--card-bg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="font-size: 1.3rem; font-weight: 800;">Register New Coaching Institute</h3>
          <button id="close-modal-inst" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <form id="form-create-inst">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Institute Name *</label>
            <input type="text" id="inst-name" class="form-control" placeholder="e.g. Apex Academy" required>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Contact Email *</label>
            <input type="email" id="inst-email" class="form-control" placeholder="contact@apexacademy.com" required>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Address / Location</label>
            <input type="text" id="inst-address" class="form-control" placeholder="City, State">
          </div>

          <hr style="margin: 18px 0; border: none; border-top: 1px solid var(--border-color);">
          <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 10px;">Institute Admin Account (Optional)</h4>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Admin Name</label>
              <input type="text" id="inst-admin-name" class="form-control" placeholder="John Doe">
            </div>
            <div class="form-group">
              <label class="form-label">Admin Email</label>
              <input type="email" id="inst-admin-email" class="form-control" placeholder="admin@apex.com">
            </div>
          </div>

          <div class="form-group" style="margin-top: 12px; margin-bottom: 20px;">
            <label class="form-label">Admin Password</label>
            <input type="password" id="inst-admin-pass" class="form-control" placeholder="Initial password">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" id="cancel-modal-inst" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Institute</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Attach event listeners and load data
  setTimeout(() => {
    setupSuperAdminEvents(container);
    loadSuperAdminData(container);
  }, 0);

  return container;
}

let cachedInstitutes = [];
let cachedUsers = [];

async function loadSuperAdminData(container) {
  try {
    const [instRes, userRes] = await Promise.all([
      apiRequest('/institutes'),
      apiRequest('/auth/users')
    ]);

    cachedInstitutes = instRes.institutes || [];
    cachedUsers = userRes.users || [];

    // Calculate metrics
    let totalStudents = 0;
    let totalQuizzes = 0;
    cachedInstitutes.forEach(i => {
      totalStudents += parseInt(i.student_count || 0, 10);
      totalQuizzes += parseInt(i.quiz_count || 0, 10);
    });

    container.querySelector('#stat-institutes').textContent = cachedInstitutes.length;
    container.querySelector('#stat-students').textContent = totalStudents;
    container.querySelector('#stat-quizzes').textContent = totalQuizzes;
    container.querySelector('#stat-users').textContent = cachedUsers.length;

    renderInstitutesTable(container, cachedInstitutes);
    renderUsersTable(container, cachedUsers);
  } catch (err) {
    console.error('Failed to load Super Admin data:', err);
  }
}

function renderInstitutesTable(container, list) {
  const tbody = container.querySelector('#institutes-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No coaching institutes found. Click "Create Coaching Institute" to add one.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(i => `
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${i.name}</td>
      <td><span class="code-pill">${i.code}</span></td>
      <td>${i.contact_email}</td>
      <td style="font-weight: 700;">${i.student_count || 0}</td>
      <td>${i.quiz_count || 0}</td>
      <td><span class="status-badge status-${i.status}">${i.status}</span></td>
      <td>
        <button class="btn-text btn-toggle-status" data-id="${i.id}" data-status="${i.status}" style="font-size: 0.85rem; font-weight: 600; color: var(--primary);">
          ${i.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  `).join('');

  // Attach toggle listeners
  tbody.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const current = btn.dataset.status;
      const nextStatus = current === 'active' ? 'inactive' : 'active';
      try {
        await apiRequest(`/institutes/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: nextStatus })
        });
        loadSuperAdminData(container);
      } catch (err) {
        alert(err.message || 'Error updating status');
      }
    });
  });
}

function renderUsersTable(container, list) {
  const tbody = container.querySelector('#users-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(u => `
    <tr>
      <td style="font-weight: 700;">${u.full_name}</td>
      <td>${u.email}</td>
      <td><span class="role-badge role-${u.role}">${u.role}</span></td>
      <td>${u.institute_name ? `<span class="institute-badge"><i class="ri-building-line"></i> ${u.institute_name}</span>` : '<span style="color: var(--text-light);">-</span>'}</td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td>
        ${u.role !== 'super_admin' ? `
          <select class="role-selector" data-id="${u.id}" style="padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.85rem;">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Student / User</option>
            <option value="institute_admin" ${u.role === 'institute_admin' ? 'selected' : ''}>Institute Admin</option>
          </select>
        ` : '<span style="font-size: 0.8rem; color: var(--text-light);">Owner</span>'}
      </td>
    </tr>
  `).join('');

  // Attach role selector listeners
  tbody.querySelectorAll('.role-selector').forEach(select => {
    select.addEventListener('change', async () => {
      const userId = select.dataset.id;
      const newRole = select.value;
      try {
        await apiRequest(`/auth/users/${userId}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role: newRole })
        });
        loadSuperAdminData(container);
      } catch (err) {
        alert(err.message || 'Error updating user role');
      }
    });
  });
}

function setupSuperAdminEvents(container) {
  const tabInst = container.querySelector('#tab-institutes');
  const tabUsers = container.querySelector('#tab-users');
  const secInst = container.querySelector('#section-institutes');
  const secUsers = container.querySelector('#section-users');

  tabInst.addEventListener('click', () => {
    tabInst.classList.add('active');
    tabInst.style.borderBottom = '3px solid var(--primary)';
    tabInst.style.color = 'var(--text-main)';
    tabUsers.classList.remove('active');
    tabUsers.style.borderBottom = 'none';
    tabUsers.style.color = 'var(--text-muted)';
    secInst.style.display = 'block';
    secUsers.style.display = 'none';
  });

  tabUsers.addEventListener('click', () => {
    tabUsers.classList.add('active');
    tabUsers.style.borderBottom = '3px solid var(--primary)';
    tabUsers.style.color = 'var(--text-main)';
    tabInst.classList.remove('active');
    tabInst.style.borderBottom = 'none';
    tabInst.style.color = 'var(--text-muted)';
    secUsers.style.display = 'block';
    secInst.style.display = 'none';
  });

  // Modal handlers
  const modal = container.querySelector('#modal-create-inst');
  const btnCreate = container.querySelector('#btn-create-institute');
  const btnClose = container.querySelector('#close-modal-inst');
  const btnCancel = container.querySelector('#cancel-modal-inst');
  const form = container.querySelector('#form-create-inst');

  const openModal = () => { modal.style.display = 'flex'; };
  const closeModal = () => { modal.style.display = 'none'; form.reset(); };

  btnCreate.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: container.querySelector('#inst-name').value.trim(),
      contact_email: container.querySelector('#inst-email').value.trim(),
      address: container.querySelector('#inst-address').value.trim(),
      admin_name: container.querySelector('#inst-admin-name').value.trim(),
      admin_email: container.querySelector('#inst-admin-email').value.trim(),
      admin_password: container.querySelector('#inst-admin-pass').value.trim()
    };

    try {
      const res = await apiRequest('/institutes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert(`Institute "${payload.name}" created successfully! Code: ${res.code}`);
      closeModal();
      loadSuperAdminData(container);
    } catch (err) {
      alert(err.message || 'Error creating institute.');
    }
  });

  // Search filters
  container.querySelector('#search-institutes').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = cachedInstitutes.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
    renderInstitutesTable(container, filtered);
  });

  container.querySelector('#search-users').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = cachedUsers.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    renderUsersTable(container, filtered);
  });
}
