export type TemplateName = "editorial" | "modern" | "warm" | "coastal" | "noir";
export type LeadStatus = "New" | "Contacted" | "Quote sent" | "Won" | "Lost";

export interface OpeningHour {
  id: string;
  days: string;
  hours: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
  pinterest: string;
  youtube: string;
}

export interface Business {
  name: string;
  slug: string;
  type: string;
  tagline: string;
  description: string;
  story: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  serviceAreas: string[];
  logo?: string;
  published: boolean;
  foundedYear: string;
  teamSize: string;
  languages: string[];
  certifications: string[];
  awards: string[];
  minimumGuests: string;
  bookingNotice: string;
  cancellationPolicy: string;
  depositPolicy: string;
  travelPolicy: string;
  openingHours: OpeningHour[];
  social: SocialLinks;
  mapUrl: string;
}

export interface BusinessTheme {
  template: TemplateName;
  primary: string;
  accent: string;
  surface: string;
  headingFont: string;
  bodyFont: string;
  headingScale: "calm" | "balanced" | "dramatic";
  buttonShape: "square" | "soft" | "pill";
  imageCorners: "square" | "soft" | "rounded";
  sectionSpacing: "compact" | "comfortable" | "spacious";
  navigation: "minimal" | "centered" | "classic";
  heroImage: string;
  heroLayout: "overlay" | "split" | "centered";
  heroHeight: "compact" | "grand";
  heroOverlay: number;
  headerStyle: "transparent" | "solid";
  showAnnouncement: boolean;
  announcementText: string;
  showMenuPrices: boolean;
  showDietaryLabels: boolean;
  showAllergens: boolean;
  showSocialLinks: boolean;
  showOpeningHours: boolean;
  aboutImage: string;
  detailImage: string;
  galleryLayout: "mosaic" | "editorial" | "grid";
  menuLayout: "cards" | "list" | "editorial";
  serviceLayout: "cards" | "rows" | "tiles";
  menuItemLimit: number;
  galleryLimit: number;
}

export interface WebsiteSection {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel?: string;
  secondaryCtaLabel?: string;
  visible: boolean;
}

export interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  image: string;
  priceFrom: string;
  capacity: string;
  highlights: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  context: string;
  rating: number;
  eventDate: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface StatHighlight {
  id: string;
  value: string;
  label: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  duration: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  pricingUnit: "Per person" | "Per tray" | "Per item" | "Starting at" | "Custom quote";
  image: string;
  categoryId: string;
  dietary: string[];
  allergens: string[];
  ingredients: string;
  servingSize: string;
  preparation: string;
  leadTime: string;
  minimumOrder: string;
  seasonal: string;
  featured: boolean;
  available: boolean;
  views: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  eventType: string;
  guestCount: string;
  location: string;
  featured: boolean;
}

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  guestCount: number;
  budget: string;
  serviceStyle: string;
  preferredMenu: string;
  dietaryRequirements: string;
  details: string;
  preferredContact: string;
  hearAboutUs: string;
  source: string;
  referrer: string;
  receivedAt: string;
  status: LeadStatus;
  notes: LeadNote[];
}

/** One aggregated day of website traffic for a published site. */
export interface SiteVisitDay {
  date: string;
  views: number;
}

export interface Subscription {
  plan: "Starter" | "Business" | "Pro";
  price: number;
  status: "Active" | "Trial";
}

export interface AppState {
  business: Business;
  theme: BusinessTheme;
  sections: WebsiteSection[];
  services: ServiceOffering[];
  testimonials: Testimonial[];
  faqs: FaqEntry[];
  stats: StatHighlight[];
  processSteps: ProcessStep[];
  team: TeamMember[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  gallery: GalleryImage[];
  leads: Lead[];
  visits: SiteVisitDay[];
  publishedAt: string | null;
  subscription: Subscription;
  notifications: {
    emailLeads: boolean;
    whatsapp: boolean;
    weeklySummary: boolean;
  };
  onboarded: boolean;
}
