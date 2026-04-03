export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const MIN_JOIN_YEAR = 1999;
export const JOIN_YEAR_FUTURE_BUFFER = 5;

export function getMaxJoinYear() {
  return new Date().getFullYear() + JOIN_YEAR_FUTURE_BUFFER;
}
