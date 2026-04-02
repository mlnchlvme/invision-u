const BASE_URL = import.meta.env.VITE_API_URL || 'https://aiscreeningplatform-production.up.railway.app';

function getToken() {
  return localStorage.getItem('access_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка сети' }));
    const msg = Array.isArray(err.detail) ? err.detail.map(d => d.msg).join('; ') : (err.detail || 'Ошибка');
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};
