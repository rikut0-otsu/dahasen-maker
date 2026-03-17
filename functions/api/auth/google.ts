import type { AppContext } from "../../_lib/cloudflare";
import { createSession, findUserByGoogleSub, upsertUser } from "../../_lib/db";
import { verifyGoogleIdToken } from "../../_lib/google";
import { errorResponse, json, readJson } from "../../_lib/http";
import { getSessionTtlMs } from "../../_lib/cookies";
import { withSessionCookie } from "../../_lib/auth";

export async function onRequestPost(context: AppContext) {
  const { credential } = await readJson<{ credential?: string }>(context.request);
  if (!credential) {
    return errorResponse(400, "Google credential がありません");
  }

  if (!context.env.GOOGLE_CLIENT_ID) {
    return errorResponse(500, "GOOGLE_CLIENT_ID が未設定です");
  }

  try {
    const profile = await verifyGoogleIdToken(
      credential,
      context.env.GOOGLE_CLIENT_ID
    );
    const now = Date.now();
    const existingUser = await findUserByGoogleSub(context.env.DB, profile.googleSub);
    const userId = existingUser?.id ?? crypto.randomUUID();

    await upsertUser(context.env.DB, {
      userId,
      googleSub: profile.googleSub,
      email: profile.email,
      emailVerified: profile.emailVerified,
      name: profile.name,
      pictureUrl: profile.picture,
      now,
    });

    const sessionId = crypto.randomUUID();
    await createSession(context.env.DB, {
      sessionId,
      userId,
      expiresAt: now + getSessionTtlMs(),
      now,
    });

    return withSessionCookie(
      json({
        user: {
          id: userId,
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        },
      }),
      sessionId,
      context.request
    );
  } catch (error) {
    console.error(error);
    return errorResponse(401, "Googleトークンを検証できませんでした");
  }
}
