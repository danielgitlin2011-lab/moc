import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWebsite } from "@/components/public-website";
import { VisitTracker } from "@/components/visit-tracker";
import { getPublicBusinessBySlug } from "@/lib/supabase/get-public-business";
import { requestOrigin } from "@/lib/seo";
import { resolveSitePages, sitePagePath, type SitePage } from "@/lib/site-pages";

/** The requested slug must be one of the extra pages this business's page count actually splits out — anything else 404s. */
async function resolveRequestedPage(businessSlug: string, page: string) {
  const bundle = await getPublicBusinessBySlug(businessSlug);
  if (!bundle) return null;
  const pages = resolveSitePages(bundle.state.sections.map(section => section.id), bundle.state.theme.pageCount || 1);
  const sitePage = pages.find(entry => entry.slug === page);
  if (!sitePage || sitePage.slug === "") return null;
  return { bundle, sitePage: sitePage as SitePage };
}

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string; page: string }> }): Promise<Metadata> {
  const { businessSlug, page } = await params;
  const resolved = await resolveRequestedPage(businessSlug, page);
  if (!resolved) return { title: "Page not available", robots: { index: false, follow: false } };

  const { business } = resolved.bundle.state;
  const title = `${resolved.sitePage.label} — ${business.name}`;
  const description = business.tagline || business.description;
  const canonical = `${await requestOrigin()}${sitePagePath(business.slug, resolved.sitePage.slug)}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical, siteName: business.name, locale: "en_US" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicSiteSubPage({ params }: { params: Promise<{ businessSlug: string; page: string }> }) {
  const { businessSlug, page } = await params;
  const resolved = await resolveRequestedPage(businessSlug, page);
  if (!resolved) notFound();

  return (
    <>
      <PublicWebsite state={resolved.bundle.state} businessId={resolved.bundle.businessId} pageSlug={resolved.sitePage.slug} />
      <VisitTracker businessId={resolved.bundle.businessId} />
    </>
  );
}
