import { COOKIE_NAME } from "../../shared/const";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const OAUTH_STATE_COOKIE_NAME = "google_oauth_state";

export function getCookie(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) {
    return null;
  }

  const pairs = header.split(/;\s*/);
  for (const pair of pairs) {
    const separator = pair.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = pair.slice(0, separator);
    if (key !== name) {
      continue;
    }

    return decodeURIComponent(pair.slice(separator + 1));
  }

  return null;
}

function buildCookie(value: string, request: Request, maxAge: number) {
  const url = new URL(request.url);
  const secure = url.protocol === "https:" ? "; Secure" : "";

  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function createSessionCookie(sessionId: string, request: Request) {
  return buildCookie(sessionId, request, SESSION_MAX_AGE_SECONDS);
}

export function createExpiredSessionCookie(request: Request) {
  return buildCookie("", request, 0);
}

export function createOAuthStateCookie(state: string, request: Request) {
  return buildCookieForName(OAUTH_STATE_COOKIE_NAME, state, request, 60 * 10);
}

export function createExpiredOAuthStateCookie(request: Request) {
  return buildCookieForName(OAUTH_STATE_COOKIE_NAME, "", request, 0);
}

export function getSessionTtlMs() {
  return SESSION_MAX_AGE_SECONDS * 1000;
}

function buildCookieForName(
  name: string,
  value: string,
  request: Request,
  maxAge: number
) {
  const url = new URL(request.url);
  const secure = url.protocol === "https:" ? "; Secure" : "";

  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
