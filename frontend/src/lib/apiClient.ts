/**
 * apiClient.ts
 * Replaces supabaseClients.ts — all backend calls go through here.
 * Authentication uses a JWT stored in localStorage.
 */

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

// ─── Session helpers ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'aicon_token';
const USER_KEY  = 'aicon_user';

export interface StoredUser {
  id: string;
  email: string;
  full_name: string;
}

export function saveSession(token: string, user: StoredUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as StoredUser; }
  catch { return null; }
}

export function isLoggedIn(): boolean {
  return !!getToken() && !!getCurrentUser();
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON bodies (not FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      detail = err.detail || err.message || detail;
    } catch {
      detail = (await res.text()) || detail;
    }
    throw new Error(detail);
  }

  // Return null for 204 No Content
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  async signup(email: string, password: string, fullName: string) {
    const data = await apiFetch<{ token: string; user: StoredUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    saveSession(data.token, data.user);
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiFetch<{ token: string; user: StoredUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveSession(data.token, data.user);
    return data;
  },

  signOut() {
    clearSession();
  },
};

// ─── File upload API ──────────────────────────────────────────────────────────

export const storageApi = {
  async uploadFile(file: File): Promise<{ id: string; original_name: string; stored_path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/upload-file', { method: 'POST', body: formData });
  },

  async deleteFile(fileId: string): Promise<void> {
    return apiFetch(`/upload-file/${fileId}`, { method: 'DELETE' });
  },
};

// ─── Reports API ──────────────────────────────────────────────────────────────

export interface ComplianceReport {
  id: string;
  file_name: string;
  project_name: string;
  industry: string;
  description: string;
  report: string;
  soc2_score: number | null;
  gdpr_score: number | null;
  hipaa_score: number | null;
  pci_score: number | null;
  critical_issues: number | null;
  moderate_issues: number | null;
  low_issues: number | null;
  recommendations: string;
  created_at: string;
}

export const reportsApi = {
  async getReports(): Promise<ComplianceReport[]> {
    return apiFetch('/reports');
  },
};
