import type { D1Database } from "./cloudflare";

export interface DbUser {
  id: string;
  google_sub: string;
  email: string;
  email_verified: number;
  name: string;
  display_name: string | null;
  job_title: string | null;
  department: string | null;
  picture_url: string | null;
}

function isMissingColumnError(error: unknown) {
  return (
    error instanceof Error &&
    /no such column|has no column named/i.test(error.message)
  );
}

export async function findUserByGoogleSub(db: D1Database, googleSub: string) {
  try {
    return await db
      .prepare(
        "SELECT id, google_sub, email, email_verified, name, display_name, job_title, department, picture_url FROM users WHERE google_sub = ?"
      )
      .bind(googleSub)
      .first<DbUser>();
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    const legacyUser = await db
      .prepare(
        "SELECT id, google_sub, email, email_verified, name, picture_url FROM users WHERE google_sub = ?"
      )
      .bind(googleSub)
      .first<Omit<DbUser, "display_name" | "job_title" | "department">>();

    if (!legacyUser) {
      return null;
    }

    return {
      ...legacyUser,
      display_name: null,
      job_title: null,
      department: null,
    };
  }
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
  try {
    await db
      .prepare(
        `INSERT INTO users (
          id,
          google_sub,
          email,
          email_verified,
          name,
          display_name,
          picture_url,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(google_sub) DO UPDATE SET
          email = excluded.email,
          email_verified = excluded.email_verified,
          name = excluded.name,
          display_name = COALESCE(users.display_name, excluded.display_name),
          picture_url = excluded.picture_url,
          updated_at = excluded.updated_at`
      )
      .bind(
        input.userId,
        input.googleSub,
        input.email,
        input.emailVerified ? 1 : 0,
        input.name,
        input.name,
        input.pictureUrl,
        input.now,
        input.now
      )
      .run();
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

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
  try {
    return await db
      .prepare(
        `SELECT
          users.id,
          users.google_sub,
          users.email,
          users.email_verified,
          users.name,
          users.display_name,
          users.job_title,
          users.department,
          users.picture_url
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.id = ?
          AND sessions.expires_at > ?`
      )
      .bind(sessionId, Date.now())
      .first<DbUser>();
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    const legacyUser = await db
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
      .first<Omit<DbUser, "display_name" | "job_title" | "department">>();

    if (!legacyUser) {
      return null;
    }

    return {
      ...legacyUser,
      display_name: null,
      job_title: null,
      department: null,
    };
  }
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

export async function updateUserProfile(
  db: D1Database,
  input: {
    userId: string;
    displayName: string;
    jobTitle: string | null;
    department: string | null;
    now: number;
  }
) {
  try {
    await db
      .prepare(
        `UPDATE users
         SET display_name = ?,
             job_title = ?,
             department = ?,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(
        input.displayName,
        input.jobTitle,
        input.department,
        input.now,
        input.userId
      )
      .run();
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }
  }
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

export async function createOAuthState(
  db: D1Database,
  input: {
    state: string;
    nonce: string;
    codeVerifier: string;
    returnTo: string;
    expiresAt: number;
    now: number;
  }
) {
  await db
    .prepare(
      `INSERT INTO oauth_states (
        state,
        nonce,
        code_verifier,
        return_to,
        expires_at,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.state,
      input.nonce,
      input.codeVerifier,
      input.returnTo,
      input.expiresAt,
      input.now
    )
    .run();
}

export async function getOAuthState(db: D1Database, state: string) {
  return db
    .prepare(
      `SELECT state, nonce, code_verifier, return_to, expires_at
       FROM oauth_states
       WHERE state = ?
         AND expires_at > ?`
    )
    .bind(state, Date.now())
    .first<{
      state: string;
      nonce: string;
      code_verifier: string;
      return_to: string;
      expires_at: number;
    }>();
}

export async function deleteOAuthState(db: D1Database, state: string) {
  await db.prepare("DELETE FROM oauth_states WHERE state = ?").bind(state).run();
}
