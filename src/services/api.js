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

const memoryCache = new Map();

export const cache = {
  get(key) {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return entry.data;
  },
  set(key, data, ttlMs = 300000) {
    memoryCache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  },
  invalidate(keyPattern) {
    if (!keyPattern) {
      memoryCache.clear();
      return;
    }
    for (const key of memoryCache.keys()) {
      if (key.includes(keyPattern)) {
        memoryCache.delete(key);
      }
    }
  }
};

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  cache.invalidate();
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
  getCategories: async () => {
    const cached = cache.get('categories');
    if (cached) return cached;
    const res = await request('/categories');
    cache.set('categories', res, 600000); // 10 min TTL
    return res;
  },
  createCategory: async (body) => {
    const res = await request('/categories', { method: 'POST', body });
    cache.invalidate('categories');
    return res;
  },
  updateCategory: async (id, body) => {
    const res = await request(`/categories/${id}`, { method: 'PUT', body });
    cache.invalidate('categories');
    return res;
  },
  deleteCategory: async (id) => {
    const res = await request(`/categories/${id}`, { method: 'DELETE' });
    cache.invalidate('categories');
    return res;
  },

  // Tags
  getTags: async () => {
    const cached = cache.get('tags');
    if (cached) return cached;
    const res = await request('/tags');
    cache.set('tags', res, 600000); // 10 min TTL
    return res;
  },
  createTag: async (body) => {
    const res = await request('/tags', { method: 'POST', body });
    cache.invalidate('tags');
    return res;
  },
  deleteTag: async (id) => {
    const res = await request(`/tags/${id}`, { method: 'DELETE' });
    cache.invalidate('tags');
    return res;
  },

  // Quizzes
  getQuizzes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const cacheKey = `quizzes_${query}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const res = await request(`/quizzes${query ? '?' + query : ''}`);
    cache.set(cacheKey, res, 300000); // 5 min TTL
    return res;
  },
  getQuiz: (id) => request(`/quizzes/${id}`),
  getQuestions: async (quizId) => {
    const cacheKey = `questions_${quizId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const res = await request(`/quizzes/${quizId}/questions`);
    cache.set(cacheKey, res, 300000); // 5 min TTL
    return res;
  },
  createQuiz: async (body) => {
    const res = await request('/quizzes', { method: 'POST', body });
    cache.invalidate('quizzes');
    return res;
  },
  updateQuiz: async (id, body) => {
    const res = await request(`/quizzes/${id}`, { method: 'PUT', body });
    cache.invalidate('quizzes');
    return res;
  },
  deleteQuiz: async (id) => {
    const res = await request(`/quizzes/${id}`, { method: 'DELETE' });
    cache.invalidate('quizzes');
    cache.invalidate(`questions_${id}`);
    return res;
  },
  addQuestion: async (quizId, formData) => {
    const res = await request(`/quizzes/${quizId}/questions`, { method: 'POST', body: formData });
    cache.invalidate(`questions_${quizId}`);
    cache.invalidate('quizzes');
    return res;
  },
  bulkUploadQuestions: async (quizId, questions) => {
    const jsonStr = JSON.stringify(questions);
    const encodedPayload = toBase64Utf8(jsonStr);
    const res = await request(`/quizzes/${quizId}/questions/bulk`, { 
      method: 'POST', 
      body: { encodedPayload } 
    });
    cache.invalidate(`questions_${quizId}`);
    cache.invalidate('quizzes');
    return res;
  },
  updateQuestion: async (qId, formData) => {
    const res = await request(`/quizzes/questions/${qId}`, { method: 'PUT', body: formData });
    cache.invalidate('questions');
    cache.invalidate('quizzes');
    return res;
  },
  deleteQuestion: async (qId) => {
    const res = await request(`/quizzes/questions/${qId}`, { method: 'DELETE' });
    cache.invalidate('questions');
    cache.invalidate('quizzes');
    return res;
  },

  // Analytics
  logQuestion: (body) => request('/analytics/question-log', { method: 'POST', body }),
  saveQuizAttempt: (body) => request('/analytics/quiz-attempt', { method: 'POST', body }),
  getHistory: () => request('/analytics/history'),
  getStats: () => request('/analytics/stats'),
  getWeakAreas: () => request('/analytics/weak-areas')
};

export { request as apiRequest };

