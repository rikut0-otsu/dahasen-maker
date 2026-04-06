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
  join_year: number | null;
  picture_url: string | null;
  is_admin: number;
  created_at?: number;
  updated_at?: number;
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
        "SELECT id, google_sub, email, email_verified, name, display_name, job_title, department, join_year, picture_url, is_admin FROM users WHERE google_sub = ?"
      )
      .bind(googleSub)
      .first<DbUser>();
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    try {
      const userWithoutJoinYear = await db
        .prepare(
          "SELECT id, google_sub, email, email_verified, name, display_name, job_title, department, picture_url, is_admin FROM users WHERE google_sub = ?"
        )
        .bind(googleSub)
        .first<Omit<DbUser, "join_year">>();

      if (!userWithoutJoinYear) {
        return null;
      }

      return {
        ...userWithoutJoinYear,
        join_year: null,
      };
    } catch (fallbackError) {
      if (!isMissingColumnError(fallbackError)) {
        throw fallbackError;
      }
    }

    const legacyUser = await db
      .prepare(
        "SELECT id, google_sub, email, email_verified, name, picture_url FROM users WHERE google_sub = ?"
      )
      .bind(googleSub)
      .first<Omit<DbUser, "display_name" | "job_title" | "department" | "join_year" | "is_admin">>();

    if (!legacyUser) {
      return null;
    }

    return {
      ...legacyUser,
      display_name: null,
      job_title: null,
      department: null,
      join_year: null,
      is_admin: 0,
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
    isAdmin: boolean;
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
          is_admin,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(google_sub) DO UPDATE SET
          email = excluded.email,
          email_verified = excluded.email_verified,
          name = excluded.name,
          display_name = COALESCE(users.display_name, excluded.display_name),
          picture_url = excluded.picture_url,
          is_admin = excluded.is_admin,
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
        input.isAdmin ? 1 : 0,
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
          users.join_year,
          users.picture_url,
          users.is_admin
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

    try {
      const userWithoutJoinYear = await db
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
            users.picture_url,
            users.is_admin
          FROM sessions
          INNER JOIN users ON users.id = sessions.user_id
          WHERE sessions.id = ?
            AND sessions.expires_at > ?`
        )
        .bind(sessionId, Date.now())
        .first<Omit<DbUser, "join_year">>();

      if (!userWithoutJoinYear) {
        return null;
      }

      return {
        ...userWithoutJoinYear,
        join_year: null,
      };
    } catch (fallbackError) {
      if (!isMissingColumnError(fallbackError)) {
        throw fallbackError;
      }
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
      .first<Omit<DbUser, "display_name" | "job_title" | "department" | "join_year" | "is_admin">>();

    if (!legacyUser) {
      return null;
    }

    return {
      ...legacyUser,
      display_name: null,
      job_title: null,
      department: null,
      join_year: null,
      is_admin: 0,
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
    joinYear: number | null;
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
             join_year = ?,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(
        input.displayName,
        input.jobTitle,
        input.department,
        input.joinYear,
        input.now,
        input.userId
      )
      .run();
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    throw new Error("JOIN_YEAR_COLUMN_MISSING");
  }
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  display_name: string | null;
  job_title: string | null;
  department: string | null;
  join_year: number | null;
  picture_url: string | null;
  google_sub: string;
  is_admin: number;
  created_at: number;
  updated_at: number;
}

export async function getAllUsers(db: D1Database) {
  try {
    const result = await db
      .prepare(
        `SELECT
          id,
          email,
          name,
          display_name,
          job_title,
          department,
          join_year,
          picture_url,
          google_sub,
          is_admin,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC, updated_at DESC`
      )
      .all<AdminUserSummary>();

    return result.results;
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    try {
      const resultWithoutJoinYear = await db
        .prepare(
          `SELECT
            id,
            email,
            name,
            display_name,
            job_title,
            department,
            picture_url,
            google_sub,
            is_admin,
            created_at,
            updated_at
          FROM users
          ORDER BY created_at DESC, updated_at DESC`
        )
        .all<Omit<AdminUserSummary, "join_year">>();

      return resultWithoutJoinYear.results.map((user) => ({
        ...user,
        join_year: null,
      }));
    } catch (fallbackError) {
      if (!isMissingColumnError(fallbackError)) {
        throw fallbackError;
      }
    }

    const legacyResult = await db
      .prepare(
        `SELECT
          id,
          email,
          name,
          picture_url,
          google_sub,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC, updated_at DESC`
      )
      .all<Omit<AdminUserSummary, "is_admin" | "join_year">>();

    return legacyResult.results.map((user) => ({
      ...user,
      display_name: null,
      job_title: null,
      department: null,
      join_year: null,
      is_admin: 0,
    }));
  }
}

export async function updateUserAdminStatus(
  db: D1Database,
  input: { userId: string; isAdmin: boolean; now: number }
) {
  try {
    await db
      .prepare(
        `UPDATE users
         SET is_admin = ?,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(input.isAdmin ? 1 : 0, input.now, input.userId)
      .run();
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    throw new Error("ADMIN_COLUMN_MISSING");
  }
}

