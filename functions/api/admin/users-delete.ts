import type { AppContext } from "../../_lib/cloudflare";
import { resolveAccessLevel } from "../../_lib/admin";
import { requireAdminUser } from "../../_lib/auth";
import { deleteUserCascade, getAllUsers } from "../../_lib/db";
import { errorResponse, json, readJson } from "../../_lib/http";

export async function onRequestPost(context: AppContext) {
  const auth = await requireAdminUser(context);
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJson<{ userId?: string }>(context.request);
  if (typeof body.userId !== "string") {
    return errorResponse(400, "削除対象が不正です");
  }

  if (body.userId === auth.auth.user.id) {
    return errorResponse(400, "自分自身は削除できません");
  }

  const users = await getAllUsers(context.env.DB);
  const targetUser = users.find((user) => user.id === body.userId);
  if (!targetUser) {
    return errorResponse(404, "対象ユーザーが見つかりません");
  }

  const targetAccessLevel = resolveAccessLevel(context.env, {
    googleSub: targetUser.google_sub,
    email: targetUser.email,
    persistedIsAdmin: targetUser.is_admin,
  });

  if (targetAccessLevel === "owner") {
    return errorResponse(403, "オーナーは削除できません");
  }

  await deleteUserCascade(context.env.DB, {
    userId: body.userId,
  });

  return json({ ok: true });
}
