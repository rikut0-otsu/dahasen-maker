import type { AuthUser } from "@/contexts/AuthContext";

let googleScriptPromise: Promise<void> | null = null;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  return window.atob(padded);
}

export function parseGoogleCredential(credential: string): AuthUser {
  const [, payload] = credential.split(".");
  if (!payload) {
    throw new Error("Invalid Google credential payload");
  }

  const parsed = JSON.parse(decodeBase64Url(payload)) as {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
  };

  if (!parsed.sub || !parsed.name || !parsed.email) {
    throw new Error("Incomplete Google profile");
  }

  return {
    id: parsed.sub,
    name: parsed.name,
    email: parsed.email,
    picture: parsed.picture,
  };
}

export function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}
