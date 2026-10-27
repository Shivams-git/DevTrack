const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('devtrack_token');
  const isTestMode = localStorage.getItem('devtrack_test_mode') === 'true';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isTestMode ? { 'x-test-mode': 'true' } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(`Unable to reach DevTrack API at ${API_BASE_URL}. Ensure the backend server is running.`);
    }
    throw error;
  }
}

export const api = {
  getHealth: () => request('/api/health'),

  getIssues: (params = {}) => {
    const cleanParams = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const query = cleanParams ? `?${cleanParams}` : '';
    return request(`/api/issues${query}`);
  },

  getIssueById: (id) => request(`/api/issues/${id}`),

  createIssue: (issueData) =>
    request('/api/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    }),

  updateIssue: (id, updates) =>
    request(`/api/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteIssue: (id) =>
    request(`/api/issues/${id}`, {
      method: 'DELETE',
    }),

  getDashboard: () => request('/api/dashboard'),

  getInsights: () => request('/api/insights'),

  getActivity: (limit = 40) => request(`/api/activity?limit=${limit}`),
};
