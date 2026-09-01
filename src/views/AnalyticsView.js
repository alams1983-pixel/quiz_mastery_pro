import { apiRequest, getUser } from '../services/api.js';
import { showLoadingOverlay, hideLoadingOverlay } from '../components/LoadingOverlayModal.js';

export function renderAnalyticsView(navigate) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  const user = getUser() || { role: 'user' };

  if (user.role === 'super_admin') {
    renderSuperAdminPlatformAnalytics(container, navigate);
  } else if (user.role === 'institute_admin' || user.role === 'admin') {
    renderInstituteStudentAnalytics(container, navigate);
  } else {
    renderStudentExamAnalytics(container, navigate);
  }

  return container;
}

// =========================================================================
// 1. STUDENT CBT EXAM ANALYTICS VIEW (FOR STUDENT ROLE)
// =========================================================================
async function renderStudentExamAnalytics(container, navigate) {
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">📊 My CBT Exam Analytics & Performance</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Track your online mock exam attempts, percentiles, institute rankings, and detailed solution scorecards.
      </p>
    </div>

    <!-- Exam Performance Overview Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Exams Attempted</span>
        <div id="stExamsTotal" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Average Accuracy</span>
        <div id="stAvgAcc" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-%</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Average Score</span>
        <div id="stAvgScore" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Average Percentile</span>
        <div id="stAvgPercentile" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-%</div>
      </div>
    </div>

    <!-- CBT Exam Attempt History Table -->
    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">📜 Online CBT Exam Attempt History</h3>
      </div>

      <div style="overflow-x: auto;">
        <table class="custom-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Exam Title</th>
              <th>Mode</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Percentile</th>
              <th>Rank</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="stExamHistoryTbody">
            <tr><td colspan="8" style="text-align: center; padding: 24px;">Loading CBT exam performance history...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  try {
    const res = await apiRequest('/analytics/student-exam-stats');
    container.querySelector('#stExamsTotal').textContent = res.totalExams || 0;
    container.querySelector('#stAvgAcc').textContent = (res.avgAccuracy || 0) + '%';
    container.querySelector('#stAvgScore').textContent = res.avgScore || '0.00';
    container.querySelector('#stAvgPercentile').textContent = (res.avgPercentile || 0) + '%';

    const tbody = container.querySelector('#stExamHistoryTbody');
    const attempts = res.attempts || [];

    if (attempts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No online exam attempt logs found yet. Start an exam from your dashboard!</td></tr>';
      return;
    }

    tbody.innerHTML = attempts.map(att => `
      <tr>
        <td>${new Date(att.submit_time || att.created_at).toLocaleString()}</td>
        <td style="font-weight: 700; color: var(--text-main);">${att.exam_title}</td>
        <td><span style="text-transform: capitalize; font-weight: 600;">${att.mode}</span></td>
        <td style="font-weight: 800; color: var(--primary);">${parseFloat(att.total_score).toFixed(2)}</td>
        <td><span style="color: var(--success); font-weight: 700;">${Math.round(att.accuracy_pct)}%</span></td>
        <td><span style="font-weight: 700; color: #f59e0b;">${att.percentile ? Math.round(att.percentile) + '%' : 'N/A'}</span></td>
        <td><span class="badge-tag">Rank #${att.institute_rank || 'N/A'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline btn-view-scorecard" data-attemptid="${att.id}">
            📊 Scorecard & Solutions
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-view-scorecard').forEach(btn => {
      btn.addEventListener('click', () => {
        const attemptId = btn.dataset.attemptid;
        navigate('exam-analysis', { attemptId });
      });
    });
  } catch (err) {
    console.error('Student Exam Analytics Error:', err);
  }
}

// =========================================================================
// 2. COACHING INSTITUTE STUDENT ANALYTICS VIEW (FOR TEACHER / COACHING ADMIN)
// =========================================================================
let instRosterPage = 1;
let instRosterLimit = 20;
let instRosterMeta = null;

async function renderInstituteStudentAnalytics(container, navigate) {
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">🏫 Institute Student Performance Analytics</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Comprehensive student roster, accuracy percentiles, total CBT test attempts, and overall class performance metrics.
      </p>
    </div>

    <!-- Overview Metrics Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Enrolled Students</span>
        <div id="instTotalStudents" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Student Attempts</span>
        <div id="instTotalExamAttempts" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Class Average Accuracy</span>
        <div id="instClassAvgAcc" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-%</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Class Average Score</span>
        <div id="instClassAvgScore" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-</div>
      </div>
    </div>

    <!-- Student Performance Roster Table -->
    <div class="card" style="padding: 24px; margin-bottom: 28px;">
      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 16px;">👥 Student Performance Roster</h3>
      <div style="overflow-x: auto;">
        <table class="custom-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Exams Attempted</th>
              <th>Average Accuracy</th>
              <th>Max Score</th>
              <th>Best Percentile</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody id="instRosterTbody">
            <tr><td colspan="7" style="text-align: center; padding: 24px;">Loading student performance roster...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Roster Pagination Container -->
      <div id="rosterPaginationContainer" style="margin-top: 20px;"></div>
    </div>
  `;

  loadRosterData(container);
}

async function loadRosterData(container) {
  showLoadingOverlay('Loading Student Roster Analytics...', 'Fetching performance stats...');

  try {
    const res = await apiRequest(`/analytics/institute-student-analytics?page=${instRosterPage}&limit=${instRosterLimit}`);
    container.querySelector('#instTotalStudents').textContent = (res.totalStudents || 0).toLocaleString();
    container.querySelector('#instTotalExamAttempts').textContent = (res.totalExamAttempts || 0).toLocaleString();
    container.querySelector('#instClassAvgAcc').textContent = (res.classAvgAccuracy || 0) + '%';
    container.querySelector('#instClassAvgScore').textContent = res.classAvgScore || '0.00';

    instRosterMeta = res.pagination || { total: (res.students || []).length, page: instRosterPage, limit: instRosterLimit, totalPages: 1 };

    const tbody = container.querySelector('#instRosterTbody');
    const students = res.students || [];

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No student attempt records found in your institute yet.</td></tr>';
      renderRosterPagination(container);
      return;
    }

    tbody.innerHTML = students.map(s => `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${s.full_name}</td>
        <td>${s.email}</td>
        <td style="font-weight: 700;">${s.exams_completed || 0}</td>
        <td>
          <span style="font-weight: 700; color: ${s.avg_accuracy >= 70 ? 'var(--success)' : 'var(--text-main)'};">
            ${s.avg_accuracy ? Math.round(s.avg_accuracy) + '%' : '-'}
          </span>
        </td>
        <td style="font-weight: 700; color: var(--primary);">${s.max_score ? parseFloat(s.max_score).toFixed(2) : '-'}</td>
        <td><span style="font-weight: 700; color: #f59e0b;">${s.max_percentile ? Math.round(s.max_percentile) + '%' : '-'}</span></td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${s.last_active ? new Date(s.last_active).toLocaleString() : 'Never'}</td>
      </tr>
    `).join('');

    renderRosterPagination(container);
  } catch (err) {
    console.error('Institute Analytics Error:', err);
  } finally {
    hideLoadingOverlay();
  }
}

function renderRosterPagination(container) {
  const pageBox = container.querySelector('#rosterPaginationContainer');
  if (!pageBox) return;

  const { total, page, limit, totalPages } = instRosterMeta;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  pageBox.innerHTML = `
    <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:12px 18px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <div style="font-size:0.88rem; color:var(--text-muted); font-weight:600;">
        Showing <strong style="color:var(--text-main);">${startItem}–${endItem}</strong> of <strong style="color:var(--primary);">${total.toLocaleString()}</strong> roster students
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
        </select>
      </div>
    </div>
  `;

  pageBox.querySelector('.btn-page-first')?.addEventListener('click', () => {
    if (instRosterPage > 1) { instRosterPage = 1; loadRosterData(container); }
  });
  pageBox.querySelector('.btn-page-prev')?.addEventListener('click', () => {
    if (instRosterPage > 1) { instRosterPage--; loadRosterData(container); }
  });
  pageBox.querySelector('.btn-page-next')?.addEventListener('click', () => {
    if (instRosterPage < totalPages) { instRosterPage++; loadRosterData(container); }
  });
  pageBox.querySelector('.btn-page-last')?.addEventListener('click', () => {
    if (instRosterPage < totalPages) { instRosterPage = totalPages; loadRosterData(container); }
  });
  pageBox.querySelector('.select-page-limit')?.addEventListener('change', (e) => {
    instRosterLimit = parseInt(e.target.value, 10) || 20;
    instRosterPage = 1;
    loadRosterData(container);
  });
}

// =========================================================================
// 3. PLATFORM SUPER ADMIN ANALYTICS VIEW (FOR SUPER ADMIN ROLE)
// =========================================================================
async function renderSuperAdminPlatformAnalytics(container, navigate) {
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">👑 Platform-Wide Super Admin Analytics</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Comprehensive platform metrics across all registered coaching tenants, users, and exam activity.
      </p>
    </div>

    <!-- Platform Totals Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Users</span>
        <div id="pfTotalUsers" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Students</span>
        <div id="pfTotalStudents" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Coaching Institutes</span>
        <div id="pfTotalInsts" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total CBT Attempts</span>
        <div id="pfTotalAttempts" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-</div>
      </div>
    </div>

    <!-- Multi-Tenant Institute Comparative Matrix -->
    <div class="card" style="padding: 24px;">
      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 16px;">🏫 Multi-Tenant Institute Comparative Matrix</h3>
      <div style="overflow-x: auto;">
        <table class="custom-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Institute Name</th>
              <th>Code</th>
              <th>Enrolled Students</th>
              <th>Total Exams</th>
              <th>Total CBT Attempts</th>
              <th>Avg Student Accuracy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="pfInstMatrixTbody">
            <tr><td colspan="7" style="text-align: center; padding: 24px;">Loading platform comparative matrix...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  try {
    const res = await apiRequest('/analytics/platform-analytics');
    const t = res.totals || {};

    container.querySelector('#pfTotalUsers').textContent = t.total_users || 0;
    container.querySelector('#pfTotalStudents').textContent = t.total_students || 0;
    container.querySelector('#pfTotalInsts').textContent = t.total_institutes || 0;
    container.querySelector('#pfTotalAttempts').textContent = t.total_exam_attempts || 0;

    const tbody = container.querySelector('#pfInstMatrixTbody');
    const institutes = res.institutes || [];

    if (institutes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No institutes registered yet.</td></tr>';
      return;
    }

    tbody.innerHTML = institutes.map(i => `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${i.name}</td>
        <td><span class="code-pill">${i.code}</span></td>
        <td style="font-weight: 700;">${i.student_count || 0}</td>
        <td>${i.exam_count || 0}</td>
        <td style="font-weight: 700; color: var(--primary);">${i.attempt_count || 0}</td>
        <td>
          <span style="font-weight: 700; color: ${i.avg_student_accuracy >= 70 ? 'var(--success)' : 'var(--text-main)'};">
            ${i.avg_student_accuracy ? Math.round(i.avg_student_accuracy) + '%' : '-'}
          </span>
        </td>
        <td>
          <span class="status-badge ${i.status === 'active' ? 'status-active' : 'status-inactive'}">
            ${i.status}
          </span>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Platform Analytics Error:', err);
  }
}
