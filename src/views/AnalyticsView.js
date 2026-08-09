import { api, getUser } from '../services/api.js';
import { generateQuizPDFReport } from '../services/pdfGenerator.js';

export function renderAnalyticsView(navigate) {
  const container = document.createElement('div');
  container.className = 'view-container';

  container.innerHTML = `
    <h1 style="font-size:1.8rem; font-weight:700; margin-bottom:6px;">📊 Personal Learning Analytics</h1>
    <p style="color:var(--text-muted); font-size:1rem; margin-bottom:24px;">
      Track your mastery progression, quiz attempt history, and export official PDF activity reports.
    </p>

    <!-- Stats Summary Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:32px;">
      <div class="card">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Total Quizzes Completed</span>
        <div id="anaTotalAttempts" style="font-size:2rem; font-weight:700; color:var(--primary); margin-top:4px;">0</div>
      </div>
      <div class="card">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Average Accuracy</span>
        <div id="anaAvgAccuracy" style="font-size:2rem; font-weight:700; color:var(--success); margin-top:4px;">0%</div>
      </div>
      <div class="card">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Total Practice Time</span>
        <div id="anaTotalTime" style="font-size:2rem; font-weight:700; color:var(--text-main); margin-top:4px;">0m</div>
      </div>
      <div class="card">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Correct vs Wrong</span>
        <div style="font-size:1.4rem; font-weight:700; margin-top:4px;">
          <span id="anaCorrect" style="color:var(--success);">0</span> / <span id="anaWrong" style="color:var(--danger);">0</span>
        </div>
      </div>
    </div>

    <!-- Attempt History Table -->
    <div style="background:var(--card-bg); border:1px solid var(--glass-border); border-radius:var(--radius-md); padding:24px;">
      <h2 style="font-size:1.3rem; font-weight:700; margin-bottom:16px;">📜 Quiz Attempt History</h2>
      
      <div class="table-wrap">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Quiz Title</th>
              <th>Category</th>
              <th>Accuracy</th>
              <th>Score</th>
              <th>Time Spent</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="historyTableBody">
            <tr><td colspan="7" style="text-align:center; padding:20px;">Loading history...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#historyTableBody');

  async function loadAnalytics() {
    try {
      const statsRes = await api.getStats();
      container.querySelector('#anaTotalAttempts').textContent = statsRes.totalAttempts;
      container.querySelector('#anaAvgAccuracy').textContent = statsRes.avgAccuracy + '%';
      container.querySelector('#anaTotalTime').textContent = Math.round(statsRes.totalTimeSec / 60) + 'm';
      container.querySelector('#anaCorrect').textContent = statsRes.totalCorrectAnswers;
      container.querySelector('#anaWrong').textContent = statsRes.totalWrongAnswers;

      const histRes = await api.getHistory();
      const attempts = histRes.attempts || [];

      if (attempts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No quiz attempt history found yet.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      attempts.forEach(att => {
        const tr = document.createElement('tr');
        const dateStr = new Date(att.created_at).toLocaleString();
        const durationStr = `${Math.floor(att.time_taken_sec / 60)}m ${att.time_taken_sec % 60}s`;

        tr.innerHTML = `
          <td>${dateStr}</td>
          <td style="font-weight:700;">${att.quiz_title}</td>
          <td>${att.category_name || 'General'}</td>
          <td><span style="color:var(--success); font-weight:bold;">${att.accuracy_pct}%</span></td>
          <td>${att.score} / ${att.total_questions}</td>
          <td>${durationStr}</td>
          <td>
            <button class="btn btn-sm download-history-pdf" style="background:#059669;">
              📄 PDF Report
            </button>
          </td>
        `;

        tr.querySelector('.download-history-pdf').addEventListener('click', async () => {
          const user = getUser() || { full_name: 'Student', email: 'user@example.com', role: 'user' };
          const qstRes = await api.getQuestions(att.quiz_id).catch(() => ({ questions: [] }));
          await generateQuizPDFReport({
            user,
            quiz: { title: att.quiz_title, category_name: att.category_name },
            attempt: att,
            questions: qstRes.questions
          });
        });

        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }

  loadAnalytics();

  return container;
}
