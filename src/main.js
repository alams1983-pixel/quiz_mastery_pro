import './style.css';
import { renderNavbar } from './components/Navbar.js';
import { renderLoginView } from './views/LoginView.js';
import { renderUserDashboard } from './views/UserDashboard.js';
import { renderStudentExamsView } from './views/StudentExamsView.js';
import { renderStudentQuizzesView } from './views/StudentQuizzesView.js';
import { getUser } from './services/api.js';
import { getTenantFromURL, fetchTenantBranding, applyTenantTheme } from './services/tenant.js';
import { initCookieBanner } from './components/CookieConsentModal.js';

const app = document.querySelector('#app');

let currentView = 'dashboard';
let currentQuizId = null;
let currentQuizCustomData = null;
let currentExtraParams = {};

// Apply saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

// Initialize GDPR Cookie Banner
initCookieBanner();

// Auto-check tenant subdomain or URL param on initial load
async function initTenantContext() {
  const slug = getTenantFromURL();
  if (slug) {
    const branding = await fetchTenantBranding(slug);
    if (branding) {
      applyTenantTheme(branding);
    }
  }
}
initTenantContext();

function navigate(view, params = {}, options = {}) {
  const user = getUser();

  // Auth Guard
  if (!user && (view === 'analytics' || view === 'admin' || view === 'super-admin' || view === 'user-management' || view === 'institute-admin' || view === 'institute-batches' || view === 'institute-students' || view === 'exam-questions' || view === 'question-editor' || view === 'taxonomy' || view === 'ssc-exam' || view === 'exam-analysis' || view === 'student-settings' || view === 'coaching-branding')) {
    alert('Please sign in or register to access this area.');
    currentView = 'login';
  } else if ((view === 'super-admin' || view === 'user-management') && user && user.role !== 'super_admin') {
    alert('Access denied. Super Admin privileges required.');
    currentView = 'dashboard';
  } else if ((view === 'institute-admin' || view === 'institute-batches' || view === 'institute-students' || view === 'exam-questions' || view === 'question-editor' || view === 'taxonomy' || view === 'coaching-branding') && user && user.role !== 'institute_admin' && user.role !== 'super_admin' && user.role !== 'admin') {
    alert('Access denied. Coaching Institute Admin privileges required.');
    currentView = 'dashboard';
  } else {
    currentView = view;
  }

  if (params.quizId) currentQuizId = params.quizId;
  if (params.customData) currentQuizCustomData = params.customData;
  currentExtraParams = params;

  // Manage Browser History Stack
  if (!options.skipPush) {
    const historyState = { view: currentView, params: currentExtraParams };
    if (!history.state) {
      history.replaceState(historyState, '');
    } else if (history.state.view !== currentView) {
      history.pushState(historyState, '');
    }
  }

  render();
}

// Global hook for external components and modals to trigger navigation
window.edutorNavigate = navigate;

// Handle Browser Back / Forward Navigation & Exam Exit Guard
window.addEventListener('popstate', (e) => {
  // 1. Live CBT Exam / Active Quiz Attempt Guard
  if (currentView === 'ssc-exam' || currentView === 'quiz') {
    history.pushState({ view: currentView, params: currentExtraParams }, '');

    import('./components/Modal.js').then(({ createModal }) => {
      const confirmContent = document.createElement('div');
      confirmContent.innerHTML = `
        <p style="font-size: 1rem; color: var(--text-main); margin-bottom: 18px; line-height: 1.5;">
          ⚠️ <strong>You are currently taking an active test!</strong><br>
          Are you sure you want to exit? Your submitted answers will be recorded.
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="btn-cancel-exit-test" class="btn btn-primary" style="font-weight:700;">Resume Exam</button>
          <button id="btn-confirm-exit-test" class="btn btn-danger" style="font-weight:700;">Exit Test →</button>
        </div>
      `;
      const modal = createModal({
        title: '🚨 Exit Active Exam?',
        content: confirmContent
      });

      confirmContent.querySelector('#btn-cancel-exit-test').addEventListener('click', () => {
        modal.close();
      });

      confirmContent.querySelector('#btn-confirm-exit-test').addEventListener('click', () => {
        modal.close();
        navigate('dashboard');
      });
    });
    return;
  }

  // 2. Standard SPA Internal Back Navigation
  if (e.state && e.state.view) {
    navigate(e.state.view, e.state.params || {}, { skipPush: true });
  } else {
    // 3. No previous app view in stack -> Confirmation prompt to prevent accidental app closure
    const confirmExit = confirm('Do you want to exit EdutorAi Pro application?');
    if (!confirmExit) {
      history.pushState({ view: currentView, params: currentExtraParams }, '');
    } else {
      window.history.back();
    }
  }
});

