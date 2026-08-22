import { apiRequest } from '../services/api.js';

export async function renderLeaderboardModal(examId) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay fade-in';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.inset = '0';
  modalOverlay.style.background = 'rgba(0, 0, 0, 0.6)';
  modalOverlay.style.backdropFilter = 'blur(4px)';
  modalOverlay.style.zIndex = '10000';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.padding = '20px';

  const container = document.createElement('div');
  container.className = 'card';
  container.style.width = '100%';
  container.style.maxWidth = '700px';
  container.style.maxHeight = '90vh';
  container.style.overflowY = 'auto';
  container.style.padding = '28px';
  container.style.background = 'var(--card-bg)';
  container.style.borderRadius = '20px';
  container.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
          🏆 Exam Leaderboard & Rankings
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Real-time student leaderboard sorted by Score, Accuracy %, and Speed.</p>
      </div>
      <button id="close-leaderboard-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
    </div>

    <!-- Top 3 Podium Area -->
    <div id="leaderboard-podium" style="display: flex; justify-content: center; align-items: flex-end; gap: 14px; margin-bottom: 24px; padding: 14px 0;">
      <!-- Podium slots -->
    </div>

    <!-- Leaderboard Table -->
    <div style="overflow-x: auto;">
      <table class="custom-table" style="width: 100%;">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate Name</th>
            <th>Institute</th>
            <th>Total Score</th>
            <th>Accuracy %</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody id="leaderboard-table-body">
          <tr><td colspan="6" style="text-align: center; padding: 24px;">Loading leaderboard...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  container.querySelector('#close-leaderboard-btn').addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });

  modalOverlay.appendChild(container);
  document.body.appendChild(modalOverlay);

  try {
    const res = await apiRequest(`/exams/${examId}/leaderboard`);
    const leaderboard = res.leaderboard || [];

    const tbody = container.querySelector('#leaderboard-table-body');
    const podiumEl = container.querySelector('#leaderboard-podium');

    if (leaderboard.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No student attempts submitted yet for this exam.</td></tr>';
      return;
    }

    // Top 3 Podium Render
    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];

    podiumEl.innerHTML = `
      ${top2 ? `
        <div style="text-align: center;">
          <div style="font-size: 1.6rem;">🥈</div>
          <div style="background: #f1f5f9; border: 2px solid #cbd5e1; padding: 10px 16px; border-radius: 12px 12px 0 0; min-width: 110px;">
            <div style="font-weight: 800; font-size: 0.88rem;">${top2.full_name}</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">${top2.total_score} pts</div>
          </div>
        </div>
      ` : ''}

      ${top1 ? `
        <div style="text-align: center;">
          <div style="font-size: 2rem;">🥇</div>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 16px 20px; border-radius: 14px 14px 0 0; min-width: 130px; transform: scale(1.08);">
            <div style="font-weight: 800; font-size: 0.95rem; color: #78350f;">${top1.full_name}</div>
            <div style="font-weight: 900; color: #b45309; font-size: 1rem;">${top1.total_score} pts</div>
          </div>
        </div>
      ` : ''}

      ${top3 ? `
        <div style="text-align: center;">
          <div style="font-size: 1.6rem;">🥉</div>
          <div style="background: #ffedd5; border: 2px solid #fdba74; padding: 10px 16px; border-radius: 12px 12px 0 0; min-width: 110px;">
            <div style="font-weight: 800; font-size: 0.88rem;">${top3.full_name}</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">${top3.total_score} pts</div>
          </div>
        </div>
      ` : ''}
    `;

    // Table Render
    tbody.innerHTML = leaderboard.map(item => `
      <tr>
        <td style="font-weight: 900; color: ${item.rank <= 3 ? 'var(--primary)' : 'var(--text-main)'};">
          ${item.rank === 1 ? '🥇 #1' : (item.rank === 2 ? '🥈 #2' : (item.rank === 3 ? '🥉 #3' : `#${item.rank}`))}
        </td>
        <td style="font-weight: 700; color: var(--text-main);">${item.full_name}</td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${item.institute_name}</td>
        <td style="font-weight: 800; color: var(--primary);">${item.total_score}</td>
        <td style="font-weight: 700; color: ${item.accuracy_pct >= 70 ? 'var(--success)' : 'var(--text-main)'};">${item.accuracy_pct}%</td>
        <td style="font-size: 0.85rem;">${item.duration_mins} Mins</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Leaderboard error:', err);
  }
}
