import { getUser, logout } from '../services/api.js';

export function renderNavbar(currentView, navigate, extraParams = {}) {
  const user = getUser();
  const shell = document.createElement('div');
  shell.className = 'dashboard-app-layout';

  const roleTitleMap = {
    super_admin: '👑 Super Admin Portal',
    institute_admin: '🏫 Coaching Institute Portal',
    admin: '⚙️ Quiz Administrator',
    user: '🎓 Student Practice Hub'
  };

  const currentRoleTitle = user ? (roleTitleMap[user.role] || '🎓 Student') : 'Public Portal';

  // Get Breadcrumb text based on current view
  const viewTitleMap = {
    'dashboard': 'Dashboard & Quiz Catalogue',
    'analytics': 'My Performance Analytics',
    'institute-admin': 'Institute Portal',
    'admin': 'Practice Quiz Manager',
    'user-management': 'User Role Control & Access Management',
    'super-admin': 'Platform Super Admin',
    'taxonomy': 'Master Taxonomy & Tags',
    'exam-lobby': 'SSC CBT Exam Lobby',
    'exam-analysis': 'Detailed Exam Scorecard & Analysis',
    'login': 'Sign In / Account Registration'
  };

  const currentBreadcrumb = viewTitleMap[currentView] || 'Dashboard';

  shell.innerHTML = `
    <!-- Persistent Left Dark Sidebar -->
    <aside class="app-sidebar" id="appSidebar">
      <!-- Sidebar Brand Header -->
      <div class="sidebar-brand" id="brandClick">
        <div class="brand-logo-icon">Q</div>
        <div class="brand-text">
          <span class="brand-title">Quiz Mastery</span>
          <span class="brand-sub">PRO SAAS</span>
        </div>
      </div>

      <!-- Navigation Menu Items -->
      <div class="sidebar-nav-container">

        <!-- Section 1: Main Portal Navigation -->
        <div class="nav-section-label">STUDENT HUB</div>

        <button class="sidebar-nav-item ${currentView === 'dashboard' ? 'active' : ''}" id="sideCatalog">
          <i class="ri-home-4-line nav-icon"></i>
          <span class="nav-label">Home</span>
        </button>

        <button class="sidebar-nav-item ${currentView === 'student-exams' ? 'active' : ''}" id="sideStudentExams">
          <i class="ri-computer-line nav-icon"></i>
          <span class="nav-label">My Exams</span>
          <span class="nav-badge orange">CBT</span>
        </button>

        <button class="sidebar-nav-item ${currentView === 'student-quizzes' ? 'active' : ''}" id="sideStudentQuizzes">
          <i class="ri-file-list-3-line nav-icon"></i>
          <span class="nav-label">My Quizzes</span>
        </button>

        ${user ? `
          <button class="sidebar-nav-item ${currentView === 'analytics' ? 'active' : ''}" id="sideAnalytics">
            <i class="${user.role === 'super_admin' ? 'ri-pie-chart-2-line' : (user.role === 'institute_admin' || user.role === 'admin' ? 'ri-user-star-line' : 'ri-bar-chart-box-line')} nav-icon"></i>
            <span class="nav-label">
              ${user.role === 'super_admin' ? 'Platform Analytics' : (user.role === 'institute_admin' || user.role === 'admin' ? 'Student Analytics' : 'My Analytics')}
            </span>
            <span class="nav-badge green">Live</span>
          </button>
        ` : ''}

        <!-- Section 2: Teacher & Coaching Admin (Role Filtered) -->
        ${user && (user.role === 'institute_admin' || user.role === 'admin' || user.role === 'super_admin') ? `
          <div class="nav-section-label" style="margin-top: 18px;">TEACHER & COACHING</div>

          <button class="sidebar-nav-item ${currentView === 'institute-admin' ? 'active' : ''}" id="sideInstituteAdmin">
            <i class="ri-building-4-line nav-icon"></i>
            <span class="nav-label">CBT Exams</span>
            <span class="nav-badge orange">Engine</span>
          </button>

          <button class="sidebar-nav-item ${currentView === 'exam-questions' || currentView === 'question-editor' ? 'active' : ''}" id="sideExamQuestions">
            <i class="ri-database-2-line nav-icon"></i>
            <span class="nav-label">Question Bank</span>
            <span class="nav-badge blue">Bank</span>
          </button>

          <button class="sidebar-nav-item ${currentView === 'admin' ? 'active' : ''}" id="sideQuizzes">
            <i class="ri-file-list-3-line nav-icon"></i>
            <span class="nav-label">Practice Quizzes</span>
          </button>

          <button class="sidebar-nav-item ${currentView === 'taxonomy' ? 'active' : ''}" id="sideTaxonomy">
            <i class="ri-price-tag-3-line nav-icon"></i>
            <span class="nav-label">Taxonomy & Tags</span>
          </button>
        ` : ''}

        <!-- Section 3: Super Administrator -->
        ${user && user.role === 'super_admin' ? `
          <div class="nav-section-label" style="margin-top: 18px;">SUPER ADMIN</div>

          <button class="sidebar-nav-item ${currentView === 'user-management' ? 'active' : ''}" id="sideUserManagement">
            <i class="ri-user-settings-line nav-icon"></i>
            <span class="nav-label">User Management</span>
            <span class="nav-badge purple">Control</span>
          </button>

          <button class="sidebar-nav-item ${currentView === 'super-admin' ? 'active' : ''}" id="sideSuperAdmin">
            <i class="ri-shield-user-line nav-icon"></i>
            <span class="nav-label">Super Admin</span>
            <span class="nav-badge purple">Owner</span>
          </button>
        ` : ''}

      </div>

      <!-- Bottom User Profile & Sign Out Bar -->
      <div class="sidebar-footer">
        ${user ? `
          <div class="user-profile-widget">
            <div class="user-avatar">${user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</div>
            <div class="user-info">
              <span class="user-name">${user.full_name}</span>
              <span class="user-role-tag ${user.role}">${user.role.replace('_', ' ')}</span>
            </div>
          </div>

          <button class="sidebar-nav-item btn-signout" id="sideLogout">
            <i class="ri-logout-box-r-line nav-icon"></i>
            <span class="nav-label">SIGN OUT</span>
          </button>
        ` : `
          <button class="sidebar-nav-item btn-signin" id="sideLogin">
            <i class="ri-lock-line nav-icon"></i>
            <span class="nav-label">SIGN IN / REGISTER</span>
          </button>
        `}
      </div>
    </aside>

    <!-- Sidebar Overlay for Mobile Responsiveness -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Main Content App Wrapper (Top Header + Page Content) -->
    <div class="app-main-wrapper">
      
      <!-- Top App Header -->
      <header class="app-top-header">
        <div class="header-left">
          <button class="sidebar-toggle-btn" id="sidebarToggleBtn" title="Toggle Navigation Sidebar">
            <i class="ri-menu-fold-line"></i>
          </button>

          <div class="breadcrumb-container">
            <i class="ri-home-4-line breadcrumb-icon"></i>
            <span class="breadcrumb-root">Quiz Mastery Pro</span>
          </div>
        </div>

        <div class="header-center">
          <div class="header-search-bar">
            <i class="ri-search-line search-icon"></i>
            <input type="text" id="globalHeaderSearch" placeholder="Search quizzes, exams, topics..." />
          </div>
        </div>

        <div class="header-right">
          <div class="header-role-indicator">
            <span class="role-pill-badge ${user ? user.role : 'guest'}">${currentRoleTitle}</span>
          </div>

          <button class="header-icon-btn" id="themeToggleBtn" title="Toggle Theme (Dark / Light)">
            <i class="ri-moon-line"></i>
          </button>
        </div>
      </header>

      <!-- View Container Root -->
      <main class="app-page-content" id="appMainContent"></main>
    </div>
  `;

  // Attach Event Handlers
  const sidebar = shell.querySelector('#appSidebar');
  const overlay = shell.querySelector('#sidebarOverlay');
  const toggleBtn = shell.querySelector('#sidebarToggleBtn');

  toggleBtn.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    } else {
      sidebar.classList.toggle('collapsed');
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    }
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  function navTo(v) {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    navigate(v);
  }

  const brand = shell.querySelector('#brandClick');
  if (brand) brand.addEventListener('click', () => navTo('dashboard'));

  const sideCat = shell.querySelector('#sideCatalog');
  if (sideCat) sideCat.addEventListener('click', () => navTo('dashboard'));

  const sideStudExams = shell.querySelector('#sideStudentExams');
  if (sideStudExams) sideStudExams.addEventListener('click', () => navTo('student-exams'));

  const sideStudQuizzes = shell.querySelector('#sideStudentQuizzes');
  if (sideStudQuizzes) sideStudQuizzes.addEventListener('click', () => navTo('student-quizzes'));

  const sideAna = shell.querySelector('#sideAnalytics');
  if (sideAna) sideAna.addEventListener('click', () => navTo('analytics'));

  const sideInst = shell.querySelector('#sideInstituteAdmin');
  if (sideInst) sideInst.addEventListener('click', () => navTo('institute-admin'));

  const sideExamQ = shell.querySelector('#sideExamQuestions');
  if (sideExamQ) sideExamQ.addEventListener('click', () => navTo('exam-questions'));

  const sideQuizzes = shell.querySelector('#sideQuizzes');
  if (sideQuizzes) sideQuizzes.addEventListener('click', () => navTo('admin'));

  const sideTaxonomy = shell.querySelector('#sideTaxonomy');
  if (sideTaxonomy) sideTaxonomy.addEventListener('click', () => navTo('taxonomy'));

  const sideUserMgmt = shell.querySelector('#sideUserManagement');
  if (sideUserMgmt) sideUserMgmt.addEventListener('click', () => navTo('user-management'));

  const sideSuper = shell.querySelector('#sideSuperAdmin');
  if (sideSuper) sideSuper.addEventListener('click', () => navTo('super-admin'));

  const sideLogin = shell.querySelector('#sideLogin');
  if (sideLogin) sideLogin.addEventListener('click', () => navTo('login'));

  const sideLogout = shell.querySelector('#sideLogout');
  if (sideLogout) sideLogout.addEventListener('click', () => {
    logout();
    navTo('dashboard');
  });

  // Theme Handler
  const themeBtn = shell.querySelector('#themeToggleBtn');
  if (themeBtn) {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    themeBtn.innerHTML = isDark ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';

    themeBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      themeBtn.innerHTML = newTheme === 'dark' ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
    });
  }

  return shell;
}
