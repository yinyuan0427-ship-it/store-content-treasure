import type { User } from '../mock/data';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
const TOKEN_KEY = 'sct-auth-token';

export type BootstrapPayload = {
  deliveryTasks?: unknown[];
  leads?: unknown[];
  dealReports?: unknown[];
  pointRecords?: unknown[];
  products?: unknown[];
  materials?: unknown[];
};

export function getAuthToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(apiUrl(path), { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP_${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loginWithApi(phone: string, password: string): Promise<{ token: string; user: User }> {
  const result = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
  setAuthToken(result.token);
  return result;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!getAuthToken()) return null;
  try {
    const result = await apiFetch<{ user: User }>('/api/auth/me');
    return result.user;
  } catch {
    clearAuthToken();
    return null;
  }
}

export async function loadBootstrap(): Promise<BootstrapPayload | null> {
  if (!getAuthToken()) return null;
  try {
    return await apiFetch<BootstrapPayload>('/api/bootstrap');
  } catch {
    return null;
  }
}

export function hydrateLocalCaches(payload: BootstrapPayload | null): void {
  if (!payload) return;
  if (Array.isArray(payload.deliveryTasks)) {
    localStorage.setItem('sct-delivery-tasks', JSON.stringify(payload.deliveryTasks));
  }
  if (Array.isArray(payload.leads)) {
    localStorage.setItem('sct-share-leads', JSON.stringify(payload.leads));
  }
  if (Array.isArray(payload.dealReports)) {
    localStorage.setItem('sct-deal-reports', JSON.stringify(payload.dealReports));
  }
  if (Array.isArray(payload.pointRecords)) {
    localStorage.setItem('sct-point-records', JSON.stringify(payload.pointRecords));
  }
}

export async function syncJson(path: string, payload: unknown, method = 'POST'): Promise<void> {
  try {
    await apiFetch(path, { method, body: JSON.stringify(payload) });
  } catch {
    // Existing localStorage behavior remains the offline/demo fallback.
  }
}