// Protect against accidental tab close or page reload during active exams
window.addEventListener('beforeunload', (e) => {
  if (currentView === 'ssc-exam' || currentView === 'quiz') {
    e.preventDefault();
    e.returnValue = '';
  }
});

function startQuizSession(quizId, customData = null) {
  currentQuizId = quizId;
  currentQuizCustomData = customData;
  navigate('quiz');
}

async function render() {
  app.innerHTML = '';
  const user = getUser();

  // 1. SSC Exam Candidate View runs in FULL VIEWPORT mode without standard app shell
  if (currentView === 'ssc-exam') {
    const React = (await import('react')).default;
    const { createRoot } = await import('react-dom/client');
    const { SSCExamDashboardView } = await import('./views/SSCExamDashboardView.jsx');
    
    const sscWrapper = document.createElement('div');
    const root = createRoot(sscWrapper);
    root.render(React.createElement(SSCExamDashboardView, { attemptId: currentExtraParams.attemptId, navigate, extraParams: currentExtraParams }));
    app.appendChild(sscWrapper);
    return;
  }

  // 2. Public Legal & Compliance Views (Accessible to all users without login)
  if (currentView === 'privacy-policy' || currentView === 'terms-of-use' || currentView === 'cookie-policy') {
    const React = (await import('react')).default;
    const { createRoot } = await import('react-dom/client');
    
    const legalWrapper = document.createElement('div');
    legalWrapper.id = 'legalScrollContainer';
    legalWrapper.style.height = '100vh';
    legalWrapper.style.width = '100vw';
    legalWrapper.style.overflowY = 'auto';
    legalWrapper.style.overflowX = 'hidden';
    legalWrapper.style.position = 'relative';
    legalWrapper.style.scrollBehavior = 'smooth';
    const root = createRoot(legalWrapper);

    if (currentView === 'privacy-policy') {
      const { PrivacyPolicyView } = await import('./views/PrivacyPolicyView.jsx');
      root.render(React.createElement(PrivacyPolicyView, { navigate }));
    } else if (currentView === 'terms-of-use') {
      const { TermsOfUseView } = await import('./views/TermsOfUseView.jsx');
      root.render(React.createElement(TermsOfUseView, { navigate }));
    } else if (currentView === 'cookie-policy') {
      const { CookiePolicyView } = await import('./views/CookiePolicyView.jsx');
      root.render(React.createElement(CookiePolicyView, { navigate }));
    }
    app.appendChild(legalWrapper);
    return;
  }

  // 3. Unauthenticated visitors or explicit Login View: render standalone full-screen login page without sidebar shell
  if (!user || currentView === 'login') {
    const React = (await import('react')).default;
    const { createRoot } = await import('react-dom/client');
    const { LoginView } = await import('./views/LoginView.jsx');
    
    const viewWrapper = document.createElement('div');
    viewWrapper.style.minHeight = '100vh';
    viewWrapper.style.width = '100vw';
    viewWrapper.style.background = 'var(--bg-color, #f8fafc)';
    const root = createRoot(viewWrapper);
    root.render(React.createElement(LoginView, { navigate }));
    app.appendChild(viewWrapper);
    return;
  }

  // Render App Shell (Dark Persistent Sidebar + Top Header) for Authenticated Users
  const appShell = renderNavbar(currentView, navigate, currentExtraParams);
  app.appendChild(appShell);

  const mainContent = appShell.querySelector('#appMainContent');

  // Render View Container (Dynamic Imports for heavy admin modules)
  let viewElement;

  switch (currentView) {
    case 'login': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { LoginView } = await import('./views/LoginView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(LoginView, { navigate }));
      break;
    }
    case 'dashboard': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { UserDashboard } = await import('./views/UserDashboard.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(UserDashboard, { navigate, startQuizSession }));
      break;
    }
    case 'student-exams': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { StudentExamsView } = await import('./views/StudentExamsView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(StudentExamsView, { navigate }));
      break;
    }
    case 'student-quizzes': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { StudentQuizzesView } = await import('./views/StudentQuizzesView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(StudentQuizzesView, { navigate, startQuizSession }));
      break;
    }
    case 'student-settings': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { StudentSettingsView } = await import('./views/StudentSettingsView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(StudentSettingsView, { navigate }));
      break;
    }
    case 'coaching-branding': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { CoachingBrandingView } = await import('./views/CoachingBrandingView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(CoachingBrandingView, { navigate }));
      break;
    }
    case 'taxonomy': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { TaxonomyView } = await import('./views/TaxonomyView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(TaxonomyView, { navigate }));
      break;
    }
    case 'quiz': {
      const { renderQuizView } = await import('./views/QuizView.js');
      viewElement = renderQuizView(currentQuizId, currentQuizCustomData, navigate);
      break;
    }
    case 'analytics': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { AnalyticsView } = await import('./views/AnalyticsView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(AnalyticsView, { navigate }));
      break;
    }
    case 'admin': {
      const { renderAdminDashboard } = await import('./views/AdminDashboard.js');
      viewElement = renderAdminDashboard(navigate);
      break;
    }
    case 'user-management': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { UserManagementView } = await import('./views/UserManagementView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(UserManagementView, { navigate }));
      break;
    }
    case 'super-admin': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { SuperAdminView } = await import('./views/SuperAdminView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(SuperAdminView, { navigate }));
      break;
    }
    case 'institute-admin': {
      const { renderInstituteAdminView } = await import('./views/InstituteAdminView.js');
      viewElement = renderInstituteAdminView(navigate, 'exams');
      break;
    }
    case 'institute-batches': {
      const { renderInstituteAdminView } = await import('./views/InstituteAdminView.js');
      viewElement = renderInstituteAdminView(navigate, 'batches');
      break;
    }
    case 'institute-students': {
      const { renderInstituteAdminView } = await import('./views/InstituteAdminView.js');
      viewElement = renderInstituteAdminView(navigate, 'students');
      break;
    }
    case 'exam-questions': {
      const { renderExamQuestionBankView } = await import('./views/ExamQuestionBankView.js');
      viewElement = renderExamQuestionBankView(navigate, currentExtraParams);
      break;
    }
    case 'question-editor': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { MasterQuestionEditorView } = await import('./views/MasterQuestionEditorView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(MasterQuestionEditorView, { navigate, params: currentExtraParams }));
      break;
    }
    case 'exam-lobby': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { ExamLobbyView } = await import('./views/ExamLobbyView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(ExamLobbyView, { examId: currentExtraParams.examId, navigate }));
      break;
    }
    case 'exam-analysis': {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { ExamAnalysisView } = await import('./views/ExamAnalysisView.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(ExamAnalysisView, { attemptId: currentExtraParams.attemptId, navigate }));
      break;
    }
    default: {
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      const { UserDashboard } = await import('./views/UserDashboard.jsx');
      
      viewElement = document.createElement('div');
      const root = createRoot(viewElement);
      root.render(React.createElement(UserDashboard, { navigate, startQuizSession }));
      break;
    }
  }

  if (mainContent && viewElement) {
    mainContent.appendChild(viewElement);
  }
}

// Initial Boot: Route detection for deep links, hash navigation, and default dashboard
function getInitialRoute() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = (urlParams.get('view') || '').toLowerCase();

  if (path === 'privacy-policy' || hash === 'privacy-policy' || viewParam === 'privacy-policy') return 'privacy-policy';
  if (path === 'terms-of-use' || hash === 'terms-of-use' || viewParam === 'terms-of-use' || path === 'terms' || hash === 'terms') return 'terms-of-use';
  if (path === 'cookie-policy' || hash === 'cookie-policy' || viewParam === 'cookie-policy' || path === 'cookies' || hash === 'cookies') return 'cookie-policy';
  return 'dashboard';
}

navigate(getInitialRoute(), {}, { skipPush: true });

