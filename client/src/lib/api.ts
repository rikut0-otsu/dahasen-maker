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

export async function loginWithGoogleCredential(credential: string) {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ credential }),
  });

  const payload = await readJson<{ user: AuthUser }>(response);
  return payload.user;
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  await readJson<{ ok: true }>(response);
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
