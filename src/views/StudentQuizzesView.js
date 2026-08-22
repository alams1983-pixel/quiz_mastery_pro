import { api, apiRequest, getUser } from '../services/api.js';
import { downloadQuizBookletPDF, generateQuizPDFReport } from '../services/pdfGenerator.js';
import { createModal } from '../components/Modal.js';

export function renderStudentQuizzesView(navigate, startQuizSession) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  container.innerHTML = `
    <!-- Top Hero Banner -->
    <div style="background: linear-gradient(135deg, var(--accent) 0%, #312e81 100%); border-radius: var(--radius-lg); padding: 28px 32px; color: #ffffff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: var(--shadow-md);">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.02em;">
          📝 Student Practice Quiz Hub
        </h1>
        <p style="opacity: 0.9; font-size: 0.98rem;">
          Self-paced practice quizzes. Select any quiz to build active memory retention or view your attempt analytics.
        </p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn" id="btn-create-custom-quiz" style="background: #ffffff; color: var(--accent); font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
          ✨ Create Custom Quiz
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px;">
      <button id="tabCatalogue" class="btn-text active" style="font-weight: 700; padding: 10px 18px; border-bottom: 3px solid var(--accent); color: var(--text-main);">
        📚 Practice Quiz Catalogue
      </button>
      <button id="tabAnalytics" class="btn-text" style="font-weight: 700; padding: 10px 18px; color: var(--text-muted);">
        📊 Quiz Analytics & Practice Attempts
      </button>
    </div>

    <!-- Content Sections -->
    <div id="quizViewContent"></div>
  `;

  setTimeout(() => {
    setupStudentQuizzesView(container, navigate, startQuizSession);
  }, 0);

  return container;
}

