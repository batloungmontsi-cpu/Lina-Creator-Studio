const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'mila-studio-token';

export function getToken() {
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach the Creator API. Check that the backend is running and try again.');
  }

  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) clearToken();
    throw new Error(result.message || `The request failed (${response.status}).`);
  }
  return result;
}

export const api = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getCreator: () => request('/auth/me'),
  getPublishedContent: () => request('/contents?limit=50'),
  getAllContent: () => request('/contents/manage/all'),
  getDashboardStats: () => request('/dashboard/stats'),
  getContent: (id) => request(`/contents/${encodeURIComponent(id)}`),
  createContent: (content) => request('/contents', {
    method: 'POST',
    body: JSON.stringify(content),
  }),
  updateContent: (id, content) => request(`/contents/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(content),
  }),
  deleteContent: (id) => request(`/contents/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getContentComments: (id) => request(`/comments/${encodeURIComponent(id)}`),
  getAllComments: () => request('/comments/dashboard'),
  createComment: (comment) => request('/comments', {
    method: 'POST',
    body: JSON.stringify(comment),
  }),
  moderateComment: (id, status) => request(`/comments/${encodeURIComponent(id)}/moderation`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deleteComment: (id) => request(`/comments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getLike: (id, viewerId) => request(`/likes/${encodeURIComponent(id)}?viewerId=${encodeURIComponent(viewerId)}`),
  addLike: (contentId, viewerId) => request('/likes', {
    method: 'POST',
    body: JSON.stringify({ contentId, viewerId }),
  }),
  removeLike: (contentId, viewerId) => request(`/likes/${encodeURIComponent(contentId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ viewerId }),
  }),
};

export { API_BASE_URL };
