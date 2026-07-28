/**
 * Turns a Supabase Auth error into something a person can act on.
 *
 * Raw `error.message` was being rendered straight into the page. That leaks
 * implementation detail ("Database error querying schema", provider names,
 * internal rate-limiter wording), and none of it tells the person in front of
 * the form what to do next.
 *
 * Sign-in failures deliberately collapse to one message. Distinguishing "no
 * such account" from "wrong password" turns the login form into an oracle for
 * which email addresses are registered.
 */
const byCode: Record<string, string> = {
  invalid_credentials: "That email and password don't match. Please try again.",
  email_not_confirmed: "Please confirm your email address first — check your inbox for the link.",
  user_already_exists: "An account already exists for that email. Try logging in instead.",
  email_exists: "An account already exists for that email. Try logging in instead.",
  weak_password: "Please choose a stronger password — at least 8 characters.",
  over_email_send_rate_limit: "Too many emails just now. Please wait a few minutes and try again.",
  over_request_rate_limit: "Too many attempts. Please wait a few minutes and try again.",
  same_password: "Please choose a password you haven't used here before.",
  session_expired: "That link has expired. Please request a new one.",
  otp_expired: "That link has expired. Please request a new one.",
  validation_failed: "Please check the details you entered and try again.",
};

const byStatus: Record<number, string> = {
  400: "Please check the details you entered and try again.",
  422: "Please check the details you entered and try again.",
  429: "Too many attempts. Please wait a few minutes and try again.",
  500: "Something went wrong on our side. Please try again in a moment.",
  502: "Something went wrong on our side. Please try again in a moment.",
  503: "Something went wrong on our side. Please try again in a moment.",
};

export interface AuthErrorLike {
  code?: string;
  status?: number;
  message?: string;
}

export function authErrorMessage(error: AuthErrorLike | null | undefined, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;
  if (error.code && byCode[error.code]) return byCode[error.code];
  if (error.status && byStatus[error.status]) return byStatus[error.status];
  return fallback;
}

/** Sign-in never says which half was wrong. */
export function signInErrorMessage(error: AuthErrorLike | null | undefined): string {
  if (error?.code === "email_not_confirmed") return byCode.email_not_confirmed;
  if (error?.status === 429 || error?.code === "over_request_rate_limit") return byCode.over_request_rate_limit;
  return byCode.invalid_credentials;
}
