import { getUser, logout } from '../services/api.js';

export function renderNavbar(currentView, navigate) {
  const user = getUser();
  const navContainer = document.createElement('div');

  const roleBadgeHtml = user ? `<span class="role-badge ${user.role}">${user.role.replace('_', ' ')}</span>` : '';

  navContainer.innerHTML = `
    <!-- Top Navbar -->
    <nav class="navbar">
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle Side Drawer">☰</button>
        <div class="nav-brand" id="navHome">
          <div class="brand-logo-box">Q</div>
          <span>Quiz Mastery<sub class="brand-subscript">Pro</sub></span>
        </div>
      </div>

      <!-- Desktop Links -->
      <div class="nav-links nav-desktop-links">
        <button class="nav-btn ${currentView === 'dashboard' ? 'active' : ''}" id="navCatalog">Quiz Catalogue</button>
        
        ${user ? `
          <button class="nav-btn ${currentView === 'analytics' ? 'active' : ''}" id="navAnalytics">My Analytics</button>
          ${(user.role === 'admin' || user.role === 'super_admin') ? `
            <button class="nav-btn ${currentView === 'admin' ? 'active' : ''}" id="navAdmin">Admin Panel</button>
          ` : ''}
          <div style="display:flex; align-items:center; gap:8px; margin-left: 10px;">
            <span style="font-weight:600; font-size:0.88rem;">${user.full_name}</span>
            ${roleBadgeHtml}
            <button class="nav-btn btn-sm btn-secondary" id="navLogout">Logout</button>
          </div>
        ` : `
          <button class="nav-btn ${currentView === 'login' ? 'active' : ''}" id="navLogin">Sign In / Register</button>
        `}
        
        <button class="nav-btn" id="themeToggle" title="Toggle Dark/Light Mode">🌙</button>
      </div>
    </nav>

    <!-- Mobile/Tablet Side Navigation Drawer -->
    <div class="nav-drawer-overlay" id="drawerOverlay"></div>
    <aside class="nav-drawer" id="navDrawer">
      <div class="nav-drawer-header">
        <div class="nav-brand" id="drawerHome">
          <div class="brand-logo-box">Q</div>
          <span>Quiz Mastery<sub class="brand-subscript">Pro</sub></span>
        </div>
        <button class="nav-drawer-close" id="drawerClose">&times;</button>
      </div>

      <div class="nav-drawer-body">
        ${user ? `
          <div style="background:var(--primary-light); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--primary-border); margin-bottom:10px;">
            <div style="font-weight:700; font-size:0.95rem;">${user.full_name}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${user.email}</div>
            <div style="margin-top:6px;">${roleBadgeHtml}</div>
          </div>
        ` : ''}

        <button class="nav-btn ${currentView === 'dashboard' ? 'active' : ''}" id="drawerCatalog">📚 Quiz Catalogue</button>

        ${user ? `
          <button class="nav-btn ${currentView === 'analytics' ? 'active' : ''}" id="drawerAnalytics">📊 My Analytics</button>
          ${(user.role === 'admin' || user.role === 'super_admin') ? `
            <button class="nav-btn ${currentView === 'admin' ? 'active' : ''}" id="drawerAdmin">⚙️ Admin Panel</button>
          ` : ''}
          <button class="nav-btn btn-danger" id="drawerLogout" style="margin-top:auto;">Logout</button>
        ` : `
          <button class="nav-btn ${currentView === 'login' ? 'active' : ''}" id="drawerLogin">🔐 Sign In / Register</button>
        `}

        <div style="margin-top:16px; pt-16px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.85rem; font-weight:600;">Theme</span>
          <button class="nav-btn" id="drawerThemeToggle">🌙 Dark/Light</button>
        </div>
      </div>
    </aside>
  `;

  // Drawer Toggle Handlers
  const hamburgerBtn = navContainer.querySelector('#hamburgerBtn');
  const drawer = navContainer.querySelector('#navDrawer');
  const overlay = navContainer.querySelector('#drawerOverlay');
  const drawerClose = navContainer.querySelector('#drawerClose');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Router Helpers
  function handleNav(view) {
    closeDrawer();
    navigate(view);
  }

  // Desktop Events
  const homeBtn = navContainer.querySelector('#navHome');
  if (homeBtn) homeBtn.addEventListener('click', () => handleNav('dashboard'));

  const catBtn = navContainer.querySelector('#navCatalog');
  if (catBtn) catBtn.addEventListener('click', () => handleNav('dashboard'));

  const anaBtn = navContainer.querySelector('#navAnalytics');
  if (anaBtn) anaBtn.addEventListener('click', () => handleNav('analytics'));

  const admBtn = navContainer.querySelector('#navAdmin');
  if (admBtn) admBtn.addEventListener('click', () => handleNav('admin'));

  const logBtn = navContainer.querySelector('#navLogin');
  if (logBtn) logBtn.addEventListener('click', () => handleNav('login'));

  const logoutBtn = navContainer.querySelector('#navLogout');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    logout();
    handleNav('dashboard');
  });

  // Drawer Events
  const drawerHome = navContainer.querySelector('#drawerHome');
  if (drawerHome) drawerHome.addEventListener('click', () => handleNav('dashboard'));

  const drawerCatalog = navContainer.querySelector('#drawerCatalog');
  if (drawerCatalog) drawerCatalog.addEventListener('click', () => handleNav('dashboard'));

  const drawerAnalytics = navContainer.querySelector('#drawerAnalytics');
  if (drawerAnalytics) drawerAnalytics.addEventListener('click', () => handleNav('analytics'));

  const drawerAdmin = navContainer.querySelector('#drawerAdmin');
  if (drawerAdmin) drawerAdmin.addEventListener('click', () => handleNav('admin'));

  const drawerLogin = navContainer.querySelector('#drawerLogin');
  if (drawerLogin) drawerLogin.addEventListener('click', () => handleNav('login'));

  const drawerLogout = navContainer.querySelector('#drawerLogout');
  if (drawerLogout) drawerLogout.addEventListener('click', () => {
    logout();
    handleNav('dashboard');
  });

  // Theme Toggles
  const handleThemeToggle = (btn) => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    btn.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
  };

  const themeBtn = navContainer.querySelector('#themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', () => handleThemeToggle(themeBtn));

  const drawerThemeToggle = navContainer.querySelector('#drawerThemeToggle');
  if (drawerThemeToggle) drawerThemeToggle.addEventListener('click', () => handleThemeToggle(drawerThemeToggle));

  return navContainer;
}
