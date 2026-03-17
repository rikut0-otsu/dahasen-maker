import type { D1Database } from "./cloudflare";

export interface DbUser {
  id: string;
  google_sub: string;
  email: string;
  email_verified: number;
  name: string;
  picture_url: string | null;
}

export async function findUserByGoogleSub(db: D1Database, googleSub: string) {
  return db
    .prepare(
      "SELECT id, google_sub, email, email_verified, name, picture_url FROM users WHERE google_sub = ?"
    )
    .bind(googleSub)
    .first<DbUser>();
}

export async function upsertUser(
  db: D1Database,
  input: {
    userId: string;
    googleSub: string;
    email: string;
    emailVerified: boolean;
    name: string;
    pictureUrl: string | null;
    now: number;
  }
) {
  await db
    .prepare(
      `INSERT INTO users (
        id,
        google_sub,
        email,
        email_verified,
        name,
        picture_url,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        email_verified = excluded.email_verified,
        name = excluded.name,
        picture_url = excluded.picture_url,
        updated_at = excluded.updated_at`
    )
    .bind(
      input.userId,
      input.googleSub,
      input.email,
      input.emailVerified ? 1 : 0,
      input.name,
      input.pictureUrl,
      input.now,
      input.now
    )
    .run();
}

export async function createSession(
  db: D1Database,
  input: {
    sessionId: string;
    userId: string;
    expiresAt: number;
    now: number;
  }
) {
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at, created_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      input.sessionId,
      input.userId,
      input.expiresAt,
      input.now,
      input.now
    )
    .run();
}

export async function getUserBySessionId(db: D1Database, sessionId: string) {
  return db
    .prepare(
      `SELECT
        users.id,
        users.google_sub,
        users.email,
        users.email_verified,
        users.name,
        users.picture_url
      FROM sessions
      INNER JOIN users ON users.id = sessions.user_id
      WHERE sessions.id = ?
        AND sessions.expires_at > ?`
    )
    .bind(sessionId, Date.now())
    .first<DbUser>();
}

export async function touchSession(
  db: D1Database,
  input: { sessionId: string; now: number; expiresAt: number }
) {
  await db
    .prepare(
      `UPDATE sessions
       SET last_seen_at = ?, expires_at = ?
       WHERE id = ?`
    )
    .bind(input.now, input.expiresAt, input.sessionId)
    .run();
}

export async function deleteSession(db: D1Database, sessionId: string) {
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}

export async function insertDiagnosisResult(
  db: D1Database,
  input: {
    id: string;
    userId: string;
    typeId: string;
    answersJson: string;
    indicatorScoresJson: string;
    axisResultJson: string;
    now: number;
  }
) {
  await db
    .prepare(
      `INSERT INTO diagnosis_results (
        id,
        user_id,
        type_id,
        answers_json,
        indicator_scores_json,
        axis_result_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.id,
      input.userId,
      input.typeId,
      input.answersJson,
      input.indicatorScoresJson,
      input.axisResultJson,
      input.now
    )
    .run();
}
