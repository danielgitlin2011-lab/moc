/**
 * True only for a Blob URL inside this user's own namespace.
 *
 * Deletion is driven by a URL the client supplies, so without this check one
 * account could hand us another account's image URL and have it deleted. Every
 * upload is keyed `<user-id>/<uuid>.<ext>`, which makes the path prefix the
 * ownership test.
 *
 * Deliberately strict: https only, a real Vercel Blob host, and a path that
 * begins with this user's id followed by a separator — so `<id>-other/…` or a
 * lookalike host cannot pass.
 */
export function ownsBlobUrl(url: string, userId: string): boolean {
  if (!url || !userId) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return false;
    return parsed.pathname.startsWith(`/${userId}/`);
  } catch {
    return false;
  }
}
