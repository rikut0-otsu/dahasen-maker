import type { AppContext } from "../../_lib/cloudflare";
import { clearSession } from "../../_lib/auth";
import { json } from "../../_lib/http";

export async function onRequestPost(context: AppContext) {
  const cookie = await clearSession(context);
  const response = json({ ok: true });
  const headers = new Headers(response.headers);
  headers.append("set-cookie", cookie);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
