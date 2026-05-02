const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function buildUrl(path) {
  if (path.startsWith('http')) return path
  if (API_BASE) return `${API_BASE}${path}`
  return path
}

export function getStoredToken() {
  return localStorage.getItem('gym_token') || ''
}

export async function apiRequest(path, options = {}) {
  const { token = getStoredToken(), headers = {}, ...rest } = options
  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const hasJson = contentType.includes('application/json')
  const data = hasJson ? await response.json() : null

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`
    throw new Error(message)
  }

  return data
}

export const api = {
  health: () => apiRequest('/api/health', { token: '' }),

  login: (email, password) => apiRequest('/api/auth/login', {
    method: 'POST',
    token: '',
    body: JSON.stringify({ email, password }),
  }),

  register: (name, email, password) => apiRequest('/api/auth/register', {
    method: 'POST',
    token: '',
    body: JSON.stringify({ name, email, password }),
  }),

  me: () => apiRequest('/api/me'),

  list: resource => apiRequest(`/api/${resource}`),
  create: (resource, payload) => apiRequest(`/api/${resource}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (resource, id, payload) => apiRequest(`/api/${resource}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (resource, id) => apiRequest(`/api/${resource}/${id}`, { method: 'DELETE' }),

  postPublicMessage: payload => apiRequest('/api/public/messages', {
    method: 'POST',
    token: '',
    body: JSON.stringify(payload),
  }),
}