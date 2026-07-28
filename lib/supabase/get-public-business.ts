import { cache } from "react";
import { defaultSections } from "@/lib/default-theme";
import type { AppState } from "@/lib/types";
import {
  categoryRowToCategory,
  faqRowToFaq,
  galleryRowToImage,
  menuItemRowToMenuItem,
  processStepRowToProcessStep,
  rowToBusiness,
  rowToNotifications,
  rowToSubscription,
  rowToTheme,
  sectionRowToSection,
  serviceRowToService,
  statRowToStat,
  teamRowToTeamMember,
  testimonialRowToTestimonial,
} from "./mappers";
import { createClient } from "./server";

export interface PublicBusinessBundle {
  businessId: string;
  state: AppState;
}

export const getPublicBusinessBySlug = cache(async (slug: string): Promise<PublicBusinessBundle | null> => {
  const supabase = await createClient();

  const { data: business } = await supabase.from("businesses").select("*").eq("slug", slug).eq("published", true).maybeSingle();

  if (!business) return null;

  const businessId = business.id;

  const [sections, services, testimonials, faqs, stats, processSteps, team, categories, menuItems, gallery] = await Promise.all([
    supabase.from("website_sections").select("*").eq("business_id", businessId).order("position"),
    supabase.from("services").select("*").eq("business_id", businessId).order("position"),
    supabase.from("testimonials").select("*").eq("business_id", businessId).order("position"),
    supabase.from("faqs").select("*").eq("business_id", businessId).order("position"),
    supabase.from("stats").select("*").eq("business_id", businessId).order("position"),
    supabase.from("process_steps").select("*").eq("business_id", businessId).order("position"),
    supabase.from("team_members").select("*").eq("business_id", businessId).order("position"),
    supabase.from("menu_categories").select("*").eq("business_id", businessId).order("position"),
    supabase.from("menu_items").select("*").eq("business_id", businessId).order("position"),
    supabase.from("gallery_images").select("*").eq("business_id", businessId).order("position"),
  ]);

  const sectionRows = sections.data ?? [];
  const sectionsById = new Map(sectionRows.map(row => [row.section_key, sectionRowToSection(row)]));

  const state: AppState = {
    business: rowToBusiness(business),
    theme: rowToTheme(business),
    sections: defaultSections.map(section => sectionsById.get(section.id) ?? section),
    services: (services.data ?? []).map(serviceRowToService),
    testimonials: (testimonials.data ?? []).map(testimonialRowToTestimonial),
    faqs: (faqs.data ?? []).map(faqRowToFaq),
    stats: (stats.data ?? []).map(statRowToStat),
    processSteps: (processSteps.data ?? []).map(processStepRowToProcessStep),
    team: (team.data ?? []).map(teamRowToTeamMember),
    categories: (categories.data ?? []).map(categoryRowToCategory),
    menuItems: (menuItems.data ?? []).map(menuItemRowToMenuItem),
    gallery: (gallery.data ?? []).map(galleryRowToImage),
    leads: [],
    subscription: rowToSubscription(business),
    notifications: rowToNotifications(business),
    onboarded: business.onboarded,
  };

  return { businessId, state };
});
