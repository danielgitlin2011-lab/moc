import type { MetadataRoute } from "next";
import { requestOrigin } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await requestOrigin();
  const entries: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("businesses")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(5000);

    for (const business of data ?? []) {
      entries.push({
        url: `${origin}/site/${business.slug}`,
        lastModified: new Date(business.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // A sitemap listing only the marketing page is better than a 500.
  }

  return entries;
}