async function setupStudentQuizzesView(container, navigate, startQuizSession) {
  const tabCatalogue = container.querySelector('#tabCatalogue');
  const tabAnalytics = container.querySelector('#tabAnalytics');
  const contentArea = container.querySelector('#quizViewContent');
  const btnCreateCustom = container.querySelector('#btn-create-custom-quiz');

  let activeTab = 'catalogue';
  let categories = [];
  let selectedCategoryId = null;
  let searchQuery = '';

  function switchTab(target) {
    activeTab = target;
    [tabCatalogue, tabAnalytics].forEach(t => {
      t.classList.remove('active');
      t.style.borderBottom = 'none';
      t.style.color = 'var(--text-muted)';
    });

    if (target === 'catalogue') {
      tabCatalogue.classList.add('active');
      tabCatalogue.style.borderBottom = '3px solid var(--accent)';
      tabCatalogue.style.color = 'var(--text-main)';
      renderCatalogueTab();
    } else {
      tabAnalytics.classList.add('active');
      tabAnalytics.style.borderBottom = '3px solid var(--accent)';
      tabAnalytics.style.color = 'var(--text-main)';
      renderAnalyticsTab();
    }
  }

  tabCatalogue.addEventListener('click', () => switchTab('catalogue'));
  tabAnalytics.addEventListener('click', () => switchTab('analytics'));

  // =========================================================================
  // TAB 1: PRACTICE QUIZ CATALOGUE (WITH HORIZONTAL CATEGORY FILTER PILLS)
  // =========================================================================
  async function renderCatalogueTab() {
    contentArea.innerHTML = `
      <!-- Horizontal Category Pill Toolbar + Search Bar -->
      <div style="margin-bottom: 20px;">
        <div id="catPillsContainer" class="cat-pill-bar" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; scrollbar-width: thin;">
          <button class="cat-pill-item active" data-id="">All Categories</button>
        </div>

        <div style="display: flex; gap: 16px; align-items: center;">
          <input type="text" id="quizSearchInput" class="form-input" placeholder="🔍 Search quizzes by title, topic, or keyword..." style="flex: 1;" value="${searchQuery}" />
        </div>
      </div>

      <!-- Quiz Grid -->
      <div id="quizGrid" class="grid">
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          Loading practice quizzes...
        </div>
      </div>
    `;

    const searchInput = contentArea.querySelector('#quizSearchInput');
    const pillsContainer = contentArea.querySelector('#catPillsContainer');

    // Attach search input handler
    if (searchInput) {
      let timer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          searchQuery = e.target.value.trim();
          fetchQuizzes();
        }, 300);
      });
    }

    // Load categories for pills
    try {
      const catRes = await api.getCategories().catch(() => ({ flatCategories: [] }));
      categories = catRes.flatCategories || [];

      pillsContainer.innerHTML = `
        <button class="cat-pill-item ${!selectedCategoryId ? 'active' : ''}" data-id="">
          🌐 All Categories
        </button>
        ${categories.map(c => `
          <button class="cat-pill-item ${selectedCategoryId == c.id ? 'active' : ''}" data-id="${c.id}">
            ${c.icon || '📂'} ${c.name}
          </button>
        `).join('')}
      `;

      pillsContainer.querySelectorAll('.cat-pill-item').forEach(btn => {
        btn.addEventListener('click', () => {
          pillsContainer.querySelectorAll('.cat-pill-item').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedCategoryId = btn.dataset.id || null;
          fetchQuizzes();
        });
      });
    } catch (err) {
      console.error('Error loading category pills:', err);
    }

    fetchQuizzes();
  }

  async function fetchQuizzes() {
    const quizGrid = contentArea.querySelector('#quizGrid');
    if (!quizGrid) return;

    try {
      quizGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Loading quizzes...</div>';
      const params = {};
      if (selectedCategoryId) params.category_id = selectedCategoryId;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getQuizzes(params);
      const quizzes = res.quizzes || [];

      if (quizzes.length === 0) {
        quizGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            No practice quizzes found matching your search criteria.
          </div>
        `;
        return;
      }

      quizGrid.innerHTML = '';
      quizzes.forEach(q => {
        const card = document.createElement('div');
        card.className = 'card';

        const tagBadges = q.tag_names
          ? q.tag_names.split(',').map(t => `<span class="badge-tag">🏷️ ${t.trim()}</span>`).join('')
          : '';

        const catIcon = q.category_icon || '📂';

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <span style="font-size:0.78rem; font-weight:700; color:var(--accent); background:var(--accent-light); border:1px solid var(--accent-border); padding:3px 10px; border-radius:var(--radius-pill);">
              ${catIcon} ${q.category_name || 'General'}
            </span>
            <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">
              ${q.question_count || 0} Questions
            </span>
          </div>

          <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:6px;">${q.title}</h3>
          <p style="font-size:0.88rem; color:var(--text-muted); flex:1; margin-bottom:12px; line-height:1.4;">
            ${q.description || 'No description provided.'}
          </p>

          <div style="margin-bottom:16px;">${tagBadges}</div>

          <div style="display:flex; gap:10px; margin-top:auto; align-items:center;">
            <button class="btn start-quiz-btn" style="flex:1; background:var(--accent); font-weight:700; border-radius:var(--radius-pill); white-space:nowrap; padding:10px 18px; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
              Start Session <i class="ri-arrow-right-line"></i>
            </button>
            <button class="btn btn-secondary download-pdf-btn" title="Download Question Booklet PDF" aria-label="Download Question Booklet PDF" style="padding:10px 16px; border-radius:var(--radius-pill); white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
              <i class="ri-file-download-line"></i> PDF
            </button>
          </div>
        `;

        card.querySelector('.start-quiz-btn').addEventListener('click', () => {
          startQuizSession(q.id);
        });

        card.querySelector('.download-pdf-btn').addEventListener('click', async () => {
          try {
            await downloadQuizBookletPDF(q.id, q.title);
          } catch (e) {
            alert('Error generating PDF.');
          }
        });

        quizGrid.appendChild(card);
      });
    } catch (err) {
      if (quizGrid) {
        quizGrid.innerHTML = `<div style="grid-column:1/-1; color:var(--danger); padding:20px;">Error fetching quizzes: ${err.message}</div>`;
      }
    }
  }

  // =========================================================================
  // TAB 2: QUIZ ANALYTICS & PRACTICE ATTEMPTS HISTORY
  // =========================================================================
  async function renderAnalyticsTab() {
    const user = getUser() || { full_name: 'Student User', email: 'student@example.com', role: 'user' };

    contentArea.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px;">📊 My Practice Quiz Analytics</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem;">Track your practice attempt logs, accuracy trends, and download official PDF scorecards.</p>
      </div>

      <!-- Practice Overview Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card" style="padding: 18px;">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Practice Attempts</span>
          <div id="pzTotalAttempts" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
        </div>
        <div class="card" style="padding: 18px;">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Average Accuracy</span>
          <div id="pzAvgAccuracy" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-%</div>
        </div>
        <div class="card" style="padding: 18px;">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Practice Time</span>
          <div id="pzTotalTime" style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">-m</div>
        </div>
      </div>

      <!-- Attempt History Table -->
      <div class="card" style="padding: 20px;">
        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 14px;">📜 Practice Session Log History</h4>
        <div class="table-wrap">
          <table class="custom-table mobile-card-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Quiz Title</th>
                <th>Category</th>
                <th>Accuracy</th>
                <th>Score</th>
                <th>Duration</th>
                <th>PDF Export</th>
              </tr>
            </thead>
            <tbody id="pzHistoryTbody">
              <tr><td colspan="7" style="text-align: center; padding: 20px;">Loading quiz analytics...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    try {
      const statsRes = await api.getStats();
      contentArea.querySelector('#pzTotalAttempts').textContent = statsRes.totalAttempts || 0;
      contentArea.querySelector('#pzAvgAccuracy').textContent = (statsRes.avgAccuracy || 0) + '%';
      contentArea.querySelector('#pzTotalTime').textContent = Math.round((statsRes.totalTimeSec || 0) / 60) + 'm';

      const histRes = await api.getHistory();
      const attempts = histRes.attempts || [];

      const tbody = contentArea.querySelector('#pzHistoryTbody');
      if (attempts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No practice quiz attempt logs found yet. Select a quiz from the catalogue to begin!</td></tr>';
        return;
      }

      tbody.innerHTML = attempts.map((att, idx) => `
        <tr>
          <td data-label="Date" style="font-size: 0.85rem;">${new Date(att.created_at).toLocaleString()}</td>
          <td data-label="Quiz Title" style="font-weight: 700; color: var(--text-main);">${att.quiz_title}</td>
          <td data-label="Category">${att.category_name || 'General'}</td>
          <td data-label="Accuracy"><span style="color: var(--success); font-weight: bold;">${att.accuracy_pct}%</span></td>
          <td data-label="Score">${att.score} / ${att.total_questions}</td>
          <td data-label="Duration" style="font-size: 0.85rem;">${Math.floor(att.time_taken_sec / 60)}m ${att.time_taken_sec % 60}s</td>
          <td data-label="Report">
            <button class="btn btn-sm btn-outline download-report-pdf-btn" data-idx="${idx}" title="Download PDF Report" aria-label="Download PDF Report">
              <i class="ri-file-pdf-2-line"></i> <span class="btn-text-desktop">PDF Report</span>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.download-report-pdf-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.idx, 10);
          const att = attempts[idx];
          const qstRes = await api.getQuestions(att.quiz_id).catch(() => ({ questions: [] }));
          await generateQuizPDFReport({
            user: user,
            quiz: { title: att.quiz_title, category_name: att.category_name },
            attempt: att,
            questions: qstRes.questions || []
          });
        });
      });
    } catch (err) {
      console.error('Quiz Analytics Tab Error:', err);
    }
  }

  // Student Custom Quiz Creation Modal
  btnCreateCustom.addEventListener('click', async () => {
    const catRes = await api.getCategories().catch(() => ({ flatCategories: [] }));
    const flatCats = catRes.flatCategories || [];

    const form = document.createElement('form');
    form.innerHTML = `
      <div class="form-group">
        <label>Quiz Title *</label>
        <input type="text" id="custTitle" class="form-input" placeholder="e.g. My Weak Area Algebra Practice" required />
      </div>
      <div class="form-group">
        <label>Description / Notes</label>
        <textarea id="custDesc" class="form-textarea" rows="2" placeholder="Custom student self-assessment practice session."></textarea>
      </div>
      <div class="form-group">
        <label>Select Category</label>
        <select id="custCat" class="form-select">
          <option value="">-- Select Category --</option>
          ${flatCats.map(c => `<option value="${c.id}">${c.icon || '📂'} ${c.name}</option>`).join('')}
        </select>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:12px; font-weight:700;">Create Practice Quiz</button>
    `;

    const modal = createModal({ title: '✨ Create Custom Self-Practice Quiz', content: form });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const body = {
          title: form.querySelector('#custTitle').value.trim(),
          description: form.querySelector('#custDesc').value.trim(),
          category_id: form.querySelector('#custCat').value || null,
          is_public: false
        };

        await api.createQuiz(body);
        modal.close();
        alert('Custom practice quiz created successfully! You can now add questions or practice.');
        if (activeTab === 'catalogue') fetchQuizzes();
      } catch (err) {
        alert(err.message || 'Error creating quiz.');
      }
    });
  });

  // Default initial tab
  renderCatalogueTab();
}
