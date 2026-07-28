import { defaultBusiness, defaultTheme } from "@/lib/default-theme";
import type {
  Business,
  BusinessTheme,
  FaqEntry,
  GalleryImage,
  Lead,
  LeadNote,
  LeadStatus,
  MenuCategory,
  MenuItem,
  ProcessStep,
  ServiceOffering,
  StatHighlight,
  Subscription,
  TeamMember,
  Testimonial,
  WebsiteSection,
} from "@/lib/types";
import type { Json, Tables, TablesInsert } from "./types";

export function rowToBusiness(row: Tables<"businesses">): Business {
  return {
    name: row.name,
    slug: row.slug,
    type: row.type,
    tagline: row.tagline,
    description: row.description,
    story: row.story,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    city: row.city,
    address: row.address,
    serviceAreas: row.service_areas,
    logo: row.logo,
    published: row.published,
    foundedYear: row.founded_year,
    teamSize: row.team_size,
    languages: row.languages,
    certifications: row.certifications,
    awards: row.awards,
    minimumGuests: row.minimum_guests,
    bookingNotice: row.booking_notice,
    cancellationPolicy: row.cancellation_policy,
    depositPolicy: row.deposit_policy,
    travelPolicy: row.travel_policy,
    openingHours: (row.opening_hours as unknown as Business["openingHours"]) ?? [],
    social: { ...defaultBusiness.social, ...((row.social as Partial<Business["social"]>) ?? {}) },
    mapUrl: row.map_url,
  };
}

export function businessToRow(
  business: Business,
  theme: BusinessTheme,
  ownerId: string,
  opts?: { onboarded?: boolean; published?: boolean },
): TablesInsert<"businesses"> {
  return {
    owner_id: ownerId,
    name: business.name,
    slug: business.slug,
    type: business.type,
    tagline: business.tagline,
    description: business.description,
    story: business.story,
    email: business.email,
    phone: business.phone,
    whatsapp: business.whatsapp,
    city: business.city,
    address: business.address,
    service_areas: business.serviceAreas,
    logo: business.logo ?? "",
    published: opts?.published ?? business.published,
    founded_year: business.foundedYear,
    team_size: business.teamSize,
    languages: business.languages,
    certifications: business.certifications,
    awards: business.awards,
    minimum_guests: business.minimumGuests,
    booking_notice: business.bookingNotice,
    cancellation_policy: business.cancellationPolicy,
    deposit_policy: business.depositPolicy,
    travel_policy: business.travelPolicy,
    opening_hours: business.openingHours as unknown as Json,
    social: business.social as unknown as Json,
    map_url: business.mapUrl,
    theme: theme as unknown as Json,
    onboarded: opts?.onboarded ?? false,
  };
}

export function rowToTheme(row: Tables<"businesses">): BusinessTheme {
  return { ...defaultTheme, ...((row.theme as Partial<BusinessTheme>) ?? {}) };
}

export function rowToNotifications(row: Tables<"businesses">) {
  const notifications = (row.notifications as Partial<{ emailLeads: boolean; whatsapp: boolean; weeklySummary: boolean }>) ?? {};
  return { emailLeads: notifications.emailLeads ?? true, whatsapp: notifications.whatsapp ?? false, weeklySummary: notifications.weeklySummary ?? true };
}

export function rowToSubscription(row: Tables<"businesses">): Subscription {
  const subscription = (row.subscription as Partial<Subscription>) ?? {};
  return { plan: subscription.plan ?? "Starter", price: subscription.price ?? 0, status: subscription.status ?? "Trial" };
}

export function sectionRowToSection(row: Tables<"website_sections">): WebsiteSection {
  return {
    id: row.section_key,
    label: row.label,
    eyebrow: row.eyebrow,
    title: row.title,
    body: row.body,
    ctaLabel: row.cta_label ?? undefined,
    secondaryCtaLabel: row.secondary_cta_label ?? undefined,
    visible: row.visible,
  };
}

export function sectionToRow(section: WebsiteSection, businessId: string, position: number): TablesInsert<"website_sections"> {
  return {
    business_id: businessId,
    section_key: section.id,
    label: section.label,
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    cta_label: section.ctaLabel ?? null,
    secondary_cta_label: section.secondaryCtaLabel ?? null,
    visible: section.visible,
    position,
  };
}

export function serviceRowToService(row: Tables<"services">): ServiceOffering {
  return { id: row.id, title: row.title, description: row.description, image: row.image, priceFrom: row.price_from, capacity: row.capacity, highlights: row.highlights };
}

export function serviceToRow(service: Partial<ServiceOffering>): Partial<TablesInsert<"services">> {
  const row: Partial<TablesInsert<"services">> = {};
  if (service.title !== undefined) row.title = service.title;
  if (service.description !== undefined) row.description = service.description;
  if (service.image !== undefined) row.image = service.image;
  if (service.priceFrom !== undefined) row.price_from = service.priceFrom;
  if (service.capacity !== undefined) row.capacity = service.capacity;
  if (service.highlights !== undefined) row.highlights = service.highlights;
  return row;
}

export function testimonialRowToTestimonial(row: Tables<"testimonials">): Testimonial {
  return { id: row.id, quote: row.quote, author: row.author, context: row.context, rating: row.rating, eventDate: row.event_date };
}

export function testimonialToRow(testimonial: Partial<Testimonial>): Partial<TablesInsert<"testimonials">> {
  const row: Partial<TablesInsert<"testimonials">> = {};
  if (testimonial.quote !== undefined) row.quote = testimonial.quote;
  if (testimonial.author !== undefined) row.author = testimonial.author;
  if (testimonial.context !== undefined) row.context = testimonial.context;
  if (testimonial.rating !== undefined) row.rating = testimonial.rating;
  if (testimonial.eventDate !== undefined) row.event_date = testimonial.eventDate;
  return row;
}

