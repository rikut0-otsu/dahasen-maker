import type { AppContext } from "../../../_lib/cloudflare";
import {
  createExpiredOAuthStateCookie,
  getCookie,
  getSessionTtlMs,
  OAUTH_STATE_COOKIE_NAME,
} from "../../../_lib/cookies";
import {
  createSession,
  deleteOAuthState,
  findUserByGoogleSub,
  getOAuthState,
  upsertUser,
} from "../../../_lib/db";
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserInfo,
  validateGoogleIdToken,
} from "../../../_lib/google";
import { withSessionCookie } from "../../../_lib/auth";
import { json } from "../../../_lib/http";

function redirect(location: string, headers?: HeadersInit) {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      ...headers,
    },
  });
}

function appendLoginStatus(path: string, status: "success" | "error" | "expired") {
  const url = new URL(path, "https://dummy.local");
  url.searchParams.set("login", status);
  return `${url.pathname}${url.search}${url.hash}`;
}

export async function onRequestGet(context: AppContext) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const cookieState = getCookie(context.request, OAUTH_STATE_COOKIE_NAME);

  if (!code || !returnedState || !cookieState || returnedState !== cookieState) {
    return redirect(appendLoginStatus("/", "error"), {
      "set-cookie": createExpiredOAuthStateCookie(context.request),
    });
  }

  const oauthState = await getOAuthState(context.env.DB, returnedState);
  await deleteOAuthState(context.env.DB, returnedState);
  if (!oauthState) {
    return redirect(appendLoginStatus("/", "expired"), {
      "set-cookie": createExpiredOAuthStateCookie(context.request),
    });
  }

  try {
    const redirectUri = `${url.origin}/api/auth/google/callback`;
    const token = await exchangeGoogleAuthorizationCode({
      code,
      clientId: context.env.GOOGLE_CLIENT_ID,
      clientSecret: context.env.GOOGLE_CLIENT_SECRET,
      redirectUri,
      codeVerifier: oauthState.code_verifier,
    });
    const idPayload = validateGoogleIdToken({
      idToken: token.id_token!,
      clientId: context.env.GOOGLE_CLIENT_ID,
      nonce: oauthState.nonce,
    });
    const profile = await fetchGoogleUserInfo(token.access_token!);
    const googleSub = profile.sub;
    const email = profile.email;
    const name = profile.name;

    if (!googleSub || !email || !name) {
      throw new Error("Incomplete Google profile");
    }

    if (idPayload.sub !== googleSub) {
      throw new Error("Google subject mismatch");
    }

    const now = Date.now();
    const existingUser = await findUserByGoogleSub(context.env.DB, googleSub);
    const userId = existingUser?.id ?? crypto.randomUUID();

    await upsertUser(context.env.DB, {
      userId,
      googleSub,
      email,
      emailVerified: Boolean(profile.email_verified),
      name,
      pictureUrl: profile.picture ?? null,
      now,
    });

    const sessionId = crypto.randomUUID();
    await createSession(context.env.DB, {
      sessionId,
      userId,
      expiresAt: now + getSessionTtlMs(),
      now,
    });

    const response = withSessionCookie(json({ ok: true }), sessionId, context.request);
    const headers = new Headers(response.headers);
    headers.append("set-cookie", createExpiredOAuthStateCookie(context.request));
    headers.set("location", appendLoginStatus(oauthState.return_to, "success"));

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    console.error(error);
    return redirect(appendLoginStatus(oauthState.return_to, "error"), {
      "set-cookie": createExpiredOAuthStateCookie(context.request),
    });
  }
}
