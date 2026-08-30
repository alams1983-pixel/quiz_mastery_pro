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
  if (!user && (view === 'analytics' || view === 'admin' || view === 'super-admin' || view === 'user-management' || view === 'institute-admin' || view === 'exam-questions' || view === 'question-editor' || view === 'taxonomy' || view === 'ssc-exam' || view === 'exam-analysis' || view === 'student-settings' || view === 'coaching-branding')) {
    alert('Please sign in or register to access this area.');
    currentView = 'login';
  } else if ((view === 'super-admin' || view === 'user-management') && user && user.role !== 'super_admin') {
    alert('Access denied. Super Admin privileges required.');
    currentView = 'dashboard';
  } else if ((view === 'institute-admin' || view === 'exam-questions' || view === 'question-editor' || view === 'taxonomy' || view === 'coaching-branding') && user && user.role !== 'institute_admin' && user.role !== 'super_admin' && user.role !== 'admin') {
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
    const confirmExit = confirm('Do you want to exit Quiz Mastery Pro application?');
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

  // SSC Exam Candidate View runs in FULL VIEWPORT mode without standard app shell
  if (currentView === 'ssc-exam') {
    const { renderSSCExamDashboardView } = await import('./views/SSCExamDashboardView.js');
    const sscView = renderSSCExamDashboardView(currentExtraParams.attemptId, navigate, currentExtraParams);
    app.appendChild(sscView);
    return;
  }

  // Unauthenticated visitors or explicit Login View: render standalone full-screen login page without sidebar shell
  if (!user || currentView === 'login') {
    const loginView = renderLoginView(navigate);
    loginView.style.minHeight = '100vh';
    loginView.style.width = '100vw';
    loginView.style.background = 'var(--bg-color, #f8fafc)';
    app.appendChild(loginView);
    return;
  }

  // Render App Shell (Dark Persistent Sidebar + Top Header) for Authenticated Users
  const appShell = renderNavbar(currentView, navigate, currentExtraParams);
  app.appendChild(appShell);

  const mainContent = appShell.querySelector('#appMainContent');

  // Render View Container (Dynamic Imports for heavy admin modules)
  let viewElement;

  switch (currentView) {
    case 'login':
      viewElement = renderLoginView(navigate);
      break;
    case 'dashboard':
      viewElement = renderUserDashboard(navigate, startQuizSession);
      break;
    case 'student-exams':
      viewElement = renderStudentExamsView(navigate);
      break;
    case 'student-quizzes':
      viewElement = renderStudentQuizzesView(navigate, startQuizSession);
      break;
    case 'student-settings': {
      const { renderStudentSettingsView } = await import('./views/StudentSettingsView.js');
      viewElement = renderStudentSettingsView(navigate);
      break;
    }
    case 'coaching-branding': {
      const { renderCoachingBrandingView } = await import('./views/CoachingBrandingView.js');
      viewElement = renderCoachingBrandingView(navigate);
      break;
    }
    case 'taxonomy': {
      const { renderTaxonomyView } = await import('./views/TaxonomyView.js');
      viewElement = renderTaxonomyView(navigate);
      break;
    }
    case 'quiz': {
      const { renderQuizView } = await import('./views/QuizView.js');
      viewElement = renderQuizView(currentQuizId, currentQuizCustomData, navigate);
      break;
    }
    case 'analytics': {
      const { renderAnalyticsView } = await import('./views/AnalyticsView.js');
      viewElement = renderAnalyticsView(navigate);
      break;
    }
    case 'admin': {
      const { renderAdminDashboard } = await import('./views/AdminDashboard.js');
      viewElement = renderAdminDashboard(navigate);
      break;
    }
    case 'user-management': {
      const { renderUserManagementView } = await import('./views/UserManagementView.js');
      viewElement = renderUserManagementView(navigate);
      break;
    }
    case 'super-admin': {
      const { renderSuperAdminView } = await import('./views/SuperAdminView.js');
      viewElement = renderSuperAdminView(navigate);
      break;
    }
    case 'institute-admin': {
      const { renderInstituteAdminView } = await import('./views/InstituteAdminView.js');
      viewElement = renderInstituteAdminView(navigate);
      break;
    }
    case 'exam-questions': {
      const { renderExamQuestionBankView } = await import('./views/ExamQuestionBankView.js');
      viewElement = renderExamQuestionBankView(navigate, currentExtraParams);
      break;
    }
    case 'question-editor': {
      const { renderMasterQuestionEditorView } = await import('./views/MasterQuestionEditorView.js');
      viewElement = renderMasterQuestionEditorView(navigate, currentExtraParams);
      break;
    }
    case 'exam-lobby': {
      const { renderExamLobbyView } = await import('./views/ExamLobbyView.js');
      viewElement = renderExamLobbyView(currentExtraParams.examId, navigate);
      break;
    }
    case 'exam-analysis': {
      const { renderExamAnalysisView } = await import('./views/ExamAnalysisView.js');
      viewElement = renderExamAnalysisView(currentExtraParams.attemptId, navigate);
      break;
    }
    default:
      viewElement = renderUserDashboard(navigate, startQuizSession);
  }

  if (mainContent && viewElement) {
    mainContent.appendChild(viewElement);
  }
}

// Initial Boot: Default route is public dashboard for everyone
navigate('dashboard');
