import type { AppContext } from "../_lib/cloudflare";
import { readAuthenticatedUser } from "../_lib/auth";
import { json } from "../_lib/http";

export async function onRequestGet(context: AppContext) {
  const auth = await readAuthenticatedUser(context);
  return json({
    user: auth?.user ?? null,
  });
}