export function faqRowToFaq(row: Tables<"faqs">): FaqEntry {
  return { id: row.id, question: row.question, answer: row.answer };
}

export function faqToRow(faq: Partial<FaqEntry>): Partial<TablesInsert<"faqs">> {
  const row: Partial<TablesInsert<"faqs">> = {};
  if (faq.question !== undefined) row.question = faq.question;
  if (faq.answer !== undefined) row.answer = faq.answer;
  return row;
}

export function statRowToStat(row: Tables<"stats">): StatHighlight {
  return { id: row.id, value: row.value, label: row.label };
}

export function statToRow(stat: Partial<StatHighlight>): Partial<TablesInsert<"stats">> {
  const row: Partial<TablesInsert<"stats">> = {};
  if (stat.value !== undefined) row.value = stat.value;
  if (stat.label !== undefined) row.label = stat.label;
  return row;
}

export function processStepRowToProcessStep(row: Tables<"process_steps">): ProcessStep {
  return { id: row.id, title: row.title, description: row.description, duration: row.duration };
}

export function processStepToRow(step: Partial<ProcessStep>): Partial<TablesInsert<"process_steps">> {
  const row: Partial<TablesInsert<"process_steps">> = {};
  if (step.title !== undefined) row.title = step.title;
  if (step.description !== undefined) row.description = step.description;
  if (step.duration !== undefined) row.duration = step.duration;
  return row;
}

export function teamRowToTeamMember(row: Tables<"team_members">): TeamMember {
  return { id: row.id, name: row.name, role: row.role, bio: row.bio, image: row.image };
}

export function teamMemberToRow(member: Partial<TeamMember>): Partial<TablesInsert<"team_members">> {
  const row: Partial<TablesInsert<"team_members">> = {};
  if (member.name !== undefined) row.name = member.name;
  if (member.role !== undefined) row.role = member.role;
  if (member.bio !== undefined) row.bio = member.bio;
  if (member.image !== undefined) row.image = member.image;
  return row;
}

export function categoryRowToCategory(row: Tables<"menu_categories">): MenuCategory {
  return { id: row.id, name: row.name, description: row.description };
}

export function menuCategoryToRow(category: Partial<MenuCategory>): Partial<TablesInsert<"menu_categories">> {
  const row: Partial<TablesInsert<"menu_categories">> = {};
  if (category.name !== undefined) row.name = category.name;
  if (category.description !== undefined) row.description = category.description;
  return row;
}

export function menuItemRowToMenuItem(row: Tables<"menu_items">): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    pricingUnit: row.pricing_unit as MenuItem["pricingUnit"],
    image: row.image,
    categoryId: row.category_id ?? "",
    dietary: row.dietary,
    allergens: row.allergens,
    ingredients: row.ingredients,
    servingSize: row.serving_size,
    preparation: row.preparation,
    leadTime: row.lead_time,
    minimumOrder: row.minimum_order,
    seasonal: row.seasonal,
    featured: row.featured,
    available: row.available,
    views: row.views,
  };
}

export function menuItemToRow(item: MenuItem, businessId: string, categoryId: string | null, position: number): TablesInsert<"menu_items"> {
  return {
    business_id: businessId,
    category_id: categoryId,
    name: item.name,
    description: item.description,
    price: item.price,
    pricing_unit: item.pricingUnit,
    image: item.image,
    dietary: item.dietary,
    allergens: item.allergens,
    ingredients: item.ingredients,
    serving_size: item.servingSize,
    preparation: item.preparation,
    lead_time: item.leadTime,
    minimum_order: item.minimumOrder,
    seasonal: item.seasonal,
    featured: item.featured,
    available: item.available,
    views: item.views,
    position,
  };
}

export function galleryRowToImage(row: Tables<"gallery_images">): GalleryImage {
  return { id: row.id, url: row.url, caption: row.caption, category: row.category, eventType: row.event_type, guestCount: row.guest_count, location: row.location, featured: row.featured };
}

export function galleryImageToRow(image: Partial<GalleryImage>): Partial<TablesInsert<"gallery_images">> {
  const row: Partial<TablesInsert<"gallery_images">> = {};
  if (image.url !== undefined) row.url = image.url;
  if (image.caption !== undefined) row.caption = image.caption;
  if (image.category !== undefined) row.category = image.category;
  if (image.eventType !== undefined) row.event_type = image.eventType;
  if (image.guestCount !== undefined) row.guest_count = image.guestCount;
  if (image.location !== undefined) row.location = image.location;
  if (image.featured !== undefined) row.featured = image.featured;
  return row;
}

export function leadNoteRowToNote(row: Tables<"lead_notes">): LeadNote {
  return { id: row.id, text: row.text, createdAt: row.created_at };
}

export function leadRowToLead(row: Tables<"leads">, notes: Tables<"lead_notes">[]): Lead {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    eventDate: row.event_date,
    eventTime: row.event_time,
    eventLocation: row.event_location,
    eventType: row.event_type,
    guestCount: row.guest_count,
    budget: row.budget,
    serviceStyle: row.service_style,
    preferredMenu: row.preferred_menu,
    dietaryRequirements: row.dietary_requirements,
    details: row.details,
    preferredContact: row.preferred_contact,
    hearAboutUs: row.hear_about_us,
    source: row.source,
    referrer: row.referrer,
    receivedAt: row.received_at,
    status: row.status as LeadStatus,
    notes: notes.map(leadNoteRowToNote),
  };
}
