import type { AppContext } from "../_lib/cloudflare";
import { requireAuthenticatedUser } from "../_lib/auth";
import { getDiagnosisResultById, insertDiagnosisResult } from "../_lib/db";
import { errorResponse, json, readJson } from "../_lib/http";

interface DiagnosisResultPayload {
  resultId?: string;
  typeId?: string;
  answers?: unknown;
  indicatorScores?: unknown;
  axisResult?: unknown;
}

export async function onRequestPost(context: AppContext) {
  const auth = await requireAuthenticatedUser(context);
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await readJson<DiagnosisResultPayload>(context.request);
  if (
    (payload.resultId !== undefined && typeof payload.resultId !== "string") ||
    typeof payload.typeId !== "string" ||
    !Array.isArray(payload.answers) ||
    typeof payload.indicatorScores !== "object" ||
    payload.indicatorScores === null ||
    typeof payload.axisResult !== "object" ||
    payload.axisResult === null
  ) {
    return errorResponse(400, "診断結果の形式が不正です");
  }

  const resultId = payload.resultId ?? crypto.randomUUID();
  const now = Date.now();

  await insertDiagnosisResult(context.env.DB, {
    id: resultId,
    userId: auth.auth.user.id,
    typeId: payload.typeId,
    answersJson: JSON.stringify(payload.answers),
    indicatorScoresJson: JSON.stringify(payload.indicatorScores),
    axisResultJson: JSON.stringify(payload.axisResult),
    now,
  });

  const savedResult = await getDiagnosisResultById(context.env.DB, resultId);
  if (!savedResult || savedResult.user_id !== auth.auth.user.id) {
    return errorResponse(500, "診断結果の保存確認に失敗しました");
  }

  return json({ resultId });
}
