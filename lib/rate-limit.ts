/**
 * A small fixed-window counter, kept in the process.
 *
 * This is the cheap first line in front of an API route: it costs no round
 * trip and stops the trivial loop. It is explicitly *not* the control — a
 * serverless deployment runs many instances and each keeps its own map, so a
 * determined caller gets one window per instance. The durable limits live in
 * Postgres, inside the security-definer functions that anon can reach directly
 * (see supabase/migrations). Treat this as noise reduction, not enforcement.
 */
export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the current window resets — for a Retry-After header. */
  retryAfter: number;
}

interface Window {
  count: number;
  resetAt: number;
}

export function createRateLimiter({ limit, windowMs, maxKeys = 5000 }: { limit: number; windowMs: number; maxKeys?: number }) {
  const windows = new Map<string, Window>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    const existing = windows.get(key);

    if (!existing || existing.resetAt <= now) {
      // Drop expired entries lazily, and hard-cap the map so a flood of unique
      // keys cannot grow it without bound.
      if (windows.size >= maxKeys) {
        for (const [candidate, window] of windows) {
          if (window.resetAt <= now) windows.delete(candidate);
        }
        if (windows.size >= maxKeys) windows.clear();
      }
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfter: 0 };
    }

    existing.count += 1;
    if (existing.count > limit) {
      return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
    }
    return { ok: true, retryAfter: 0 };
  };
}

/**
 * Best-effort client address.
 *
 * `x-forwarded-for` is only trustworthy behind a proxy that overwrites it,
 * which is the case on Vercel. The left-most entry is the original client.
 */
export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
