export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface AppEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  OWNER_GOOGLE_SUBS?: string;
  OWNER_EMAILS?: string;
  ADMIN_GOOGLE_SUBS?: string;
  ADMIN_EMAILS?: string;
}

export interface AppContext<Env = AppEnv> {
  request: Request;
  env: Env;
  params: Record<string, string | undefined>;
  waitUntil(promise: Promise<unknown>): void;
  data: Record<string, unknown>;
}

export type AppHandler<Env = AppEnv> = (context: AppContext<Env>) => Response | Promise<Response>;
