/**
 * apiClient.ts
 * Centralises all backend API calls.
 * Authentication is now handled by Supabase — we pull the JWT from the
 * active Supabase session instead of localStorage.
 */

import { supabase, STORAGE_BUCKET } from './supabaseClients';

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'https://aicon-0vso.onrender.com';

// ─── Convenience re-exports so existing pages keep working ───────────────────

export type StoredUser = {
  id: string;
  email: string;
  full_name: string;
};

/**
 * Returns the currently signed-in user from the Supabase session,
 * shaped like the old StoredUser so all existing pages keep working
 * without changes.
 */
export async function getCurrentUserAsync(): Promise<StoredUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? '',
    full_name: (user.user_metadata?.full_name as string) ?? '',
  };
}

/**
 * Synchronous shim — returns cached session user.
 * Use getCurrentUserAsync() when you need guaranteed freshness.
 */
export function getCurrentUser(): StoredUser | null {
  // supabase.auth.getUser() is async, so for sync callers we pull from
  // the in-memory session that supabase-js caches automatically.
  const session = (supabase as any).auth._session as any;
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    full_name: (session.user.user_metadata?.full_name as string) ?? '',
  };
}

export async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function isLoggedIn(): boolean {
  const session = (supabase as any).auth._session as any;
  return !!session?.access_token;
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Always get a fresh token from the active Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// ─── Auth API (delegates to Supabase Auth) ────────────────────────────────────

export const authApi = {
  async signup(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};

// ─── Storage API — uploads directly to Supabase Storage ──────────────────────

export const storageApi = {
  /**
   * Uploads a file to the Supabase Storage bucket and returns the storage path.
   * The backend /analyze-project endpoint uses this path to download and analyse the file.
   */
  async uploadFile(file: File): Promise<{ storagePath: string; fileName: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const ext = file.name.split('.').pop() ?? 'bin';
    const storagePath = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { upsert: false });

    if (error) throw new Error(`File upload failed: ${error.message}`);

    return { storagePath, fileName: file.name };
  },

  /**
   * Deletes a file from Supabase Storage.
   */
  async deleteFile(storagePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);
    if (error) throw new Error(`File delete failed: ${error.message}`);
  },

  /**
   * Returns a short-lived signed URL for private file access.
   */
  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);
    if (error) throw new Error(error.message);
    return data.signedUrl;
  },
};

// ─── Reports API — queries Supabase Postgres directly ────────────────────────

export interface ComplianceReport {
  id: string;
  file_name: string;
  storage_path: string;
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
  /**
   * Fetches the current user's compliance reports directly from Supabase Postgres.
   * RLS ensures users only see their own rows.
   */
  async getReports(): Promise<ComplianceReport[]> {
    const { data, error } = await supabase
      .from('compliance_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return (data ?? []) as ComplianceReport[];
  },

  /**
   * Deletes a report by ID. RLS ensures only the owner can delete.
   */
  async deleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('compliance_reports')
      .delete()
      .eq('id', reportId);
    if (error) throw new Error(error.message);
  },
};
