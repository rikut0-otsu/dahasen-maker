import type { AppEnv } from "./cloudflare";

function parseEnvList(value?: string) {
  return new Set(
    (value ?? "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

export function isConfiguredAdmin(env: AppEnv, input: { googleSub: string; email: string }) {
  const adminGoogleSubs = parseEnvList(env.ADMIN_GOOGLE_SUBS);
  const adminEmails = parseEnvList(env.ADMIN_EMAILS);

  return adminGoogleSubs.has(input.googleSub) || adminEmails.has(input.email);
}
