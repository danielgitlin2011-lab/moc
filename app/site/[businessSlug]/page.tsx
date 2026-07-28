import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWebsite } from "@/components/public-website";
import { VisitTracker } from "@/components/visit-tracker";
import { getPublicBusinessBySlug } from "@/lib/supabase/get-public-business";
import { requestOrigin } from "@/lib/seo";
import { businessJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string }> }): Promise<Metadata> {
  const { businessSlug } = await params;
  const bundle = await getPublicBusinessBySlug(businessSlug);
  if (!bundle) return { title: "Website not available", robots: { index: false, follow: false } };

  const { business, theme } = bundle.state;
  const description = business.tagline || business.description;
  const image = theme.heroImage;
  const canonical = `${await requestOrigin()}/site/${business.slug}`;

  return {
    title: { absolute: business.tagline ? `${business.name} — ${business.tagline}` : business.name },
    description,
    alternates: { canonical },
    keywords: [business.type, ...business.serviceAreas.map(area => `catering ${area}`)].filter(Boolean),
    openGraph: {
      title: business.name,
      description,
      type: "website",
      url: canonical,
      siteName: business.name,
      ...(image ? { images: [{ url: image, alt: business.name }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: business.name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function CateringSitePage({ params }: { params: Promise<{ businessSlug: string }> }) {
  const { businessSlug } = await params;
  const bundle = await getPublicBusinessBySlug(businessSlug);

  if (!bundle) notFound();

  const origin = await requestOrigin();
  const siteUrl = `${origin}/site/${bundle.state.business.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd(bundle.state, siteUrl, origin)) }}
      />
      <PublicWebsite state={bundle.state} businessId={bundle.businessId} />
      <VisitTracker businessId={bundle.businessId} />
    </>
  );
}
