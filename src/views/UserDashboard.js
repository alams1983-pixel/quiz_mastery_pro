import { apiRequest } from '../services/api.js';

export function renderUserDashboard(navigate, startQuizSession) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <!-- Hero Home Banner -->
    <div style="background: linear-gradient(135deg, var(--primary) 0%, #1e1b4b 100%); border-radius: var(--radius-lg); padding: 32px 36px; color: #ffffff; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; box-shadow: var(--shadow-md);">
      <div>
        <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.02em;">
          Welcome to EdutorAi<sub class="brand-subscript">Pro</sub> Student Portal
        </h1>
        <p style="opacity: 0.9; font-size: 1.05rem; max-width: 600px; line-height: 1.5;">
          Access your live proctored CBT exams, take self-paced practice quizzes, or build custom self-assessment tests.
        </p>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn" id="btn-go-exams" style="background: #ffffff; color: var(--primary); font-weight: 800; padding: 12px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
          💻 Go to My Exams
        </button>
        <button class="btn" id="btn-go-quizzes" style="background: rgba(255,255,255,0.18); color: #ffffff; border: 1px solid rgba(255,255,255,0.35); font-weight: 800; padding: 12px 20px;">
          📝 Go to Practice Quizzes
        </button>
      </div>
    </div>

    <!-- Live & Scheduled CBT Exams Section -->
    <div style="margin-bottom: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 10px;">
            <i class="ri-computer-line" style="color: var(--primary);"></i> Scheduled Online CBT Live Exams
          </h2>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 2px;">
            Live multi-section proctored mock examinations for your enrolled batch.
          </p>
        </div>
        <button id="btn-view-all-exams" class="btn-text" style="font-weight: 700; color: var(--primary);">
          View All Exams →
        </button>
      </div>
      
      <div id="ssc-exams-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--card-bg); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          Loading live CBT exams...
        </div>
      </div>
    </div>

    <!-- Student Instructions & Guidelines -->
    <div class="card" style="padding: 24px; border-left: 4px solid var(--accent);">
      <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 12px; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
        <i class="ri-information-line" style="color: var(--accent);"></i> Student Exam & Practice Guidelines
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; font-size: 0.9rem; color: var(--text-muted);">
        <div style="background: var(--bg-color); padding: 14px; border-radius: 8px;">
          <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">💻 Proctored CBT Engine</strong>
          Full-screen TCS iON exam engine with positive & negative marking, timer countdowns, and section navigation.
        </div>
        <div style="background: var(--bg-color); padding: 14px; border-radius: 8px;">
          <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">📝 Practice Quizzes</strong>
          Self-paced practice sessions with immediate KaTeX solution explanations and question booklet PDF downloads.
        </div>
        <div style="background: var(--bg-color); padding: 14px; border-radius: 8px;">
          <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">🏛️ Batch Target Access</strong>
          Enrolled students automatically receive mock exams assigned to their class or batch.
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  setTimeout(() => {
    setupUserDashboard(container, navigate);
  }, 0);

  return container;
}

async function setupUserDashboard(container, navigate) {
  const sscGrid = container.querySelector('#ssc-exams-grid');
  const btnGoExams = container.querySelector('#btn-go-exams');
  const btnGoQuizzes = container.querySelector('#btn-go-quizzes');
  const btnViewAllExams = container.querySelector('#btn-view-all-exams');

  btnGoExams.addEventListener('click', () => navigate('student-exams'));
  btnGoQuizzes.addEventListener('click', () => navigate('student-quizzes'));
  btnViewAllExams.addEventListener('click', () => navigate('student-exams'));

  async function loadSSCExams() {
    try {
      const res = await apiRequest('/exams');
      const exams = res.exams || [];
      const liveExams = exams.filter(e => e.is_published);

      if (liveExams.length === 0) {
        sscGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 36px; color: var(--text-muted); background: var(--card-bg); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            No live scheduled CBT exams currently active. Explore practice quizzes!
          </div>
        `;
        return;
      }

      sscGrid.innerHTML = liveExams.slice(0, 3).map(e => `
        <div class="card" style="border: 2px solid var(--primary-border); padding: 20px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="badge-tag">${e.exam_type}</span>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary); text-transform: capitalize;">${e.mode} Mode</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">${e.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px; flex: 1;">
            ${e.description || 'Official Online CBT Mock Examination.'}
          </p>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px; background: var(--bg-color); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between;">
            <span>⏱ ${e.total_duration_mins} Mins</span>
            <span>Marks: +${parseFloat(e.positive_marks).toFixed(1)} / -${parseFloat(e.negative_marks).toFixed(1)}</span>
          </div>
          <button class="btn btn-primary btn-enter-lobby" data-id="${e.id}" style="width: 100%; font-weight: 700;">
            Enter Exam Lobby →
          </button>
        </div>
      `).join('');

      sscGrid.querySelectorAll('.btn-enter-lobby').forEach(btn => {
        btn.addEventListener('click', () => {
          navigate('exam-lobby', { examId: btn.dataset.id });
        });
      });
    } catch (e) {
      console.warn('Could not load SSC exams:', e);
    }
  }

  loadSSCExams();
}
