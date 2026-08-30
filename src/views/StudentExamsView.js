import { apiRequest } from '../services/api.js';
import { showLoadingOverlay, hideLoadingOverlay } from '../components/LoadingOverlayModal.js';

export function renderStudentExamsView(navigate) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <!-- Top Header Banner -->
    <div style="background: linear-gradient(135deg, var(--primary) 0%, #1e1b4b 100%); border-radius: var(--radius-lg); padding: 28px 32px; color: #ffffff; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: var(--shadow-md);">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">
          💻 Online CBT Mock Examination Center
        </h1>
        <p style="opacity: 0.9; font-size: 0.98rem;">
          Take timed, multi-section proctored mock tests with real-time scorecards and rank analysis.
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <span class="status-badge status-active" style="padding: 8px 16px; font-weight: 700;">
          ⚡ Exam Engine Active
        </span>
      </div>
    </div>

    <!-- Exam Section Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px; flex-wrap: wrap;">
      <button id="tab-student-live" class="btn-text active" style="font-weight: 700; padding: 10px 18px; border-bottom: 3px solid var(--primary);">
        🔴 Live & Scheduled Exams
      </button>
      <button id="tab-student-attended" class="btn-text" style="font-weight: 700; padding: 10px 18px; color: var(--text-muted);">
        ✅ Completed & Attended Exams
      </button>
      <button id="tab-student-expired" class="btn-text" style="font-weight: 700; padding: 10px 18px; color: var(--text-muted);">
        ⏳ Expired Exams
      </button>
    </div>

    <!-- Main Content Container -->
    <div id="student-exams-content">
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Loading CBT exams...
      </div>
    </div>

    <!-- Scroll Loading Indicator -->
    <div id="infinite-scroll-loader" style="display: none; text-align: center; padding: 20px; font-weight: 700; color: var(--primary);">
      ⏳ Loading more exam series...
    </div>
  `;

  setTimeout(() => {
    setupStudentExams(container, navigate);
  }, 0);

  return container;
}

async function setupStudentExams(container, navigate) {
  const tabLive = container.querySelector('#tab-student-live');
  const tabAttended = container.querySelector('#tab-student-attended');
  const tabExpired = container.querySelector('#tab-student-expired');
  const content = container.querySelector('#student-exams-content');
  const scrollLoader = container.querySelector('#infinite-scroll-loader');

  let activeTab = 'live';
  let currentPage = 1;
  let currentLimit = 12;
  let paginationMeta = { hasNextPage: false };
  let isLoadingMore = false;

  let allExams = [];
  let myAttempts = [];

  function setActiveTab(tab) {
    activeTab = tab;
    [tabLive, tabAttended, tabExpired].forEach(t => t.classList.remove('active'));
    tabLive.style.borderBottom = 'none';
    tabAttended.style.borderBottom = 'none';
    tabExpired.style.borderBottom = 'none';

    if (tab === 'live') {
      tabLive.classList.add('active');
      tabLive.style.borderBottom = '3px solid var(--primary)';
    } else if (tab === 'attended') {
      tabAttended.classList.add('active');
      tabAttended.style.borderBottom = '3px solid var(--success)';
    } else if (tab === 'expired') {
      tabExpired.classList.add('active');
      tabExpired.style.borderBottom = '3px solid var(--danger)';
    }

    renderContent();
  }

  tabLive.addEventListener('click', () => setActiveTab('live'));
  tabAttended.addEventListener('click', () => setActiveTab('attended'));
  tabExpired.addEventListener('click', () => setActiveTab('expired'));

  async function loadData() {
    showLoadingOverlay('Loading Online Examination Center...', 'Fetching exam series & test attempts...');

    try {
      const [examsRes, attemptsRes] = await Promise.all([
        apiRequest(`/exams?page=${currentPage}&limit=${currentLimit}`).catch(() => ({ exams: [] })),
        apiRequest('/exams/my-attempts/history').catch(() => ({ attempts: [] }))
      ]);

      allExams = examsRes.exams || [];
      paginationMeta = examsRes.pagination || { hasNextPage: false };
      myAttempts = attemptsRes.attempts || [];

      renderContent();
    } catch (err) {
      content.innerHTML = `<div style="color:var(--danger); padding:20px;">Error loading exams: ${err.message}</div>`;
    } finally {
      hideLoadingOverlay();
    }
  }

  async function loadMoreExams() {
    if (isLoadingMore || !paginationMeta.hasNextPage) return;
    isLoadingMore = true;

    if (scrollLoader) scrollLoader.style.display = 'block';

    try {
      const examsRes = await apiRequest(`/exams?page=${currentPage + 1}&limit=${currentLimit}`).catch(() => ({ exams: [] }));
      const newExams = examsRes.exams || [];

      if (newExams.length > 0) {
        currentPage++;
        allExams.push(...newExams);
        paginationMeta = examsRes.pagination || { hasNextPage: false };
        renderContent();
      } else {
        paginationMeta.hasNextPage = false;
      }
    } catch (err) {
      console.error('Error lazy loading more exams:', err);
    } finally {
      isLoadingMore = false;
      if (scrollLoader) scrollLoader.style.display = 'none';
    }
  }

  // Infinite Scroll Listener
  window.addEventListener('scroll', () => {
    if (isLoadingMore || !paginationMeta.hasNextPage || activeTab !== 'live') return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
      loadMoreExams();
    }
  });

  function renderContent() {
    const now = new Date();

    if (activeTab === 'live') {
      const liveExams = allExams.filter(e => {
        if (!e.is_published) return false;
        if (e.scheduled_end && new Date(e.scheduled_end) < now) return false;
        return true;
      });

      if (liveExams.length === 0) {
        content.innerHTML = `
          <div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">
            <i class="ri-computer-line" style="font-size: 2.5rem; color: var(--primary); display: block; margin-bottom: 12px;"></i>
            <h3>No Live or Scheduled Exams Currently Available</h3>
            <p style="font-size: 0.9rem; margin-top: 6px;">Check back later or contact your Coaching Institute admin.</p>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="grid">
          ${liveExams.map(e => `
            <div class="card" style="border: 2px solid var(--primary-border); padding: 20px; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <span class="badge-tag" style="background: var(--primary-light); color: var(--primary); font-weight: 700;">${e.exam_type}</span>
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: capitalize;">${e.mode} Mode</span>
              </div>
              <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">${e.title}</h3>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 14px; flex: 1; line-height: 1.4;">
                ${e.description || 'Official Online CBT Mock Examination.'}
              </p>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px; background: var(--bg-color); padding: 10px 12px; border-radius: 8px; display: flex; justify-content: space-between;">
                <span>⏱ ${e.total_duration_mins} Mins</span>
                <span>Marks: +${parseFloat(e.positive_marks).toFixed(1)} / -${parseFloat(e.negative_marks).toFixed(1)}</span>
              </div>
              <button class="btn btn-primary btn-enter-lobby" data-id="${e.id}" style="width: 100%; font-weight: 700; font-size: 0.95rem;">
                Enter Exam Lobby →
              </button>
            </div>
          `).join('')}
        </div>
      `;

      content.querySelectorAll('.btn-enter-lobby').forEach(btn => {
        btn.addEventListener('click', () => {
          navigate('exam-lobby', { examId: btn.dataset.id });
        });
      });

    } else if (activeTab === 'attended') {
      if (myAttempts.length === 0) {
        content.innerHTML = `
          <div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">
            <i class="ri-task-line" style="font-size: 2.5rem; color: var(--success); display: block; margin-bottom: 12px;"></i>
            <h3>No Completed Exams Found</h3>
            <p style="font-size: 0.9rem; margin-top: 6px;">You haven't completed any exam submissions yet.</p>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${myAttempts.map(a => `
            <div class="card" style="padding: 20px 24px; display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; text-align: left !important; border-left: 4px solid var(--success); background: var(--card-bg); flex-wrap: wrap; gap: 16px;">
              <div style="display: flex; gap: 16px; align-items: center;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34, 197, 94, 0.12); color: var(--success); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                  <i class="ri-checkbox-circle-fill"></i>
                </div>
                <div style="text-align: left;">
                  <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 4px; color: var(--text-main);">${a.exam_title || 'CBT Mock Test'}</h4>
                  <div style="display: flex; gap: 10px; align-items: center; font-size: 0.84rem; color: var(--text-muted); flex-wrap: wrap;">
                    <span>📅 Submitted: ${new Date(a.submitted_at || a.created_at).toLocaleString()}</span>
                    <span class="badge-tag" style="background: rgba(34, 197, 94, 0.12); color: var(--success); font-weight: 700;">Completed</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 20px; align-items: center; margin-left: auto;">
                <div style="text-align: right;">
                  <div style="font-size: 1.2rem; font-weight: 800; color: var(--success);">${parseFloat(a.total_score || 0).toFixed(1)} Marks</div>
                  <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">${parseFloat(a.accuracy_pct || 0).toFixed(1)}% Accuracy</div>
                </div>
                <button class="btn btn-primary btn-sm btn-view-report" data-id="${a.id}" style="font-weight: 700; padding: 10px 18px; display: inline-flex; align-items: center; gap: 6px;">
                  View Scorecard <i class="ri-bar-chart-fill"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      content.querySelectorAll('.btn-view-report').forEach(btn => {
        btn.addEventListener('click', () => {
          navigate('exam-analysis', { attemptId: btn.dataset.id });
        });
      });

    } else if (activeTab === 'expired') {
      const expiredExams = allExams.filter(e => e.scheduled_end && new Date(e.scheduled_end) < now);

      if (expiredExams.length === 0) {
        content.innerHTML = `
          <div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">
            <i class="ri-time-line" style="font-size: 2.5rem; color: var(--danger); display: block; margin-bottom: 12px;"></i>
            <h3>No Expired Exams</h3>
            <p style="font-size: 0.9rem; margin-top: 6px;">All available exam series are currently active.</p>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="grid">
          ${expiredExams.map(e => `
            <div class="card" style="padding: 20px; opacity: 0.8;">
              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">${e.title}</h3>
              <p style="font-size: 0.85rem; color: var(--danger); font-weight: 700;">Expired on: ${new Date(e.scheduled_end).toLocaleString()}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  loadData();
}
