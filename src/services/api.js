const API_BASE = '/api';

/**
 * Retrieve active JWT token from localStorage
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * Store or remove JWT token in localStorage
 * @param {string|null} token 
 */
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

/**
 * Retrieve authenticated user object from localStorage
 * @returns {Object|null}
 */
export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Store or remove user object in localStorage
 * @param {Object|null} user 
 */
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

function getCacheTTL(endpoint) {
  // Cache exam lists, details, and sections for client-side navigation
  if (
    endpoint === '/exams' ||
    (endpoint.startsWith('/exams?') && !endpoint.includes('nocache')) ||
    /^\/exams\/\d+$/.test(endpoint) ||
    /^\/exams\/\d+\/sections-questions$/.test(endpoint) ||
    endpoint === '/exams/batches/all'
  ) {
    return 150000; // 2.5 minutes TTL
  }
  return null;
}

export async function request(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const cacheTtl = getCacheTTL(endpoint);
  const cacheKey = `req_${endpoint}`;

  // Serve from client cache for repeat page navigation
  if (method === 'GET' && cacheTtl && !options.noCache) {
    const cached = cache.get(cacheKey);
    if (cached !== null && cached !== undefined) return cached;
  }

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

  if (method === 'GET' && cacheTtl && !options.noCache) {
    cache.set(cacheKey, data, cacheTtl);
  } else if (method !== 'GET') {
    // Invalidate related cache keys on mutations
    if (endpoint.startsWith('/exams')) {
      cache.invalidate('exams');
      cache.invalidate('req_/exams');
    }
    if (endpoint.startsWith('/quizzes')) {
      cache.invalidate('quizzes');
      cache.invalidate('questions');
    }
    if (endpoint.startsWith('/categories')) cache.invalidate('categories');
    if (endpoint.startsWith('/tags')) cache.invalidate('tags');
    if (endpoint.startsWith('/institutes')) cache.invalidate('institutes');
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
  firebaseLogin: (body) => request('/auth/firebase-login', { method: 'POST', body }),
  getMe: () => request('/auth/me'),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body }),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/auth/users${query ? `?${query}` : ''}`);
  },
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
    if (cached && Array.isArray(cached.questions) && cached.questions.length > 0) return cached;
    const res = await request(`/quizzes/${quizId}/questions`);
    if (res && Array.isArray(res.questions) && res.questions.length > 0) {
      cache.set(cacheKey, res, 300000); // 5 min TTL
    }
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

