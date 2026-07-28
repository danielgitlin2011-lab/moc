import type { MetadataRoute } from "next";
import { requestOrigin } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await requestOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private workspaces and API surfaces have nothing to offer a crawler.
        disallow: ["/dashboard", "/onboarding", "/preview", "/login", "/signup", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
