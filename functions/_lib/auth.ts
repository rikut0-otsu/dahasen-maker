import { COOKIE_NAME } from "../../shared/const";
import { resolveAccessLevel } from "./admin";
import type { AppContext } from "./cloudflare";
import {
  createExpiredSessionCookie,
  createSessionCookie,
  getCookie,
  getSessionTtlMs,
} from "./cookies";
import {
  deleteSession,
  getLatestDiagnosisForUser,
  getUserBySessionId,
  touchSession,
} from "./db";
import { errorResponse } from "./http";

export async function readAuthenticatedUser(context: AppContext) {
  const sessionId = getCookie(context.request, COOKIE_NAME);
  if (!sessionId) {
    return null;
  }

  const user = await getUserBySessionId(context.env.DB, sessionId);
  if (!user) {
    return null;
  }

  const now = Date.now();
  const accessLevel = resolveAccessLevel(context.env, {
    googleSub: user.google_sub,
    email: user.email,
    persistedIsAdmin: user.is_admin,
  });
  context.waitUntil(
    touchSession(context.env.DB, {
      sessionId,
      now,
      expiresAt: now + getSessionTtlMs(),
    })
  );
  const latestDiagnosis = await getLatestDiagnosisForUser(context.env.DB, user.id);

  return {
    sessionId,
    accessLevel,
    user: {
      id: user.id,
      name: user.display_name ?? user.name,
      email: user.email,
      jobTitle: user.job_title,
      department: user.department,
      picture: user.picture_url,
      isAdmin: accessLevel !== "user",
      isOwner: accessLevel === "owner",
      latestDiagnosis: latestDiagnosis
        ? {
            typeId: latestDiagnosis.type_id,
            createdAt: latestDiagnosis.created_at,
          }
        : null,
    },
  };
}

export async function requireAuthenticatedUser(context: AppContext) {
  const auth = await readAuthenticatedUser(context);
  if (!auth) {
    return {
      ok: false as const,
      response: errorResponse(401, "ログインが必要です"),
    };
  }

  return {
    ok: true as const,
    auth,
  };
}

export async function requireAdminUser(context: AppContext) {
  const authResult = await requireAuthenticatedUser(context);
  if (!authResult.ok) {
    return authResult;
  }

  if (!authResult.auth.user.isAdmin) {
    return {
      ok: false as const,
      response: errorResponse(403, "管理者権限が必要です"),
    };
  }

  return authResult;
}

export function withSessionCookie(
  response: Response,
  sessionId: string,
  request: Request
) {
  const headers = new Headers(response.headers);
  headers.append("set-cookie", createSessionCookie(sessionId, request));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function clearSession(context: AppContext) {
  const sessionId = getCookie(context.request, COOKIE_NAME);
  if (sessionId) {
    await deleteSession(context.env.DB, sessionId);
  }

  return createExpiredSessionCookie(context.request);
}
