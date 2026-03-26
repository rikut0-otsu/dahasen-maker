import type { AppEnv } from "./cloudflare";

export type AccessLevel = "user" | "admin" | "owner";

function parseEnvList(value?: string) {
  return new Set(
    (value ?? "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

export function isConfiguredOwner(env: AppEnv, input: { googleSub: string; email: string }) {
  const ownerGoogleSubs = parseEnvList(env.OWNER_GOOGLE_SUBS);
  const ownerEmails = parseEnvList(env.OWNER_EMAILS);

  return ownerGoogleSubs.has(input.googleSub) || ownerEmails.has(input.email);
}

export function isConfiguredAdmin(env: AppEnv, input: { googleSub: string; email: string }) {
  const adminGoogleSubs = parseEnvList(env.ADMIN_GOOGLE_SUBS);
  const adminEmails = parseEnvList(env.ADMIN_EMAILS);

  return adminGoogleSubs.has(input.googleSub) || adminEmails.has(input.email);
}

export function resolveAdminStatus(
  env: AppEnv,
  input: { googleSub: string; email: string; persistedIsAdmin?: number }
) {
  return (
    isConfiguredOwner(env, input) ||
    input.persistedIsAdmin === 1 ||
    isConfiguredAdmin(env, input)
  );
}

export function resolveAccessLevel(
  env: AppEnv,
  input: { googleSub: string; email: string; persistedIsAdmin?: number }
): AccessLevel {
  if (isConfiguredOwner(env, input)) {
    return "owner";
  }

  if (input.persistedIsAdmin === 1 || isConfiguredAdmin(env, input)) {
    return "admin";
  }

  return "user";
}
