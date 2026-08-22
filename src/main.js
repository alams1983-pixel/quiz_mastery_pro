import './style.css';
import { renderNavbar } from './components/Navbar.js';
import { renderLoginView } from './views/LoginView.js';
import { renderUserDashboard } from './views/UserDashboard.js';
import { renderQuizView } from './views/QuizView.js';
import { renderAnalyticsView } from './views/AnalyticsView.js';
import { renderAdminDashboard } from './views/AdminDashboard.js';
import { renderSuperAdminView } from './views/SuperAdminView.js';
import { renderUserManagementView } from './views/UserManagementView.js';
import { renderInstituteAdminView } from './views/InstituteAdminView.js';
import { renderExamLobbyView } from './views/ExamLobbyView.js';
import { renderSSCExamDashboardView } from './views/SSCExamDashboardView.js';
import { renderExamAnalysisView } from './views/ExamAnalysisView.js';
import { renderExamQuestionBankView } from './views/ExamQuestionBankView.js';
import { renderMasterQuestionEditorView } from './views/MasterQuestionEditorView.js';
import { renderStudentExamsView } from './views/StudentExamsView.js';
import { renderStudentQuizzesView } from './views/StudentQuizzesView.js';
import { renderTaxonomyView } from './views/TaxonomyView.js';
import { getUser } from './services/api.js';

const app = document.querySelector('#app');

let currentView = 'dashboard';
let currentQuizId = null;
let currentQuizCustomData = null;
let currentExtraParams = {};

// Apply saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

function navigate(view, params = {}) {
  const user = getUser();

  // Auth Guard
  if (!user && (view === 'analytics' || view === 'admin' || view === 'super-admin' || view === 'user-management' || view === 'institute-admin' || view === 'exam-questions' || view === 'question-editor' || view === 'taxonomy' || view === 'ssc-exam' || view === 'exam-analysis')) {
    alert('Please sign in or register to access this area.');
    currentView = 'login';
  } else if ((view === 'super-admin' || view === 'user-management') && user && user.role !== 'super_admin') {
    alert('Access denied. Super Admin privileges required.');
    currentView = 'dashboard';
  } else if ((view === 'institute-admin' || view === 'exam-questions' || view === 'question-editor' || view === 'taxonomy') && user && user.role !== 'institute_admin' && user.role !== 'super_admin' && user.role !== 'admin') {
    alert('Access denied. Coaching Institute Admin privileges required.');
    currentView = 'dashboard';
  } else {
    currentView = view;
  }

  if (params.quizId) currentQuizId = params.quizId;
  if (params.customData) currentQuizCustomData = params.customData;
  currentExtraParams = params;

  render();
}

function startQuizSession(quizId, customData = null) {
  currentQuizId = quizId;
  currentQuizCustomData = customData;
  navigate('quiz');
}

function render() {
  app.innerHTML = '';

  // SSC Exam Candidate View runs in FULL VIEWPORT mode without standard app shell
  if (currentView === 'ssc-exam') {
    const sscView = renderSSCExamDashboardView(currentExtraParams.attemptId, navigate, currentExtraParams);
    app.appendChild(sscView);
    return;
  }

  // Render App Shell (Dark Persistent Sidebar + Top Header)
  const appShell = renderNavbar(currentView, navigate, currentExtraParams);
  app.appendChild(appShell);

  const mainContent = appShell.querySelector('#appMainContent');

  // Render View Container
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
    case 'taxonomy':
      viewElement = renderTaxonomyView(navigate);
      break;
    case 'quiz':
      viewElement = renderQuizView(currentQuizId, currentQuizCustomData, navigate);
      break;
    case 'analytics':
      viewElement = renderAnalyticsView(navigate);
      break;
    case 'admin':
      viewElement = renderAdminDashboard(navigate);
      break;
    case 'user-management':
      viewElement = renderUserManagementView(navigate);
      break;
    case 'super-admin':
      viewElement = renderSuperAdminView(navigate);
      break;
    case 'institute-admin':
      viewElement = renderInstituteAdminView(navigate);
      break;
    case 'exam-questions':
      viewElement = renderExamQuestionBankView(navigate, currentExtraParams);
      break;
    case 'question-editor':
      viewElement = renderMasterQuestionEditorView(navigate, currentExtraParams);
      break;
    case 'exam-lobby':
      viewElement = renderExamLobbyView(currentExtraParams.examId, navigate);
      break;
    case 'exam-analysis':
      viewElement = renderExamAnalysisView(currentExtraParams.attemptId, navigate);
      break;
    default:
      viewElement = renderUserDashboard(navigate, startQuizSession);
  }

  if (mainContent) {
    mainContent.appendChild(viewElement);
  }
}

// Initial Boot: Default route is public dashboard for everyone
navigate('dashboard');
