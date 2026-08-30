import { api } from '../services/api.js';
import { showLoadingOverlay, hideLoadingOverlay } from '../components/LoadingOverlayModal.js';

let currentPage = 1;
let currentLimit = 20;
let paginationMeta = { total: 0, page: 1, limit: 20, totalPages: 1 };
let searchDebounceTimer = null;

export function renderUserManagementView(navigate) {
  currentPage = 1;

  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
          👑 User Role Control & Access Management
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Platform-wide user management. Assign administrator permissions, adjust user roles, and monitor active accounts with server-side pagination.
        </p>
      </div>
      <span class="role-badge super_admin" style="font-size: 0.9rem; padding: 6px 14px;">
        👑 Super Admin Privileged
      </span>
    </div>

    <!-- User Metrics Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total User Accounts</span>
        <div id="statTotalUsers" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Super Administrators</span>
        <div id="statSuperAdmins" style="font-size: 1.8rem; font-weight: 800; color: #8b5cf6; margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Institute Admins</span>
        <div id="statInstituteAdmins" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Quiz Admins</span>
        <div id="statQuizAdmins" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Students / Users</span>
        <div id="statStudents" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-</div>
      </div>
    </div>

    <!-- User Table Card -->
    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">User Account Directory</h3>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <select id="roleFilter" class="form-select" style="padding: 8px 12px; width: 160px; font-size: 0.88rem;">
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="institute_admin">Institute Admin</option>
            <option value="admin">Quiz Admin</option>
            <option value="user">Student / User</option>
          </select>
          <input type="text" id="userSearchInput" class="form-input" placeholder="🔍 Search name, email, phone..." style="width: 260px; font-size: 0.88rem;" />
        </div>
      </div>

      <div class="table-wrap">
        <table class="custom-table mobile-card-table" style="width: 100%;">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Registration Date</th>
              <th>Role Permission Actions</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr>
              <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                Loading user directory...
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Pagination Container -->
      <div id="usersPaginationContainer" style="margin-top: 20px;"></div>
    </div>
  `;

  loadUserManagementData(container);
  setupFilterEvents(container);
  return container;
}

async function loadUserManagementData(container) {
  const roleVal = container.querySelector('#roleFilter')?.value || '';
  const searchVal = container.querySelector('#userSearchInput')?.value.trim() || '';

  showLoadingOverlay('Loading User Accounts...', 'Fetching users & role statistics...');

  try {
    const res = await api.getUsers({
      page: currentPage,
      limit: currentLimit,
      role: roleVal,
      search: searchVal
    });

    const usersList = res.users || [];
    const stats = res.stats || {};
    paginationMeta = res.pagination || { total: usersList.length, page: currentPage, limit: currentLimit, totalPages: 1 };

    // Update Metric Cards
    container.querySelector('#statTotalUsers').textContent = (stats.total || 0).toLocaleString();
    container.querySelector('#statSuperAdmins').textContent = (stats.super_admin || 0).toLocaleString();
    container.querySelector('#statInstituteAdmins').textContent = (stats.institute_admin || 0).toLocaleString();
    container.querySelector('#statQuizAdmins').textContent = (stats.admin || 0).toLocaleString();
    container.querySelector('#statStudents').textContent = (stats.user || 0).toLocaleString();

    renderUsersTable(container, usersList);
    renderUserPagination(container);
  } catch (err) {
    const tbody = container.querySelector('#usersTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--danger);">Error loading users: ${err.message}</td></tr>`;
    }
  } finally {
    hideLoadingOverlay();
  }
}

function renderUsersTable(container, list) {
  const tbody = container.querySelector('#usersTableBody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No users match the search filter.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(u => {
    const isSuper = u.role === 'super_admin';
    return `
      <tr>
        <td data-label="ID" style="font-weight: 700; color: var(--text-muted); font-size: 0.85rem;">#${u.id}</td>
        <td data-label="Name" style="font-weight: 700; color: var(--text-main);">${u.full_name}</td>
        <td data-label="Email">${u.email}</td>
        <td data-label="Role">
          <span class="role-badge ${u.role}">${u.role.replace('_', ' ')}</span>
        </td>
        <td data-label="Registered" style="font-size: 0.85rem; color: var(--text-muted);">${new Date(u.created_at).toLocaleDateString()}</td>
        <td data-label="Action">
          ${isSuper ? '<span style="font-size:0.82rem; color:var(--text-muted); font-style:italic;">Protected Owner</span>' : `
            <select class="user-role-select form-select" data-id="${u.id}" style="padding: 4px 8px; font-size: 0.82rem; width: 140px; display: inline-block;">
              <option value="user" ${u.role === 'user' ? 'selected' : ''}>Student / User</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Quiz Admin</option>
              <option value="institute_admin" ${u.role === 'institute_admin' ? 'selected' : ''}>Institute Admin</option>
            </select>
          `}
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.user-role-select').forEach(select => {
    select.addEventListener('change', async () => {
      const userId = select.dataset.id;
      const newRole = select.value;
      try {
        await api.updateUserRole(userId, newRole);
        loadUserManagementData(container);
      } catch (err) {
        alert(err.message || 'Error updating user role');
      }
    });
  });
}

function renderUserPagination(container) {
  const pageBox = container.querySelector('#usersPaginationContainer');
  if (!pageBox) return;

  const { total, page, limit, totalPages } = paginationMeta;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  pageBox.innerHTML = `
    <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:12px 18px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <div style="font-size:0.88rem; color:var(--text-muted); font-weight:600;">
        Showing <strong style="color:var(--text-main);">${startItem}–${endItem}</strong> of <strong style="color:var(--primary);">${total.toLocaleString()}</strong> users
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
        </select>
      </div>
    </div>
  `;

  pageBox.querySelector('.btn-page-first')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage = 1; loadUserManagementData(container); }
  });
  pageBox.querySelector('.btn-page-prev')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; loadUserManagementData(container); }
  });
  pageBox.querySelector('.btn-page-next')?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage++; loadUserManagementData(container); }
  });
  pageBox.querySelector('.btn-page-last')?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage = totalPages; loadUserManagementData(container); }
  });
  pageBox.querySelector('.select-page-limit')?.addEventListener('change', (e) => {
    currentLimit = parseInt(e.target.value, 10) || 20;
    currentPage = 1;
    loadUserManagementData(container);
  });
}

function setupFilterEvents(container) {
  const searchInput = container.querySelector('#userSearchInput');
  const roleFilter = container.querySelector('#roleFilter');

  if (roleFilter) {
    roleFilter.addEventListener('change', () => {
      currentPage = 1;
      loadUserManagementData(container);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        currentPage = 1;
        loadUserManagementData(container);
      }, 300);
    });
  }
}
