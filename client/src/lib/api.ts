import type { Answer, AxisResult, IndicatorScores } from "@/hooks/useDiagnosis";
import type { AuthUser } from "@/contexts/AuthContext";

async function readJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }

  return payload as T;
}

export async function getCurrentUser() {
  const response = await fetch("/api/me", {
    credentials: "include",
  });

  const payload = await readJson<{ user: AuthUser | null }>(response);
  return payload.user;
}

export function startGoogleLogin(returnTo?: string) {
  const nextPath =
    returnTo && returnTo.startsWith("/") ? returnTo : window.location.pathname;
  const url = new URL("/api/auth/google/start", window.location.origin);
  url.searchParams.set("returnTo", nextPath);
  window.location.assign(url.toString());
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  await readJson<{ ok: true }>(response);
}

export async function updateCurrentUserProfile(input: {
  name: string;
  jobTitle: string;
  department: string;
}) {
  const response = await fetch("/api/me", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return readJson<{ user: AuthUser }>(response);
}

export async function saveDiagnosisResult(input: {
  typeId: string;
  answers: Answer[];
  indicatorScores: IndicatorScores;
  axisResult: AxisResult;
}) {
  const response = await fetch("/api/diagnosis-results", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return readJson<{ resultId: string }>(response);
}

export interface AdminUser {
  accessLevel?: "user" | "admin" | "owner";
  id: string;
  email: string;
  name: string;
  rawName: string;
  googleSub: string;
  jobTitle?: string | null;
  department?: string | null;
  picture?: string | null;
  isOwner?: boolean;
  isEnvAdmin?: boolean;
  isAdmin: boolean;
  latestDiagnosis?: {
    typeId: string;
    createdAt: number;
  } | null;
  createdAt: number;
  updatedAt: number;
}

export async function getAdminUsers() {
  const response = await fetch("/api/admin/users", {
    credentials: "include",
  });

  return readJson<{ users: AdminUser[] }>(response);
}

export async function updateAdminUser(input: { userId: string; isAdmin: boolean }) {
  const response = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return readJson<{ user: AdminUser }>(response);
}

export async function deleteAdminUser(input: { userId: string }) {
  const response = await fetch("/api/admin/users-delete", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return readJson<{ ok: true }>(response);
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalDiagnoses: number;
  activeUsers: number;
  adminCount: number;
  avgDiagnosesPerUser: number;
}

export interface AdminDashboardTrend {
  date: string;
  users: number;
  diagnoses: number;
}

export interface AdminDashboardType {
  typeId: string;
  count: number;
}

export interface AdminDashboardDepartment {
  department: string;
  count: number;
}

export async function getAdminDashboard() {
  const response = await fetch("/api/admin/dashboard", {
    credentials: "include",
  });

  return readJson<{
    summary: AdminDashboardSummary;
    trends: AdminDashboardTrend[];
    topTypes: AdminDashboardType[];
    topDepartments: AdminDashboardDepartment[];
  }>(response);
}
