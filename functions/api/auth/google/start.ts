import type { AppContext } from "../../../_lib/cloudflare";
import { createOAuthStateCookie } from "../../../_lib/cookies";
import { createOAuthState } from "../../../_lib/db";

function sanitizeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
}

async function sha256Base64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const chars = Array.from(new Uint8Array(digest), byte =>
    String.fromCharCode(byte)
  ).join("");

  return btoa(chars).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function onRequestGet(context: AppContext) {
  if (!context.env.GOOGLE_CLIENT_ID || !context.env.GOOGLE_CLIENT_SECRET) {
    return new Response("Google OAuth is not configured", { status: 500 });
  }

  const requestUrl = new URL(context.request.url);
  const origin = requestUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get("returnTo"));
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const now = Date.now();

  await createOAuthState(context.env.DB, {
    state,
    nonce,
    codeVerifier,
    returnTo,
    expiresAt: now + 10 * 60 * 1000,
    now,
  });

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", context.env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("nonce", nonce);
  googleUrl.searchParams.set("code_challenge", codeChallenge);
  googleUrl.searchParams.set("code_challenge_method", "S256");
  googleUrl.searchParams.set("prompt", "select_account");
  googleUrl.searchParams.set("hd", "cyberagent.co.jp");

  return new Response(null, {
    status: 302,
    headers: {
      location: googleUrl.toString(),
      "set-cookie": createOAuthStateCookie(state, context.request),
    },
  });
}
