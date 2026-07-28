import { headers } from "next/headers";
import { safeHttpUrl } from "./utils";

/**
 * The absolute origin this deployment is served from.
 *
 * Canonical URLs, the sitemap, Open Graph URLs, and password-reset links are
 * all built from this. Deriving it from the request's `Host` header means
 * whoever can set that header decides where those URLs point — a
 * password-reset mail addressed to the real user, carrying a link to the
 * attacker's domain, is the sharp end of it.
 *
 * So a configured origin always wins. `NEXT_PUBLIC_SITE_ORIGIN` is the single
 * source of truth in any deployed environment; the Host fallback exists only
 * so `npm run dev` works on whatever port it happens to pick.
 */
export async function requestOrigin() {
  const configured = safeHttpUrl(process.env.NEXT_PUBLIC_SITE_ORIGIN);
  if (configured) return new URL(configured).origin;

  if (process.env.NODE_ENV === "production") {
    // Loud rather than quietly wrong: shipping without this set is a
    // misconfiguration, and the header it falls back to is caller-controlled.
    console.warn("NEXT_PUBLIC_SITE_ORIGIN is not set — falling back to the request Host header, which callers can forge.");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
