const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = options.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || 'An error occurred during API request.';
    throw new Error(errorMsg);
  }

  return data;
}

function toBase64Utf8(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
  } catch (e) {
    return null;
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getMe: () => request('/auth/me'),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body }),
  getUsers: () => request('/auth/users'),
  updateUserRole: (id, role) => request(`/auth/users/${id}/role`, { method: 'PUT', body: { role } }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (body) => request('/categories', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request('/tags'),
  createTag: (body) => request('/tags', { method: 'POST', body }),
  deleteTag: (id) => request(`/tags/${id}`, { method: 'DELETE' }),

  // Quizzes
  getQuizzes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/quizzes${query ? '?' + query : ''}`);
  },
  getQuiz: (id) => request(`/quizzes/${id}`),
  getQuestions: (quizId) => request(`/quizzes/${quizId}/questions`),
  createQuiz: (body) => request('/quizzes', { method: 'POST', body }),
  updateQuiz: (id, body) => request(`/quizzes/${id}`, { method: 'PUT', body }),
  deleteQuiz: (id) => request(`/quizzes/${id}`, { method: 'DELETE' }),
  addQuestion: (quizId, formData) => request(`/quizzes/${quizId}/questions`, { method: 'POST', body: formData }),
  bulkUploadQuestions: (quizId, questions) => {
    const jsonStr = JSON.stringify(questions);
    const encodedPayload = toBase64Utf8(jsonStr);
    return request(`/quizzes/${quizId}/questions/bulk`, { 
      method: 'POST', 
      body: { encodedPayload } 
    });
  },
  updateQuestion: (qId, formData) => request(`/quizzes/questions/${qId}`, { method: 'PUT', body: formData }),
  deleteQuestion: (qId) => request(`/quizzes/questions/${qId}`, { method: 'DELETE' }),

  // Analytics
  logQuestion: (body) => request('/analytics/question-log', { method: 'POST', body }),
  saveQuizAttempt: (body) => request('/analytics/quiz-attempt', { method: 'POST', body }),
  getHistory: () => request('/analytics/history'),
  getStats: () => request('/analytics/stats'),
  getWeakAreas: () => request('/analytics/weak-areas')
};
