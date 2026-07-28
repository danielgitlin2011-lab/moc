import { defaultSections } from "@/lib/default-theme";
import type { AppState } from "@/lib/types";
import {
  categoryRowToCategory,
  faqRowToFaq,
  galleryRowToImage,
  leadRowToLead,
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

export interface BusinessBundle {
  businessId: string;
  state: AppState;
}

export async function getBusinessBundleForUser(): Promise<BusinessBundle | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();

  if (!business) return null;

  const businessId = business.id;

  const visitWindowStart = new Date();
  visitWindowStart.setDate(visitWindowStart.getDate() - 89);

  const [sections, services, testimonials, faqs, stats, processSteps, team, categories, menuItems, gallery, leads, visits] = await Promise.all([
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
    supabase.from("leads").select("*, lead_notes(*)").eq("business_id", businessId).order("received_at", { ascending: false }),
    supabase
      .from("site_visit_days")
      .select("visited_on, views")
      .eq("business_id", businessId)
      .gte("visited_on", visitWindowStart.toISOString().slice(0, 10))
      .order("visited_on"),
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
    leads: (leads.data ?? []).map(row => leadRowToLead(row, row.lead_notes ?? [])),
    visits: (visits.data ?? []).map(row => ({ date: row.visited_on, views: row.views })),
    publishedAt: business.published_at,
    subscription: rowToSubscription(business),
    notifications: rowToNotifications(business),
    onboarded: business.onboarded,
  };

  return { businessId, state };
}
