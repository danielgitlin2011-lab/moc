import assert from "node:assert/strict";
import test from "node:test";
import { dayKey, leadSummary, leadTrend, profileCompletion, recentDays, topMenuItems, viewSummary, viewTrend } from "../lib/analytics.ts";

const NOW = new Date("2026-07-28T10:00:00");

function lead(overrides = {}) {
  return {
    id: Math.random().toString(36).slice(2),
    customerName: "Test Host",
    email: "host@example.com",
    phone: "0500000000",
    eventDate: "2026-09-01",
    eventTime: "18:00",
    eventLocation: "Tel Aviv",
    eventType: "Wedding",
    guestCount: 100,
    budget: "$5,000–$10,000",
    serviceStyle: "Buffet",
    preferredMenu: "",
    dietaryRequirements: "",
    details: "",
    preferredContact: "Email",
    hearAboutUs: "",
    source: "",
    referrer: "",
    receivedAt: "2026-07-28T09:00:00.000Z",
    status: "New",
    notes: [],
    ...overrides,
  };
}

test("recentDays ends today and runs oldest first", () => {
  const days = recentDays(7, NOW);
  assert.equal(days.length, 7);
  assert.equal(days.at(-1), dayKey(NOW));
  assert.deepEqual([...days].sort(), days);
});

test("view and lead trends zero-fill days with no activity", () => {
  const trend = viewTrend([{ date: dayKey(NOW), views: 12 }], 7, NOW);
  assert.equal(trend.length, 7);
  assert.equal(trend.at(-1).value, 12);
  assert.equal(trend[0].value, 0, "a day without visits still gets a bar");
  assert.ok(trend[0].label.length > 0, "each point carries a weekday label");

  const leads = leadTrend([lead(), lead()], 7, NOW);
  assert.equal(leads.at(-1).value, 2);
});

test("viewSummary compares the window against the one before it", () => {
  const previousDay = new Date(NOW);
  previousDay.setDate(previousDay.getDate() - 35);

  const summary = viewSummary([
    { date: dayKey(NOW), views: 150 },
    { date: dayKey(previousDay), views: 100 },
  ], 30, NOW);

  assert.equal(summary.total, 150);
  assert.equal(summary.previousTotal, 100);
  assert.equal(summary.change, 50);
  assert.equal(summary.hasData, true);
});

test("viewSummary reports no baseline rather than a fake percentage", () => {
  const summary = viewSummary([{ date: dayKey(NOW), views: 8 }], 30, NOW);
  assert.equal(summary.change, null);

  const untracked = viewSummary([], 30, NOW);
  assert.equal(untracked.hasData, false);
  assert.equal(untracked.total, 0);
});

test("leadSummary counts statuses and only rates decided inquiries", () => {
  const summary = leadSummary([
    lead({ status: "New" }),
    lead({ status: "Quote sent" }),
    lead({ status: "Won" }),
    lead({ status: "Won" }),
    lead({ status: "Lost" }),
  ], NOW);

  assert.equal(summary.total, 5);
  assert.equal(summary.newCount, 1);
  assert.equal(summary.quotedCount, 1);
  assert.equal(summary.wonCount, 2);
  assert.equal(summary.bookingRate, 67, "2 won of 3 decided — pending leads must not dilute it");
  assert.equal(summary.averageGuests, 100);
});

test("leadSummary has no booking rate before anything is decided", () => {
  assert.equal(leadSummary([lead(), lead({ status: "Contacted" })], NOW).bookingRate, null);
});

test("leadSummary counts only the trailing week as recent", () => {
  const old = lead({ receivedAt: "2026-06-01T09:00:00.000Z" });
  assert.equal(leadSummary([lead(), old], NOW).thisWeek, 1);
});

const emptyState = {
  business: {
    name: "", slug: "", type: "", tagline: "", description: "", story: "", email: "", phone: "",
    whatsapp: "", city: "", address: "", serviceAreas: [], logo: "", published: false, foundedYear: "",
    teamSize: "", languages: [], certifications: [], awards: [], minimumGuests: "", bookingNotice: "",
    cancellationPolicy: "", depositPolicy: "", travelPolicy: "", openingHours: [],
    social: { instagram: "", facebook: "", tiktok: "", pinterest: "", youtube: "" }, mapUrl: "",
  },
  theme: { heroImage: "" },
  sections: [], services: [], testimonials: [], faqs: [], stats: [], processSteps: [], team: [],
  categories: [], menuItems: [], gallery: [], leads: [], visits: [], publishedAt: null,
  subscription: { plan: "Starter", price: 0, status: "Trial" },
  notifications: { emailLeads: true, whatsapp: false, weeklySummary: true },
  onboarded: true,
};

test("profileCompletion reflects the data a business actually has", () => {
  const empty = profileCompletion(emptyState);
  assert.equal(empty.percentage, 0);
  assert.equal(empty.remaining.length, empty.items.length);

  const partial = profileCompletion({
    ...emptyState,
    business: { ...emptyState.business, name: "Olive", phone: "050", email: "a@b.com", published: true },
    menuItems: [{}, {}, {}],
  });
  assert.ok(partial.percentage > 0 && partial.percentage < 100);
  assert.ok(partial.items.find(item => item.id === "menu").done);
  assert.ok(partial.remaining.every(item => item.href.startsWith("/dashboard")), "each gap links somewhere fixable");
});

test("topMenuItems ignores dishes nobody has viewed", () => {
  const items = topMenuItems({ ...emptyState, menuItems: [
    { id: "a", name: "Unseen", views: 0 },
    { id: "b", name: "Popular", views: 40 },
    { id: "c", name: "Second", views: 12 },
  ] }, 3);

  assert.deepEqual(items.map(item => item.name), ["Popular", "Second"]);
});
