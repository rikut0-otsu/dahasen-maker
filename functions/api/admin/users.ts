import type { AppContext } from "../../_lib/cloudflare";
import { resolveAdminStatus } from "../../_lib/admin";
import { requireAdminUser } from "../../_lib/auth";
import { getAllUsers, updateUserAdminStatus } from "../../_lib/db";
import { errorResponse, json, readJson } from "../../_lib/http";

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
      isEnvAdmin: resolveAdminStatus(context.env, {
        googleSub: user.google_sub,
        email: user.email,
      }),
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

export async function onRequestPatch(context: AppContext) {
  const auth = await requireAdminUser(context);
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJson<{ userId?: string; isAdmin?: boolean }>(context.request);
  if (typeof body.userId !== "string" || typeof body.isAdmin !== "boolean") {
    return errorResponse(400, "更新内容が不正です");
  }

  if (body.userId === auth.auth.user.id && !body.isAdmin) {
    return errorResponse(400, "自分自身の管理者権限は外せません");
  }

  try {
    await updateUserAdminStatus(context.env.DB, {
      userId: body.userId,
      isAdmin: body.isAdmin,
      now: Date.now(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_COLUMN_MISSING") {
      return errorResponse(
        400,
        "管理者付与には users.is_admin 列が必要です。D1 マイグレーションを適用してください。"
      );
    }

    throw error;
  }

  const users = await getAllUsers(context.env.DB);
  const updatedUser = users.find((user) => user.id === body.userId);
  if (!updatedUser) {
    return errorResponse(404, "対象ユーザーが見つかりません");
  }

  return json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.display_name ?? updatedUser.name,
      rawName: updatedUser.name,
      googleSub: updatedUser.google_sub,
      jobTitle: updatedUser.job_title,
      department: updatedUser.department,
      picture: updatedUser.picture_url,
      isEnvAdmin: resolveAdminStatus(context.env, {
        googleSub: updatedUser.google_sub,
        email: updatedUser.email,
      }),
      isAdmin: resolveAdminStatus(context.env, {
        googleSub: updatedUser.google_sub,
        email: updatedUser.email,
        persistedIsAdmin: updatedUser.is_admin,
      }),
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    },
  });
}
