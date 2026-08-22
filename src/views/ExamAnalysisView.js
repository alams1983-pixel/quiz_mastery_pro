import { apiRequest } from '../services/api.js';
import { renderRichContent } from '../services/richContent.js';
import { renderLeaderboardModal } from '../components/LeaderboardModal.js';

export function renderExamAnalysisView(attemptId, navigate) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';
  container.style.maxWidth = '1000px';
  container.style.margin = '0 auto';

  container.innerHTML = `
    <!-- Header Navigation -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <button id="btn-back-dash" class="btn btn-outline btn-sm">
        ← Back to Dashboard
      </button>
      <button id="btn-open-leaderboard" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
        🏆 View Exam Leaderboard
      </button>
    </div>

    <!-- Scorecard Summary Header -->
    <div class="card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, var(--card-bg) 0%, var(--primary-light) 100%); border: 2px solid var(--primary-border);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
        <div>
          <span id="analysis-exam-type" class="badge-tag" style="margin-bottom: 6px; display: inline-block;">SSC Exam</span>
          <h1 id="analysis-exam-title" style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">Loading Exam Results...</h1>
          <p id="analysis-cand-name" style="font-size: 0.9rem; color: var(--text-muted);">-</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Overall Rank</span>
          <div id="analysis-rank-badge" style="font-size: 2rem; font-weight: 900; color: var(--primary); font-family: monospace;"># -</div>
        </div>
      </div>

      <!-- Stats Metric Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 14px; text-align: center;">
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">TOTAL SCORE</span>
          <div id="stat-score" style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">-</div>
        </div>
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">ACCURACY</span>
          <div id="stat-accuracy" style="font-size: 1.4rem; font-weight: 800; color: var(--success);">-</div>
        </div>
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">PERCENTILE</span>
          <div id="stat-percentile" style="font-size: 1.4rem; font-weight: 800; color: var(--accent);">-</div>
        </div>
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">CORRECT / WRONG</span>
          <div id="stat-counts" style="font-size: 1.1rem; font-weight: 800; margin-top: 4px;">-</div>
        </div>
      </div>
    </div>

    <!-- Question Filter Tabs -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;" id="analysis-filter-bar">
      <button class="btn btn-outline btn-sm active" data-filter="all">All Questions (<span id="cnt-all">0</span>)</button>
      <button class="btn btn-outline btn-sm" data-filter="correct" style="color: var(--success);">Correct (<span id="cnt-correct">0</span>)</button>
      <button class="btn btn-outline btn-sm" data-filter="wrong" style="color: var(--danger);">Wrong (<span id="cnt-wrong">0</span>)</button>
      <button class="btn btn-outline btn-sm" data-filter="unattempted">Unattempted (<span id="cnt-unatt">0</span>)</button>
    </div>

    <!-- Item-Level Question List -->
    <div id="item-analysis-list" style="display: flex; flex-direction: column; gap: 20px;">
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading item analytics...</div>
    </div>
  `;

  let currentAnalysisData = null;
  let activeFilter = 'all';

  async function loadAnalysis() {
    try {
      const data = await apiRequest(`/exams/attempts/${attemptId}/analysis`);
      currentAnalysisData = data;
      renderHeaderAndStats(container, data);
      renderQuestionList(container, data.itemAnalysis, activeFilter);
    } catch (err) {
      console.error('Error loading analysis:', err);
      container.querySelector('#item-analysis-list').innerHTML = `<div style="color: var(--danger); text-align: center;">Failed to load analysis: ${err.message}</div>`;
    }
  }

  function renderHeaderAndStats(container, data) {
    const { attempt, rank, percentile, totalCandidates, itemAnalysis } = data;

    container.querySelector('#analysis-exam-title').textContent = attempt.exam_title;
    container.querySelector('#analysis-exam-type').textContent = attempt.exam_type;
    container.querySelector('#analysis-cand-name').textContent = `Candidate: ${attempt.candidate_name} • ${attempt.institute_name || 'Independent'}`;

    container.querySelector('#analysis-rank-badge').textContent = `#${rank} / ${totalCandidates}`;
    container.querySelector('#stat-score').textContent = parseFloat(attempt.total_score).toFixed(2);
    container.querySelector('#stat-accuracy').textContent = `${Math.round(attempt.accuracy_pct)}%`;
    container.querySelector('#stat-percentile').textContent = `${percentile} %ile`;
    container.querySelector('#stat-counts').innerHTML = `<span style="color:var(--success);">${attempt.correct_count}</span> / <span style="color:var(--danger);">${attempt.wrong_count}</span>`;

    // Counts for filter bar
    let correct = 0, wrong = 0, unattempted = 0;
    itemAnalysis.forEach(item => {
      if (item.is_correct === 1 || item.is_correct === true) correct++;
      else if (item.is_correct === 0 || item.is_correct === false) wrong++;
      else unattempted++;
    });

    container.querySelector('#cnt-all').textContent = itemAnalysis.length;
    container.querySelector('#cnt-correct').textContent = correct;
    container.querySelector('#cnt-wrong').textContent = wrong;
    container.querySelector('#cnt-unatt').textContent = unattempted;
  }

  function renderQuestionList(container, items, filter) {
    const listContainer = container.querySelector('#item-analysis-list');
    listContainer.innerHTML = '';

    const filtered = items.filter(item => {
      if (filter === 'correct') return item.is_correct === 1 || item.is_correct === true;
      if (filter === 'wrong') return item.is_correct === 0 || item.is_correct === false;
      if (filter === 'unattempted') return item.is_correct === null;
      return true;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No questions match this filter.</div>`;
      return;
    }

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.padding = '20px';

      const isCorrect = item.is_correct === 1 || item.is_correct === true;
      const isWrong = item.is_correct === 0 || item.is_correct === false;

      let statusBadge = '<span class="status-badge" style="background:#e2e8f0; color:#475569;">Unattempted</span>';
      if (isCorrect) statusBadge = '<span class="status-badge status-active">✓ Correct (+2.00)</span>';
      else if (isWrong) statusBadge = '<span class="status-badge status-inactive">✕ Wrong (-0.50)</span>';

      const optLabels = ['(A)', '(B)', '(C)', '(D)', '(E)'];
      const opts = item.options_en || [];

      // Option Distribution Bars %
      const optionBarsHTML = opts.map((optText, optIdx) => {
        const isCorrectOpt = optIdx === item.correct_option_index;
        const isSelectedOpt = optIdx === item.selected_option;
        const statsPct = (item.option_stats_pct && item.option_stats_pct[optIdx]) !== undefined ? item.option_stats_pct[optIdx] : 0;

        let optClass = '';
        if (isCorrectOpt) optClass = 'background: #e8f5e9; border: 1.5px solid #2ecc71;';
        else if (isSelectedOpt && !isCorrectOpt) optClass = 'background: #ffebee; border: 1.5px solid #e74c3c;';

        return `
          <div style="padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 8px; ${optClass}">
            <div style="display: flex; justify-content: space-between; font-size: 0.92rem; margin-bottom: 4px;">
              <span>
                <strong>${optLabels[optIdx]}</strong> ${renderRichContent(optText)}
                ${isCorrectOpt ? ' <strong style="color: #27ae60;">(Correct Answer)</strong>' : ''}
                ${isSelectedOpt && !isCorrectOpt ? ' <strong style="color: #c0392b;">(Your Answer)</strong>' : ''}
              </span>
              <span style="font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">${statsPct}% students</span>
            </div>
            <!-- Percentage Bar -->
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="width: ${statsPct}%; height: 100%; background: ${isCorrectOpt ? '#2ecc71' : 'var(--primary)'}; transition: width 0.4s ease;"></div>
            </div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">Section: ${item.section_name}</span>
            <h3 style="font-size: 1.05rem; font-weight: 800; margin-top: 2px;">Question #${index + 1}</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.78rem; font-weight: 700; background: var(--bg-color); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 6px;">
              ⏱️ You: ${item.time_spent_sec}s | Avg: ${item.avg_time_sec}s
            </span>
            ${statusBadge}
          </div>
        </div>

        ${item.passage_text_en ? `
          <div class="ssc-passage-box" style="margin-bottom: 14px;">
            <strong>Passage:</strong><br>${renderRichContent(item.passage_text_en)}
          </div>
        ` : ''}

        <div style="font-size: 1rem; font-weight: 600; margin-bottom: 14px; line-height: 1.5;">
          ${renderRichContent(item.question_text_en)}
        </div>

        <div style="margin-bottom: 16px;">
          ${optionBarsHTML}
        </div>

        ${item.explanation_en ? `
          <div style="background: var(--bg-color); border-left: 4px solid var(--primary); padding: 12px 14px; border-radius: 4px; font-size: 0.88rem;">
            <strong>💡 Explanation:</strong><br>${renderRichContent(item.explanation_en)}
          </div>
        ` : ''}
      `;

      listContainer.appendChild(card);
    });
  }

  // Event Listeners
  container.querySelector('#btn-back-dash').addEventListener('click', () => navigate('dashboard'));
  container.querySelector('#btn-open-leaderboard').addEventListener('click', () => {
    if (currentAnalysisData && currentAnalysisData.attempt) {
      renderLeaderboardModal(currentAnalysisData.attempt.exam_id);
    }
  });

  const filterBar = container.querySelector('#analysis-filter-bar');
  filterBar.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      if (currentAnalysisData) {
        renderQuestionList(container, currentAnalysisData.itemAnalysis, activeFilter);
      }
    });
  });

  loadAnalysis();

  return container;
}
