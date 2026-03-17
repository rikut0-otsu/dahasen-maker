export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface AppEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
}

export interface AppContext<Env = AppEnv> {
  request: Request;
  env: Env;
  params: Record<string, string | undefined>;
  waitUntil(promise: Promise<unknown>): void;
  data: Record<string, unknown>;
}

export type AppHandler<Env = AppEnv> = (context: AppContext<Env>) => Response | Promise<Response>;
