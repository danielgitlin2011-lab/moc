import assert from "node:assert/strict";
import test from "node:test";
import { businessJsonLd } from "../lib/structured-data.ts";

const SITE = "https://servesite.test/site/olive-and-ember";
const ORIGIN = "https://servesite.test";

const state = {
  business: {
    name: "Olive & Ember", slug: "olive-and-ember", type: "Kosher catering", tagline: "Gather beautifully",
    description: "Elegant kosher catering.", story: "", email: "hello@olive.test", phone: "+1 305 555 0123",
    whatsapp: "", city: "Miami Beach", address: "1 Ocean Drive", serviceAreas: ["Miami", "Fort Lauderdale"],
    logo: "/logo.png", published: true, foundedYear: "2016", teamSize: "", languages: [],
    certifications: [], awards: [], minimumGuests: "", bookingNotice: "", cancellationPolicy: "",
    depositPolicy: "", travelPolicy: "", openingHours: [],
    social: { instagram: "https://instagram.com/olive", facebook: "", tiktok: "", pinterest: "", youtube: "" },
    mapUrl: "https://maps.example/olive",
  },
  theme: { heroImage: "https://images.test/hero.jpg" },
  sections: [],
  services: [{ id: "s1", title: "Weddings", description: "Full service.", image: "", priceFrom: "", capacity: "", highlights: [] }],
  testimonials: [{ id: "t1", quote: "Lovely", author: "Ana", context: "", rating: 5, eventDate: "" }, { id: "t2", quote: "Great", author: "Ben", context: "", rating: 4, eventDate: "" }],
  faqs: [{ id: "f1", question: "How far ahead?", answer: "Two weeks." }],
  stats: [], processSteps: [], team: [],
  categories: [{ id: "c1", name: "Mains", description: "" }, { id: "c2", name: "Empty", description: "" }],
  menuItems: [
    { id: "m1", name: "Braised lamb", description: "Slow cooked.", categoryId: "c1", dietary: ["Kosher"], available: true },
    { id: "m2", name: "Hidden dish", description: "", categoryId: "c1", dietary: [], available: false },
  ],
  gallery: [{ id: "g1", url: "https://images.test/1.jpg", caption: "", category: "", eventType: "", guestCount: "", location: "", featured: false }],
  leads: [], visits: [], publishedAt: null,
  subscription: { plan: "Starter", price: 0, status: "Trial" },
  notifications: { emailLeads: true, whatsapp: false, weeklySummary: true },
  onboarded: true,
};

const graph = businessJsonLd(state, SITE, ORIGIN)["@graph"];

test("the business node describes a caterer search engines can place", () => {
  const business = graph.find(node => node["@id"] === `${SITE}#business`);
  assert.deepEqual(business["@type"], ["Caterer", "LocalBusiness"]);
  assert.equal(business.name, "Olive & Ember");
  assert.equal(business.telephone, "+1 305 555 0123");
  assert.equal(business.address.addressLocality, "Miami Beach");
  assert.deepEqual(business.areaServed.map(place => place.name), ["Miami", "Fort Lauderdale"]);
  assert.deepEqual(business.sameAs, ["https://instagram.com/olive"]);
  assert.equal(business.logo, "https://servesite.test/logo.png", "relative uploads become absolute URLs");
});

test("the rating is the real average of real testimonials", () => {
  const business = graph.find(node => node["@id"] === `${SITE}#business`);
  assert.equal(business.aggregateRating.ratingValue, "4.5");
  assert.equal(business.aggregateRating.reviewCount, 2);
});

test("the menu exposes available dishes only, and skips empty categories", () => {
  const menu = graph.find(node => node["@type"] === "Menu");
  assert.equal(menu.hasMenuSection.length, 1, "a category with no dishes is not published");
  assert.equal(menu.hasMenuSection[0].name, "Mains");
  assert.deepEqual(menu.hasMenuSection[0].hasMenuItem.map(item => item.name), ["Braised lamb"]);
});

test("FAQ entries become a FAQPage", () => {
  const faq = graph.find(node => node["@type"] === "FAQPage");
  assert.equal(faq.mainEntity[0].name, "How far ahead?");
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, "Two weeks.");
});

test("a bare business emits no empty rating, menu, or FAQ nodes", () => {
  const bare = businessJsonLd(
    { ...state, testimonials: [], menuItems: [], faqs: [], services: [], gallery: [], theme: { heroImage: "" } },
    SITE,
    ORIGIN,
  )["@graph"];

  assert.equal(bare.length, 1);
  assert.equal(bare[0].aggregateRating, undefined);
  assert.equal(bare[0].hasMenu, undefined);
});
