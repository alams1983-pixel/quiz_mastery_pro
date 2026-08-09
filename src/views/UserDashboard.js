import { api } from '../services/api.js';
import { renderCategoryTree } from '../components/CategoryTree.js';

export function renderUserDashboard(navigate, startQuizSession) {
  const container = document.createElement('div');
  container.className = 'view-container';

  container.innerHTML = `
    <!-- Hero Banner -->
    <div style="background: linear-gradient(135deg, var(--primary) 0%, #1e1b4b 100%); border-radius: var(--radius-lg); padding: 28px 32px; color: #ffffff; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: var(--shadow-md);">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.02em;">
          Quiz Mastery<sub class="brand-subscript">Pro</sub> Catalogue
        </h1>
        <p style="opacity: 0.9; font-size: 0.98rem;">Select any quiz to practice, build active memory retention, or test weak areas.</p>
      </div>
      <button class="btn" id="weakAreaBtn" style="background: #ffffff; color: var(--primary); box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        🎯 Practice My Weak Areas
      </button>
    </div>

    <!-- Main Grid Layout: Left Sidebar + Right Catalogue -->
    <div class="dashboard-grid" style="display: grid; grid-template-columns: 260px 1fr; gap: 28px; align-items: start;">
      
      <!-- Left Sidebar: Category Tree & Filters -->
      <div class="desktop-sidebar" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm);">
        <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 14px; color: var(--primary);">Categories</h3>
        <div id="categoryTreeContainer"></div>
      </div>

      <!-- Right Catalogue: Search & Cards -->
      <div>
        <div style="display: flex; gap: 16px; margin-bottom: 20px;">
          <input type="text" id="searchInput" class="form-input" placeholder="🔍 Search quizzes by title, topic, or keyword..." />
        </div>

        <div id="quizGrid" class="grid">
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            Loading quizzes...
          </div>
        </div>
      </div>

    </div>
  `;

  let categories = [];
  let selectedCategoryId = null;
  let searchQuery = '';

  const treeContainer = container.querySelector('#categoryTreeContainer');
  const quizGrid = container.querySelector('#quizGrid');
  const searchInput = container.querySelector('#searchInput');
  const weakAreaBtn = container.querySelector('#weakAreaBtn');

  async function loadData() {
    try {
      const catRes = await api.getCategories();
      categories = catRes.categories || [];
      renderTree();
      await fetchQuizzes();
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  }

  function renderTree() {
    treeContainer.innerHTML = '';
    treeContainer.appendChild(renderCategoryTree(categories, selectedCategoryId, (catId) => {
      selectedCategoryId = catId;
      renderTree();
      fetchQuizzes();
    }));
  }

  async function fetchQuizzes() {
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
            No quizzes found matching your search criteria.
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
            <span style="font-size:0.78rem; font-weight:700; color:var(--primary); background:var(--primary-light); border:1px solid var(--primary-border); padding:3px 10px; border-radius:var(--radius-pill);">
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

          <button class="btn start-quiz-btn" style="width:100%;">
            Start Quiz Session →
          </button>
        `;

        card.querySelector('.start-quiz-btn').addEventListener('click', () => {
          startQuizSession(q.id);
        });

        quizGrid.appendChild(card);
      });
    } catch (err) {
      quizGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--danger); text-align:center;">Failed to load quizzes: ${err.message}</div>`;
    }
  }

  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      fetchQuizzes();
    }, 300);
  });

  weakAreaBtn.addEventListener('click', async () => {
    try {
      const res = await api.getWeakAreas();
      const questions = res.questions || [];
      if (questions.length === 0) {
        alert('Great job! You currently have no questions in your weak area list.');
        return;
      }
      startQuizSession(null, { isWeakArea: true, questions });
    } catch (err) {
      alert('Please log in or register to practice weak areas.');
      navigate('login');
    }
  });

  loadData();

  return container;
}
