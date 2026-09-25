const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

// In-memory access token storage (Never written to localStorage/sessionStorage/cookies)
let inMemoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

async function performTokenRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Automatically sends HttpOnly refreshToken cookie
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent('saas:auth-failure'));
      return null;
    }

    const data = await res.json();
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      window.dispatchEvent(new CustomEvent('saas:token-refreshed', { detail: { token: data.accessToken } }));
      return data.accessToken;
    }

    setAccessToken(null);
    window.dispatchEvent(new CustomEvent('saas:auth-failure'));
    return null;
  } catch {
    setAccessToken(null);
    window.dispatchEvent(new CustomEvent('saas:auth-failure'));
    return null;
  } finally {
    refreshPromise = null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Ensure HttpOnly cookies are transmitted
  });

  // Automatic 401 Single-Flight Refresh Interception
  if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
    if (!refreshPromise) {
      refreshPromise = performTokenRefresh();
    }
    const newToken = await refreshPromise;
    if (newToken) {
      return request<T>(endpoint, options, true);
    }
  }

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // response is not JSON
    }

    const message =
      errorData.message || (Array.isArray(errorData.messages) ? errorData.messages.join(', ') : 'Request failed');

    // If account was suspended, trigger global suspension handler
    if (response.status === 403 && (errorData.code === 'ACCOUNT_SUSPENDED' || message.includes('suspended'))) {
      window.dispatchEvent(new CustomEvent('saas:account-suspended', { detail: { message } }));
    }

    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
