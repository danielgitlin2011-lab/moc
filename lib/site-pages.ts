/**
 * Turns the single scrolling site into up to five separately-addressable
 * pages, purely as a function of `theme.pageCount` and the existing section
 * id order — no schema change, because which page a section lands on is a
 * fixed lookup rather than stored state.
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

// Split out in this order as pageCount grows: 2 pages splits out Menu first,
// 5 pages splits out all four. Sections not claimed by an included page stay
// on Home, so nothing ever disappears regardless of pageCount.
const EXTRA_PAGES: ExtraPage[] = [
  { slug: "menu", label: "Menu", sectionIds: ["services", "menus"] },
  { slug: "gallery", label: "Gallery", sectionIds: ["gallery"] },
  { slug: "about", label: "About", sectionIds: ["about", "process", "team"] },
  { slug: "contact", label: "Contact", sectionIds: ["quote", "contact"] },
];

export const MAX_SITE_PAGES = 1 + EXTRA_PAGES.length;

export function clampPageCount(pageCount: number): number {
  const value = Math.round(pageCount);
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_SITE_PAGES, Math.max(1, value));
}

/**
 * `sectionIds` should be the canonical, ordered section id list (as in
 * `defaultSections`, or a business's own reordered `sections`) — the id set
 * decides which page a section belongs to, order decides where it falls
 * within that page.
 */
export function resolveSitePages(sectionIds: string[], pageCount: number): SitePage[] {
  const count = clampPageCount(pageCount);
  const splitPages = EXTRA_PAGES.slice(0, count - 1);
  const pageSlugBySectionId = new Map<string, string>();
  for (const page of splitPages) {
    for (const id of page.sectionIds) pageSlugBySectionId.set(id, page.slug);
  }

  const orderedIds = sectionIds.filter(id => id !== "footer");
  const homeIds = orderedIds.filter(id => !pageSlugBySectionId.has(id));

  const pages: SitePage[] = [{ slug: "", label: "Home", sectionIds: homeIds }];
  for (const page of splitPages) {
    pages.push({ slug: page.slug, label: page.label, sectionIds: orderedIds.filter(id => pageSlugBySectionId.get(id) === page.slug) });
  }
  return pages;
}

export function findPageForSection(pages: SitePage[], sectionId: string): SitePage | undefined {
  return pages.find(page => page.sectionIds.includes(sectionId));
}

export function sitePagePath(businessSlug: string, pageSlug: string): string {
  return pageSlug ? `/site/${businessSlug}/${pageSlug}` : `/site/${businessSlug}`;
}
