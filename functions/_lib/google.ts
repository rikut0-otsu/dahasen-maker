interface GoogleJwtHeader {
  alg?: string;
  kid?: string;
}

interface GoogleIdTokenPayload {
  aud?: string | string[];
  email?: string;
  email_verified?: boolean | string;
  exp?: number;
  iss?: string;
  name?: string;
  picture?: string;
  sub?: string;
}

interface GoogleJwkSet {
  keys: Array<JsonWebKey & { kid?: string }>;
}

let googleKeyCache:
  | {
      expiresAt: number;
      keys: Array<JsonWebKey & { kid?: string }>;
    }
  | undefined;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function decodeJson<T>(value: string) {
  const bytes = decodeBase64Url(value);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

async function getGoogleKeys() {
  if (googleKeyCache && googleKeyCache.expiresAt > Date.now()) {
    return googleKeyCache.keys;
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!response.ok) {
    throw new Error("Failed to load Google public keys");
  }

  const cacheControl = response.headers.get("cache-control") ?? "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 300;
  const payload = (await response.json()) as GoogleJwkSet;

  googleKeyCache = {
    keys: payload.keys,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
  };

  return payload.keys;
}

export async function verifyGoogleIdToken(
  credential: string,
  expectedAudience: string
) {
  const parts = credential.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed Google ID token");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson<GoogleJwtHeader>(encodedHeader);
  const payload = decodeJson<GoogleIdTokenPayload>(encodedPayload);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported Google token algorithm");
  }

  const keys = await getGoogleKeys();
  const jwk = keys.find(key => key.kid === header.kid);
  if (!jwk) {
    throw new Error("Google signing key not found");
  }

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const signingInput = new TextEncoder().encode(
    `${encodedHeader}.${encodedPayload}`
  );
  const signature = decodeBase64Url(encodedSignature);
  const isValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature,
    signingInput
  );

  if (!isValid) {
    throw new Error("Invalid Google token signature");
  }

  const validIssuer =
    payload.iss === "https://accounts.google.com" ||
    payload.iss === "accounts.google.com";
  if (!validIssuer) {
    throw new Error("Invalid Google token issuer");
  }

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(expectedAudience)) {
    throw new Error("Google token audience mismatch");
  }

  if (!payload.exp || payload.exp * 1000 <= Date.now()) {
    throw new Error("Google token expired");
  }

  if (!payload.sub || !payload.email || !payload.name) {
    throw new Error("Google token payload is incomplete");
  }

  return {
    googleSub: payload.sub,
    email: payload.email,
    emailVerified:
      payload.email_verified === true || payload.email_verified === "true",
    name: payload.name,
    picture: payload.picture ?? null,
  };
}