export async function deleteUserCascade(
  db: D1Database,
  input: { userId: string }
) {
  await db
    .prepare("DELETE FROM sessions WHERE user_id = ?")
    .bind(input.userId)
    .run();

  await db
    .prepare("DELETE FROM diagnosis_results WHERE user_id = ?")
    .bind(input.userId)
    .run();

  await db
    .prepare("DELETE FROM users WHERE id = ?")
    .bind(input.userId)
    .run();
}

export interface DashboardUserRecord {
  id: string;
  email: string;
  name: string;
  display_name: string | null;
  department: string | null;
  job_title: string | null;
  join_year: number | null;
  google_sub: string;
  is_admin: number;
  created_at: number;
}

export interface DashboardDiagnosisRecord {
  id: string;
  user_id: string;
  type_id: string;
  created_at: number;
}

export interface LatestDiagnosisRecord {
  user_id: string;
  type_id: string;
  created_at: number;
}

export interface DiagnosisResultRecord extends LatestDiagnosisRecord {
  id: string;
}

const USER_ID_QUERY_BATCH_SIZE = 100;

function chunkValues<T>(values: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

export async function getDashboardUsers(db: D1Database) {
  try {
    const result = await db
      .prepare(
        `SELECT
          id,
          email,
          name,
          display_name,
          department,
          job_title,
          join_year,
          google_sub,
          is_admin,
          created_at
        FROM users
        ORDER BY created_at DESC`
      )
      .all<DashboardUserRecord>();

    return result.results;
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    try {
      const resultWithoutJoinYear = await db
        .prepare(
          `SELECT
            id,
            email,
            name,
            display_name,
            department,
            job_title,
            google_sub,
            is_admin,
            created_at
          FROM users
          ORDER BY created_at DESC`
        )
        .all<Omit<DashboardUserRecord, "join_year">>();

      return resultWithoutJoinYear.results.map((user) => ({
        ...user,
        join_year: null,
      }));
    } catch (fallbackError) {
      if (!isMissingColumnError(fallbackError)) {
        throw fallbackError;
      }
    }

    const legacyResult = await db
      .prepare(
        `SELECT
          id,
          email,
          name,
          google_sub,
          created_at
        FROM users
        ORDER BY created_at DESC`
      )
      .all<Omit<DashboardUserRecord, "is_admin" | "join_year">>();

    return legacyResult.results.map((user) => ({
      ...user,
      display_name: null,
      department: null,
      job_title: null,
      join_year: null,
      is_admin: 0,
    }));
  }
}

export async function getDashboardDiagnoses(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT
        id,
        user_id,
        type_id,
        created_at
      FROM diagnosis_results
      ORDER BY created_at DESC`
    )
    .all<DashboardDiagnosisRecord>();

  return result.results;
}

export async function getLatestDiagnosisForUser(
  db: D1Database,
  userId: string
) {
  return db
    .prepare(
      `SELECT
        user_id,
        type_id,
        created_at
      FROM diagnosis_results
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1`
    )
    .bind(userId)
    .first<LatestDiagnosisRecord>();
}

export async function getLatestDiagnosesForUsers(
  db: D1Database,
  userIds: string[]
) {
  if (userIds.length === 0) {
    return new Map<string, LatestDiagnosisRecord>();
  }

  const latestByUserId = new Map<string, LatestDiagnosisRecord>();
  for (const userIdBatch of chunkValues(userIds, USER_ID_QUERY_BATCH_SIZE)) {
    const placeholders = userIdBatch.map(() => "?").join(", ");
    const result = await db
      .prepare(
        `SELECT
          user_id,
          type_id,
          created_at
        FROM diagnosis_results
        WHERE user_id IN (${placeholders})
        ORDER BY created_at DESC`
      )
      .bind(...userIdBatch)
      .all<LatestDiagnosisRecord>();

    for (const row of result.results) {
      if (!latestByUserId.has(row.user_id)) {
        latestByUserId.set(row.user_id, row);
      }
    }
  }

  return latestByUserId;
}

export async function getDiagnosisHistoryForUsers(
  db: D1Database,
  userIds: string[]
) {
  if (userIds.length === 0) {
    return new Map<string, LatestDiagnosisRecord[]>();
  }

  const historyByUserId = new Map<string, LatestDiagnosisRecord[]>();
  for (const userIdBatch of chunkValues(userIds, USER_ID_QUERY_BATCH_SIZE)) {
    const placeholders = userIdBatch.map(() => "?").join(", ");
    const result = await db
      .prepare(
        `SELECT
          user_id,
          type_id,
          created_at
        FROM diagnosis_results
        WHERE user_id IN (${placeholders})
        ORDER BY created_at DESC`
      )
      .bind(...userIdBatch)
      .all<LatestDiagnosisRecord>();

    for (const row of result.results) {
      const current = historyByUserId.get(row.user_id) ?? [];
      current.push(row);
      historyByUserId.set(row.user_id, current);
    }
  }

  return historyByUserId;
}

export async function getDiagnosisResultById(
  db: D1Database,
  resultId: string
) {
  return db
    .prepare(
      `SELECT
        id,
        user_id,
        type_id,
        created_at
      FROM diagnosis_results
      WHERE id = ?
      LIMIT 1`
    )
    .bind(resultId)
    .first<DiagnosisResultRecord>();
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
      `INSERT OR IGNORE INTO diagnosis_results (
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
