import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWebsite } from "@/components/public-website";
import { getPublicBusinessBySlug } from "@/lib/supabase/get-public-business";

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string }> }): Promise<Metadata> {
  const { businessSlug } = await params;
  const bundle = await getPublicBusinessBySlug(businessSlug);
  if (!bundle) return {};
  return {
    title: bundle.state.business.name,
    description: bundle.state.business.tagline || bundle.state.business.description,
  };
}

export default async function CateringSitePage({ params }: { params: Promise<{ businessSlug: string }> }) {
  const { businessSlug } = await params;
  const bundle = await getPublicBusinessBySlug(businessSlug);

  if (!bundle) notFound();

  return <PublicWebsite state={bundle.state} businessId={bundle.businessId} />;
}
