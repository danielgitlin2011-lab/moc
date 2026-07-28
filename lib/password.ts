/**
 * Minimum password length, enforced at sign-up and at password reset.
 *
 * This is the floor the app enforces on its own. The controls that actually
 * matter — rejecting passwords found in known breaches, and rate-limiting
 * attempts — are Supabase Auth settings rather than application code; see the
 * security section of the README for what to turn on.
 */
export const MIN_PASSWORD_LENGTH = 8;
