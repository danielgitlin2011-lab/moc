import { parseDate } from "./utils";
import type { AppState, Lead, SiteVisitDay } from "./types";

/** Local calendar day key (`YYYY-MM-DD`) for a date. */
export function dayKey(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** The last `count` day keys, oldest first, ending today. */
export function recentDays(count: number, today = new Date()): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (count - 1 - index));
    return dayKey(date);
  });
}

export interface TrendPoint {
  date: string;
  label: string;
  value: number;
}

function withLabels(days: string[], valueFor: (day: string) => number): TrendPoint[] {
  return days.map(date => {
    const parsed = parseDate(date);
    return {
      date,
      label: parsed ? new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(parsed) : "",
      value: valueFor(date),
    };
  });
}

/** Website views per day for the trailing window, zero-filled so the chart never has gaps. */
export function viewTrend(visits: SiteVisitDay[], days = 7, today = new Date()): TrendPoint[] {
  const byDay = new Map(visits.map(visit => [visit.date, visit.views]));
  return withLabels(recentDays(days, today), day => byDay.get(day) ?? 0);
}

/** Inquiries per day for the trailing window. */
export function leadTrend(leads: Lead[], days = 7, today = new Date()): TrendPoint[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const received = parseDate(lead.receivedAt);
    if (!received) continue;
    const key = dayKey(received);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return withLabels(recentDays(days, today), day => counts.get(day) ?? 0);
}

function sumWindow(visits: SiteVisitDay[], days: string[]) {
  const window = new Set(days);
  return visits.reduce((total, visit) => (window.has(visit.date) ? total + visit.views : total), 0);
}

export interface ViewSummary {
  total: number;
  previousTotal: number;
  /** Percentage change against the preceding window, or null when there is no baseline. */
  change: number | null;
  hasData: boolean;
}

export function viewSummary(visits: SiteVisitDay[], days = 30, today = new Date()): ViewSummary {
  const current = recentDays(days, today);
  const earlier = new Date(today);
  earlier.setDate(earlier.getDate() - days);
  const previous = recentDays(days, earlier);

  const total = sumWindow(visits, current);
  const previousTotal = sumWindow(visits, previous);

  return {
    total,
    previousTotal,
    change: previousTotal > 0 ? Math.round(((total - previousTotal) / previousTotal) * 100) : null,
    hasData: visits.length > 0,
  };
}

export interface LeadSummary {
  total: number;
  newCount: number;
  quotedCount: number;
  wonCount: number;
  lostCount: number;
  thisWeek: number;
  /** Share of decided inquiries (won + lost) that were won, or null before any decision. */
  bookingRate: number | null;
  averageGuests: number | null;
}

export function leadSummary(leads: Lead[], today = new Date()): LeadSummary {
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const byStatus = (status: Lead["status"]) => leads.filter(lead => lead.status === status).length;
  const wonCount = byStatus("Won");
  const lostCount = byStatus("Lost");
  const decided = wonCount + lostCount;
  const guests = leads.map(lead => lead.guestCount).filter(count => count > 0);

  return {
    total: leads.length,
    newCount: byStatus("New"),
    quotedCount: byStatus("Quote sent"),
    wonCount,
    lostCount,
    thisWeek: leads.filter(lead => {
      const received = parseDate(lead.receivedAt);
      return received ? received >= weekAgo : false;
    }).length,
    bookingRate: decided > 0 ? Math.round((wonCount / decided) * 100) : null,
    averageGuests: guests.length ? Math.round(guests.reduce((total, count) => total + count, 0) / guests.length) : null,
  };
}

export interface CompletionItem {
  id: string;
  label: string;
  href: string;
  done: boolean;
}

export interface CompletionSummary {
  percentage: number;
  items: CompletionItem[];
  remaining: CompletionItem[];
}

/**
 * A checklist of the things that measurably improve a generated catering site,
 * derived from the customer's own data rather than a fixed number.
 */
export function profileCompletion(state: AppState): CompletionSummary {
  const { business, theme } = state;
  const items: CompletionItem[] = [
    { id: "details", label: "Business name, phone, and email", href: "/dashboard/settings", done: Boolean(business.name && business.phone && business.email) },
    { id: "story", label: "Tagline and description", href: "/dashboard/settings", done: Boolean(business.tagline && business.description) },
    { id: "areas", label: "Service areas listed", href: "/dashboard/settings", done: business.serviceAreas.length > 0 },
    { id: "policies", label: "Booking and deposit policies", href: "/dashboard/settings", done: Boolean(business.bookingNotice && business.depositPolicy) },
    { id: "logo", label: "Logo uploaded", href: "/dashboard/design", done: Boolean(business.logo) },
    { id: "hero", label: "Hero image chosen", href: "/dashboard/design", done: Boolean(theme.heroImage) },
    { id: "menu", label: "At least 3 menu items", href: "/dashboard/menu", done: state.menuItems.length >= 3 },
    { id: "gallery", label: "At least 6 gallery images", href: "/dashboard/gallery", done: state.gallery.length >= 6 },
    { id: "services", label: "At least 2 services", href: "/dashboard/content", done: state.services.length >= 2 },
    { id: "testimonials", label: "At least 2 testimonials", href: "/dashboard/content", done: state.testimonials.length >= 2 },
    { id: "faq", label: "At least 3 FAQ answers", href: "/dashboard/content", done: state.faqs.length >= 3 },
    { id: "published", label: "Website published", href: "/dashboard/settings", done: business.published },
  ];

  const done = items.filter(item => item.done).length;

  return {
    percentage: Math.round((done / items.length) * 100),
    items,
    remaining: items.filter(item => !item.done),
  };
}

/** Menu items ordered by the views they have actually accumulated. */
export function topMenuItems(state: AppState, count = 3) {
  return [...state.menuItems]
    .filter(item => item.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, count);
}
