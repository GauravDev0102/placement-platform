const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function refreshSession(): Promise<boolean> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return true;
  } catch {
    return false;
  }
}

async function fetchApi<T = any>(path: string, options: FetchOptions = {}, isRetry = false): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  // access token expired → refresh silently once, then retry
  if (res.status === 401 && !isRetry && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const newToken = localStorage.getItem('accessToken') || undefined;
      return fetchApi<T>(path, { ...options, token: newToken }, true);
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T = any>(path: string, token?: string) =>
    fetchApi<T>(path, { method: 'GET', token }),

  post: <T = any>(path: string, body?: any, token?: string) =>
    fetchApi<T>(path, { method: 'POST', body: JSON.stringify(body), token }),

  patch: <T = any>(path: string, body?: any, token?: string) =>
    fetchApi<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),

  delete: <T = any>(path: string, token?: string) =>
    fetchApi<T>(path, { method: 'DELETE', token }),
};
