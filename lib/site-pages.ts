/**
 * Turns the single scrolling site into up to five separately-addressable
 * pages, purely as a function of `theme.pageCount` and the existing section
 * id order — no schema change, because page layout is a fixed lookup rather
 * than stored state.
 *
 * Home always carries every section, exactly like the single-page site did —
 * splitting pages out adds dedicated, deeper pages alongside it rather than
 * stripping content away from Home. Each dedicated page pulls in more than
 * just its "own" section so it reads as a real page rather than a fragment;
 * some sections (stats, faq) intentionally appear on more than one page.
 */
export interface SitePage {
  /** Empty string is the home page (served at /site/[slug]). */
  slug: string;
  label: string;
  sectionIds: string[];
}

interface ExtraPage {
  slug: string;
  label: string;
  sectionIds: string[];
}

// Split out in this order as pageCount grows: 2 pages adds a dedicated Menu
// page first, 5 pages adds all four. Home is unaffected by pageCount — it
// always lists every section.
const EXTRA_PAGES: ExtraPage[] = [
  { slug: "menu", label: "Menu", sectionIds: ["services", "menus", "faq"] },
  { slug: "gallery", label: "Gallery", sectionIds: ["gallery", "stats", "testimonials"] },
  { slug: "about", label: "About", sectionIds: ["about", "process", "team", "stats"] },
  { slug: "contact", label: "Contact", sectionIds: ["quote", "contact", "faq"] },
];

export const MAX_SITE_PAGES = 1 + EXTRA_PAGES.length;

export function clampPageCount(pageCount: number): number {
  const value = Math.round(pageCount);
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_SITE_PAGES, Math.max(1, value));
}

/**
 * `sectionIds` should be the canonical, ordered section id list (as in
 * `defaultSections`, or a business's own reordered `sections`) — order
 * decides where a section falls within whichever page(s) include it.
 */
export function resolveSitePages(sectionIds: string[], pageCount: number): SitePage[] {
  const count = clampPageCount(pageCount);
  const orderedIds = sectionIds.filter(id => id !== "footer");

  const pages: SitePage[] = [{ slug: "", label: "Home", sectionIds: orderedIds }];
  for (const page of EXTRA_PAGES.slice(0, count - 1)) {
    const claimed = new Set(page.sectionIds);
    pages.push({ slug: page.slug, label: page.label, sectionIds: orderedIds.filter(id => claimed.has(id)) });
  }
  return pages;
}

/** Prefers a dedicated (non-Home) page that carries this section, falling back to Home. */
export function findPageForSection(pages: SitePage[], sectionId: string): SitePage | undefined {
  return pages.find(page => page.slug !== "" && page.sectionIds.includes(sectionId))
    ?? pages.find(page => page.sectionIds.includes(sectionId));
}

export function sitePagePath(businessSlug: string, pageSlug: string): string {
  return pageSlug ? `/site/${businessSlug}/${pageSlug}` : `/site/${businessSlug}`;
}
