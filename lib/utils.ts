export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
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

export function yearsInBusiness(foundedYear: string) {
  const founded = Number.parseInt(foundedYear, 10);
  if (!Number.isFinite(founded) || founded < 1900) return 0;
  return Math.max(0, new Date().getFullYear() - founded);
}
