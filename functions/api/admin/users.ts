import type { AppContext } from "../../_lib/cloudflare";
import { resolveAdminStatus } from "../../_lib/admin";
import { requireAdminUser } from "../../_lib/auth";
import { getAllUsers } from "../../_lib/db";
import { json } from "../../_lib/http";

export async function onRequestGet(context: AppContext) {
  const auth = await requireAdminUser(context);
  if (!auth.ok) {
    return auth.response;
  }

  const users = await getAllUsers(context.env.DB);

  return json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.display_name ?? user.name,
      rawName: user.name,
      googleSub: user.google_sub,
      jobTitle: user.job_title,
      department: user.department,
      picture: user.picture_url,
      isAdmin: resolveAdminStatus(context.env, {
        googleSub: user.google_sub,
        email: user.email,
        persistedIsAdmin: user.is_admin,
      }),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })),
  });
}
