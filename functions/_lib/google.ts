interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface GoogleIdTokenPayload {
  aud?: string | string[];
  email?: string;
  email_verified?: boolean | string;
  exp?: number;
  iss?: string;
  name?: string;
  nonce?: string;
  picture?: string;
  sub?: string;
}

interface GoogleUserInfo {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function parseIdTokenPayload(idToken: string) {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed Google ID token");
  }

  const bytes = decodeBase64Url(parts[1]);
  return JSON.parse(new TextDecoder().decode(bytes)) as GoogleIdTokenPayload;
}

export async function exchangeGoogleAuthorizationCode(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  codeVerifier: string;
}) {
  const body = new URLSearchParams({
    code: input.code,
    client_id: input.clientId,
    client_secret: input.clientSecret,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
    code_verifier: input.codeVerifier,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || payload.error || !payload.access_token || !payload.id_token) {
    throw new Error(
      payload.error_description ?? payload.error ?? "Failed to exchange code"
    );
  }

  return payload;
}

export function validateGoogleIdToken(input: {
  idToken: string;
  clientId: string;
  nonce: string;
}) {
  const payload = parseIdTokenPayload(input.idToken);
  const validIssuer =
    payload.iss === "https://accounts.google.com" ||
    payload.iss === "accounts.google.com";
  if (!validIssuer) {
    throw new Error("Invalid Google token issuer");
  }

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(input.clientId)) {
    throw new Error("Google token audience mismatch");
  }

  if (payload.nonce !== input.nonce) {
    throw new Error("Google token nonce mismatch");
  }

  if (!payload.exp || payload.exp * 1000 <= Date.now()) {
    throw new Error("Google token expired");
  }

  return payload;
}

export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (await response.json()) as GoogleUserInfo;
  if (!response.ok || !payload.sub || !payload.email || !payload.name) {
    throw new Error("Failed to fetch Google user info");
  }

  return payload;
}
