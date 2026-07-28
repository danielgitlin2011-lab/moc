export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Parses either a plain `YYYY-MM-DD` calendar date (event dates) or a full
 * timestamp (everything Postgres returns). Calendar dates are anchored at
 * midday so a timezone offset can never shift them onto the previous day.
 */
export function parseDate(value: string) {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function formatDateTime(value: string) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

/** "3 days ago" style labels for activity feeds, with sensible day/week rollups. */
export function relativeTime(value: string, now = new Date()) {
  const date = parseDate(value);
  if (!date) return "—";
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  if (Math.abs(days) < 1) return "today";
  if (Math.abs(days) < 7) return formatter.format(days, "day");
  if (Math.abs(days) < 30) return formatter.format(Math.round(days / 7), "week");
  return formatter.format(Math.round(days / 30), "month");
}

/** Two-letter monogram used when a business has not uploaded a logo. */
export function businessInitials(name: string) {
  const words = name.split(/\s+/).filter(word => /\p{L}/u.test(word[0] || ""));
  return (words.slice(0, 2).map(word => word[0]).join("") || name.slice(0, 2)).toUpperCase();
}

const sansFallback = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const serifFallback = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sansFonts = new Set(["Inter", "DM Sans", "Source Sans", "Lato", "Jost", "Work Sans", "Geist"]);

/** Turns a chosen font name into a resilient stack so customer sites never fall back to a default sans by accident. */
export function fontStack(name: string) {
  const family = name.trim();
  if (!family) return sansFallback;
  return `'${family}', ${sansFonts.has(family) ? sansFallback : serifFallback}`;
}

/**
 * Requests a right-sized rendition from hosts that support it, so a 4 MB
 * original never gets shipped for a 400 px thumbnail.
 */
export function sizedImage(url: string, width: number) {
  if (!url) return url;
  try {
    const parsed = new URL(url, "https://placeholder.local");
    if (parsed.hostname !== "images.unsplash.com") return url;
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    parsed.searchParams.set("w", String(width));
    if (!parsed.searchParams.has("q")) parsed.searchParams.set("q", "80");
    return parsed.toString();
  } catch {
    return url;
  }
}

export function yearsInBusiness(foundedYear: string) {
  const founded = Number.parseInt(foundedYear, 10);
  if (!Number.isFinite(founded) || founded < 1900) return 0;
  return Math.max(0, new Date().getFullYear() - founded);
}
