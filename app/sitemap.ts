import type { MetadataRoute } from "next";
import { defaultSections, defaultTheme } from "@/lib/default-theme";
import { requestOrigin } from "@/lib/seo";
import { resolveSitePages, sitePagePath } from "@/lib/site-pages";
import type { BusinessTheme } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

const defaultSectionIds = defaultSections.map(section => section.id);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await requestOrigin();
  const entries: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("businesses")
      .select("slug, updated_at, theme")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(5000);

    for (const business of data ?? []) {
      const theme: BusinessTheme = { ...defaultTheme, ...((business.theme as Partial<BusinessTheme>) ?? {}) };
      // The section id set (not each business's own reordering) is enough to
      // know which page slugs exist, so this skips fetching every section table.
      const pages = resolveSitePages(defaultSectionIds, theme.pageCount || 1);
      for (const page of pages) {
        entries.push({
          url: `${origin}${sitePagePath(business.slug, page.slug)}`,
          lastModified: new Date(business.updated_at),
          changeFrequency: "weekly",
          priority: page.slug === "" ? 0.8 : 0.6,
        });
      }
    }
  } catch {
    // A sitemap listing only the marketing page is better than a 500.
  }

  return entries;
}
