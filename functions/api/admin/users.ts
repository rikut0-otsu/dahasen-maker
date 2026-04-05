import type { AppContext } from "../../_lib/cloudflare";
import { resolveAccessLevel, resolveAdminStatus } from "../../_lib/admin";
import { requireAdminUser } from "../../_lib/auth";
import {
  getAllUsers,
  getDiagnosisHistoryForUsers,
  getLatestDiagnosesForUsers,
  updateUserAdminStatus,
} from "../../_lib/db";
import { errorResponse, json, readJson } from "../../_lib/http";

function buildAdminUserPayload(
  user: Awaited<ReturnType<typeof getAllUsers>>[number],
  context: AppContext,
  latestDiagnoses: Map<string, { type_id: string; created_at: number }>,
  diagnosisHistory: Map<string, Array<{ type_id: string; created_at: number }>>
) {
  const latestDiagnosis = latestDiagnoses.get(user.id);
  const history = diagnosisHistory.get(user.id) ?? [];

  return {
    accessLevel: resolveAccessLevel(context.env, {
      googleSub: user.google_sub,
      email: user.email,
      persistedIsAdmin: user.is_admin,
    }),
    id: user.id,
    email: user.email,
    name: user.display_name ?? user.name,
    rawName: user.name,
    googleSub: user.google_sub,
    jobTitle: user.job_title,
    department: user.department,
    joinYear: user.join_year,
    picture: user.picture_url,
    isOwner:
      resolveAccessLevel(context.env, {
        googleSub: user.google_sub,
        email: user.email,
        persistedIsAdmin: user.is_admin,
      }) === "owner",
    isEnvAdmin: resolveAdminStatus(context.env, {
      googleSub: user.google_sub,
      email: user.email,
    }),
    isAdmin: resolveAdminStatus(context.env, {
      googleSub: user.google_sub,
      email: user.email,
      persistedIsAdmin: user.is_admin,
    }),
    latestDiagnosis: latestDiagnosis
      ? {
          typeId: latestDiagnosis.type_id,
          createdAt: latestDiagnosis.created_at,
        }
      : null,
    diagnosisHistory: history.map((item) => ({
      typeId: item.type_id,
      createdAt: item.created_at,
    })),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function onRequestGet(context: AppContext) {
  const auth = await requireAdminUser(context);
  if (!auth.ok) {
    return auth.response;
  }

  const users = await getAllUsers(context.env.DB);
  const userIds = users.map((user) => user.id);
  const [latestDiagnoses, diagnosisHistory] = await Promise.all([
    getLatestDiagnosesForUsers(context.env.DB, userIds),
    getDiagnosisHistoryForUsers(context.env.DB, userIds),
  ]);

  return json({
    users: users.map((user) =>
      buildAdminUserPayload(user, context, latestDiagnoses, diagnosisHistory)
    ),
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

  const users = await getAllUsers(context.env.DB);
  const actor = users.find((user) => user.id === auth.auth.user.id);
  const targetUser = users.find((user) => user.id === body.userId);

  if (!actor) {
    return errorResponse(404, "操作ユーザーが見つかりません");
  }

  if (!targetUser) {
    return errorResponse(404, "対象ユーザーが見つかりません");
  }

  const targetAccessLevel = resolveAccessLevel(context.env, {
    googleSub: targetUser.google_sub,
    email: targetUser.email,
    persistedIsAdmin: targetUser.is_admin,
  });

  if (targetAccessLevel === "owner") {
    return errorResponse(403, "オーナー権限は画面から変更できません");
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

  const refreshedUsers = await getAllUsers(context.env.DB);
  const updatedUser = refreshedUsers.find((user) => user.id === body.userId);
  if (!updatedUser) {
    return errorResponse(404, "対象ユーザーが見つかりません");
  }
  const [latestDiagnoses, diagnosisHistory] = await Promise.all([
    getLatestDiagnosesForUsers(context.env.DB, [body.userId]),
    getDiagnosisHistoryForUsers(context.env.DB, [body.userId]),
  ]);

  return json({
    user: buildAdminUserPayload(updatedUser, context, latestDiagnoses, diagnosisHistory),
  });
}
