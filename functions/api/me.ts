import type { AppContext } from "../_lib/cloudflare";
import { readAuthenticatedUser, requireAuthenticatedUser } from "../_lib/auth";
import { updateUserProfile } from "../_lib/db";
import { errorResponse, json, readJson } from "../_lib/http";

export async function onRequestGet(context: AppContext) {
  const auth = await readAuthenticatedUser(context);
  return json({
    user: auth?.user ?? null,
  });
}

export async function onRequestPatch(context: AppContext) {
  const authResult = await requireAuthenticatedUser(context);
  if (!authResult.ok) {
    return authResult.response;
  }

  const body = await readJson<{
    name?: string;
    jobTitle?: string;
    department?: string;
  }>(context.request);

  const name = body.name?.trim();
  const jobTitle = body.jobTitle?.trim() ?? "";
  const department = body.department?.trim() ?? "";

  if (!name) {
    return errorResponse(400, "名前を入力してください");
  }

  if (name.length > 50) {
    return errorResponse(400, "名前は50文字以内で入力してください");
  }

  if (jobTitle.length > 50) {
    return errorResponse(400, "職種は50文字以内で入力してください");
  }

  if (department.length > 50) {
    return errorResponse(400, "部署は50文字以内で入力してください");
  }

  await updateUserProfile(context.env.DB, {
    userId: authResult.auth.user.id,
    displayName: name,
    jobTitle: jobTitle || null,
    department: department || null,
    now: Date.now(),
  });

  return json({
    user: {
      ...authResult.auth.user,
      name,
      jobTitle: jobTitle || null,
      department: department || null,
    },
  });
}
