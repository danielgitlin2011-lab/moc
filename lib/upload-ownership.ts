/**
 * Ownership and path helpers for uploaded images in Supabase Storage.
 *
 * Deletion and replacement are driven by a URL the client supplies, so without
 * a check one account could hand us another account's image URL and have it
 * deleted. Every upload is keyed `<user-id>/<uuid>.<ext>` inside the public
 * `images` bucket, which makes the path prefix the ownership test.
 *
 * Deliberately strict: the URL must sit on this project's own Supabase origin
 * (protocol, host, and port all have to match the configured
 * NEXT_PUBLIC_SUPABASE_URL), and the path must begin with this user's id
 * followed by a separator — so `<id>-other/…` or a lookalike host cannot pass.
 */

const PUBLIC_PREFIX = "/storage/v1/object/public/images/";

function storageOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin;
  } catch {
    return "";
  }
}

export function ownsUploadUrl(url: string, userId: string): boolean {
  const origin = storageOrigin();
  if (!url || !userId || !origin) return false;
  try {
    const parsed = new URL(url);
    if (parsed.origin !== origin) return false;
    return parsed.pathname.startsWith(`${PUBLIC_PREFIX}${userId}/`);
  } catch {
    return false;
  }
}

/** The bucket-relative path (`<user-id>/<file>`) behind a public image URL. */
export function uploadPathFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    return pathname.startsWith(PUBLIC_PREFIX) ? pathname.slice(PUBLIC_PREFIX.length) : "";
  } catch {
    return "";
  }
}
