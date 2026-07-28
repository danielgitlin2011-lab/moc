import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWebsite } from "@/components/public-website";
import { getPublicBusinessBySlug } from "@/lib/supabase/get-public-business";

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string }> }): Promise<Metadata> {
  const { businessSlug } = await params;
  const bundle = await getPublicBusinessBySlug(businessSlug);
  if (!bundle) return {};
  const { business, theme } = bundle.state;
  const description = business.tagline || business.description;
  const image = theme.heroImage;
  return {
    title: business.name,
    description,
    openGraph: {
      title: business.name,
      description,
      type: "website",
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

  return <PublicWebsite state={bundle.state} businessId={bundle.businessId} />;
}
