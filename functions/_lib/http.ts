export function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export async function readJson<T>(request: Request) {
  return (await request.json()) as T;
}

export function errorResponse(status: number, message: string) {
  return json({ error: message }, { status });
}
