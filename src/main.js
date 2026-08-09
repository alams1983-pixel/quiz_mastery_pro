import './style.css';
import { renderNavbar } from './components/Navbar.js';
import { renderLoginView } from './views/LoginView.js';
import { renderUserDashboard } from './views/UserDashboard.js';
import { renderQuizView } from './views/QuizView.js';
import { renderAnalyticsView } from './views/AnalyticsView.js';
import { renderAdminDashboard } from './views/AdminDashboard.js';
import { getUser } from './services/api.js';

const app = document.querySelector('#app');

let currentView = 'dashboard';
let currentQuizId = null;
let currentQuizCustomData = null;

// Apply saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

function navigate(view, params = {}) {
  const user = getUser();

  // Auth Guard: Guest can access 'dashboard' (Catalogue), 'login', and 'quiz'.
  // 'analytics' and 'admin' require user login.
  if (!user && (view === 'analytics' || view === 'admin')) {
    alert('Please sign in or register to access this area.');
    currentView = 'login';
  } else {
    currentView = view;
  }

  if (params.quizId) currentQuizId = params.quizId;
  if (params.customData) currentQuizCustomData = params.customData;

  render();
}

function startQuizSession(quizId, customData = null) {
  // Allow all users (including unauthenticated guests) to run the quiz!
  currentQuizId = quizId;
  currentQuizCustomData = customData;
  navigate('quiz');
}

function render() {
  app.innerHTML = '';

  // Render Navbar
  const navbar = renderNavbar(currentView, navigate);
  app.appendChild(navbar);

  // Render View Container
  let viewElement;

  switch (currentView) {
    case 'login':
      viewElement = renderLoginView(navigate);
      break;
    case 'dashboard':
      viewElement = renderUserDashboard(navigate, startQuizSession);
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
    default:
      viewElement = renderUserDashboard(navigate, startQuizSession);
  }

  app.appendChild(viewElement);
}

// Initial Boot: Default route is public dashboard for everyone
navigate('dashboard');
