import { ImageResponse } from "next/og";
import { getPublicBusinessBySlug } from "@/lib/supabase/get-public-business";
import { sizedImage } from "@/lib/utils";

export const alt = "Catering website preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Fetches the hero photo as a data URL.
 *
 * The card is composed by the image renderer, which cannot stream a remote
 * image lazily — a slow or dead photo host would hang or fail the whole
 * response. Fetching it here, with a deadline, keeps the failure mode to
 * "card without a photo" instead of "no card at all".
 */
async function heroDataUrl(url: string) {
  if (!url) return null;
  try {
    const response = await fetch(sizedImage(url, 1200), { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * The social card for a published catering site: the customer's own hero
 * photograph, name, tagline, and palette — so a shared link looks like their
 * business rather than a bare URL or a cropped stock photo.
 */
export default async function OpenGraphImage({ params }: { params: Promise<{ businessSlug: string }> }) {
  const { businessSlug } = await params;
  const bundle = await getPublicBusinessBySlug(businessSlug);

  const business = bundle?.state.business;
  const theme = bundle?.state.theme;
  const primary = theme?.primary || "#233a31";
  const accent = theme?.accent || "#c79d59";
  const name = business?.name || "ServeSite";
  const tagline = business?.tagline || business?.description || "Catering for gatherings worth remembering.";
  const hero = await heroDataUrl(theme?.heroImage || "");
  const areas = (business?.serviceAreas ?? []).slice(0, 3).join(" · ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: primary, color: "#fff", fontFamily: "Georgia, serif" }}>
        {hero && (
          <img src={hero} alt="" width={size.width} height={size.height} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: hero
              ? `linear-gradient(90deg, ${primary}f2 0%, ${primary}d9 46%, ${primary}59 100%)`
              : `linear-gradient(120deg, ${primary} 0%, ${primary} 100%)`,
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 80px", maxWidth: 860 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, color: accent, fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>
            <div style={{ width: 46, height: 2, background: accent }} />
            {business?.type || "Catering"}
          </div>
          <div style={{ marginTop: 26, fontSize: 82, lineHeight: 1.02, letterSpacing: -2 }}>{name}</div>
          <div style={{ marginTop: 24, fontSize: 32, lineHeight: 1.4, color: "#dce3df", fontFamily: "sans-serif" }}>
            {tagline.length > 130 ? `${tagline.slice(0, 130).trimEnd()}…` : tagline}
          </div>
          {areas && (
            <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: accent, fontFamily: "sans-serif" }}>
              {areas}
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
