import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * The product renders text, links, and image URLs that business owners typed
 * into a dashboard, on pages served to the public. Escaping and URL validation
 * are the primary defences (`lib/json-ld.ts` and `safeHttpUrl` in
 * `lib/utils.ts`); this policy is the layer that limits the damage if one of
 * them is ever missed.
 *
 * `script-src` still needs `'unsafe-inline'`: Next streams the RSC payload
 * through inline `<script>` tags whose contents differ per request, so neither
 * a hash list nor a build-time nonce can cover them. Moving to a per-request
 * nonce means minting it in `proxy.ts` and letting Next stamp its own tags —
 * tracked in the README as the next hardening step. Everything that does not
 * need the escape hatch is closed: no plugins, no framing by third parties,
 * forms and base URLs pinned to this origin.
 */
function contentSecurityPolicy() {
  // Customer photography is uploaded to Supabase Storage and pasted from
  // arbitrary stock hosts, so `img-src` genuinely has to accept any https
  // origin. `data:` covers the generated social cards, `blob:` the local
  // preview shown while an upload is still in flight.
  const imgSrc = ["'self'", "data:", "blob:", "https:"];

  // Network calls only ever go to this origin and to the project's own
  // Supabase instance — which is known at build time.
  let supabaseOrigin = "";
  try {
    supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin;
  } catch {
    // Not configured at build time; the rest of the policy still applies.
  }
  const connectSrc = ["'self'", supabaseOrigin].filter(Boolean);

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    // Inline `style` attributes carry the per-business theme variables.
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Applied to every response. The generated catering sites are public marketing
 * pages, so the goal is to stop framing/sniffing attacks and referrer leakage
 * without blocking the customer photography they depend on.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // `preload` is required for inclusion in the browsers' preload list, which is
  // what protects the very first request to the domain.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Isolates the browsing context group, so a window this page opens — or that
  // opened it — cannot reach back through `window.opener`.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Analytics and uploads must never be cached by a CDN.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
