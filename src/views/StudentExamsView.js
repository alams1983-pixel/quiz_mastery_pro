import { apiRequest } from '../services/api.js';

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
          ⚡ TCS iON Engine Active
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
  `;

  // Attach state & handlers
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

  let activeTab = 'live';
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
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        apiRequest('/exams').catch(() => ({ exams: [] })),
        apiRequest('/exams/my-attempts/history').catch(() => ({ attempts: [] }))
      ]);

      allExams = examsRes.exams || [];
      myAttempts = attemptsRes.attempts || [];

      renderContent();
    } catch (err) {
      content.innerHTML = `<div style="color:var(--danger); padding:20px;">Error loading exams: ${err.message}</div>`;
    }
  }

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
            <p style="font-size: 0.9rem; margin-top: 6px;">Exams you complete will appear here with detailed scorecard analysis.</p>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="table-wrap">
          <table class="custom-table mobile-card-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Attempt Date</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Status</th>
                <th>Scorecard</th>
              </tr>
            </thead>
            <tbody>
              ${myAttempts.map(att => `
                <tr>
                  <td data-label="Exam Title" style="font-weight: 700;">${att.exam_title || 'CBT Mock Test'}</td>
                  <td data-label="Attempt Date" style="font-size: 0.85rem; color: var(--text-muted);">${new Date(att.start_time).toLocaleString()}</td>
                  <td data-label="Score" style="font-weight: 800; color: var(--primary);">${att.total_score} Marks</td>
                  <td data-label="Accuracy" style="font-weight: 700;">${att.accuracy_pct}%</td>
                  <td data-label="Status"><span class="status-badge status-active">${att.status}</span></td>
                  <td data-label="Scorecard">
                    <button class="btn btn-sm btn-outline btn-view-analysis" data-id="${att.id}" style="font-weight: 700;" title="Scorecard Analysis" aria-label="Scorecard Analysis">
                      <i class="ri-bar-chart-2-line"></i> <span class="btn-text-desktop">Scorecard Analysis</span>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      content.querySelectorAll('.btn-view-analysis').forEach(btn => {
        btn.addEventListener('click', () => {
          navigate('exam-analysis', { attemptId: btn.dataset.id });
        });
      });

    } else if (activeTab === 'expired') {
      const expiredExams = allExams.filter(e => {
        if (!e.is_published) return false;
        if (e.scheduled_end && new Date(e.scheduled_end) < now) return true;
        return false;
      });

      if (expiredExams.length === 0) {
        content.innerHTML = `
          <div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">
            <i class="ri-time-line" style="font-size: 2.5rem; color: var(--text-muted); display: block; margin-bottom: 12px;"></i>
            <h3>No Expired Exams</h3>
            <p style="font-size: 0.9rem; margin-top: 6px;">Past scheduled exams that have ended will be archived here.</p>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="grid">
          ${expiredExams.map(e => `
            <div class="card" style="padding: 20px; opacity: 0.85;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <span class="badge-tag">${e.exam_type}</span>
                <span class="badge-tag" style="background: var(--danger-bg); color: var(--danger); font-weight: 700;">Expired</span>
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">${e.title}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px; flex: 1;">${e.description || 'Past Online CBT Test.'}</p>
              <div style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-color); padding: 8px 12px; border-radius: 6px;">
                Ended: ${e.scheduled_end ? new Date(e.scheduled_end).toLocaleString() : 'Past Exam'}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  loadData();
}
