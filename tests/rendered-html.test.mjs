import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const expectedRoutes = [
  "app/page.tsx",
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/onboarding/page.tsx",
  "app/dashboard/page.tsx",
  "app/dashboard/website/page.tsx",
  "app/dashboard/content/page.tsx",
  "app/dashboard/design/page.tsx",
  "app/dashboard/menu/page.tsx",
  "app/dashboard/gallery/page.tsx",
  "app/dashboard/leads/page.tsx",
  "app/dashboard/settings/page.tsx",
  "app/preview/page.tsx",
  "app/site/[businessSlug]/page.tsx",
];

test("the production bundle and complete customer journey are present", async () => {
  await access(new URL(".next/BUILD_ID", root));
  await Promise.all(expectedRoutes.map(route => access(new URL(route, root))));

  const [landing, publicSite, preview] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("components/public-website.tsx", root), "utf8"),
    readFile(new URL("app/preview/page.tsx", root), "utf8"),
  ]);
  assert.match(landing, /Your food business website, menu, and leads/);
  assert.match(publicSite, /gallery-lightbox/);
  assert.match(preview, /Edit on page/);
});

test("every content collection reaches the generated website instead of hardcoded copy", async () => {
  const [publicSite, defaultTheme, contentEditor] = await Promise.all([
    readFile(new URL("components/public-website.tsx", root), "utf8"),
    readFile(new URL("lib/default-theme.ts", root), "utf8"),
    readFile(new URL("app/dashboard/content/page.tsx", root), "utf8"),
  ]);

  // The site pulls each collection out of application state…
  assert.match(publicSite, /const \{ business, theme, sections, services, testimonials, faqs, stats, processSteps, team, menuItems, categories, gallery \} = state;/);
  // …and renders every section the default template declares.
  for (const id of ["stats", "about", "services", "process", "menus", "gallery", "team", "testimonials", "faq", "contact", "quote"]) {
    assert.match(publicSite, new RegExp(`case "${id}":`), `the public site should render the "${id}" section`);
  }
  // No seeded sample copy may be duplicated inside the renderer — every business's
  // real content comes from Supabase, not from any local seed data.
  assert.doesNotMatch(publicSite, /How far in advance should we book/);
  assert.doesNotMatch(publicSite, /Olive & Ember/);
  assert.doesNotMatch(publicSite, /useApp/);
  assert.match(defaultTheme, /export const defaultSections/);

  // Each collection is editable from the dashboard.
  for (const key of ["services", "stats", "processSteps", "team", "testimonials", "faqs"]) {
    assert.match(contentEditor, new RegExp(`key: "${key}"`), `the content editor should manage "${key}"`);
  }
});

test("theme switches customers can toggle actually change the rendered site", async () => {
  const [publicSite, designEditor] = await Promise.all([
    readFile(new URL("components/public-website.tsx", root), "utf8"),
    readFile(new URL("app/dashboard/design/page.tsx", root), "utf8"),
  ]);
  for (const flag of ["showMenuPrices", "showDietaryLabels", "showAllergens", "showOpeningHours", "showSocialLinks", "menuItemLimit", "galleryLimit", "serviceLayout", "headingScale"]) {
    assert.match(publicSite, new RegExp(`theme\\.${flag}`), `the public site should honor theme.${flag}`);
    assert.match(designEditor, new RegExp(flag), `the design editor should expose ${flag}`);
  }
});

test("image uploads are authenticated, validated, and stored via Vercel Blob", async () => {
  const uploadRoute = await readFile(new URL("app/api/uploads/route.ts", root), "utf8");
  assert.match(uploadRoute, /allowedTypes/);
  assert.match(uploadRoute, /@vercel\/blob/);
  assert.match(uploadRoute, /put\(/);
  // Blob storage costs money — anonymous callers must never reach it.
  assert.match(uploadRoute, /auth\.getUser\(\)/);
  assert.match(uploadRoute, /status: 401/);
  assert.match(uploadRoute, /hasImageSignature/);
});

test("the dashboard reports measured data instead of invented numbers", async () => {
  const overview = await readFile(new URL("app/dashboard/page.tsx", root), "utf8");
  for (const invented of ["1,284", "+18%", "84%", "9:42", "31%"]) {
    assert.doesNotMatch(overview, new RegExp(invented.replace(/[+.]/g, "\\$&")), `the overview must not hardcode "${invented}"`);
  }
  assert.match(overview, /leadSummary|viewSummary|profileCompletion/, "metrics come from the analytics module");
  assert.match(overview, /state\.business\.published/, "the live/offline banner follows the real publish flag");
});

test("generated sites are discoverable: robots, sitemap, canonical, structured data", async () => {
  const [robots, sitemap, sitePage] = await Promise.all([
    readFile(new URL("app/robots.ts", root), "utf8"),
    readFile(new URL("app/sitemap.ts", root), "utf8"),
    readFile(new URL("app/site/[businessSlug]/page.tsx", root), "utf8"),
  ]);
  assert.match(robots, /\/dashboard/, "private routes stay out of the index");
  assert.match(sitemap, /published/, "only published sites are listed");
  assert.match(sitePage, /application\/ld\+json/);
  assert.match(sitePage, /alternates: \{ canonical/);
});

test("overlays and customer images behave for keyboard and offline users", async () => {
  const [publicSite, siteImage, modal] = await Promise.all([
    readFile(new URL("components/public-website.tsx", root), "utf8"),
    readFile(new URL("components/site-image.tsx", root), "utf8"),
    readFile(new URL("components/use-modal-behavior.ts", root), "utf8"),
  ]);
  assert.match(modal, /Escape/);
  assert.match(modal, /overflow = "hidden"/, "the page behind a dialog must not scroll");
  assert.match(publicSite, /useModalBehavior/);
  assert.match(publicSite, /skip-link/);
  // Reassigning `src` in onError loops forever when the fallback is broken too.
  assert.doesNotMatch(publicSite, /currentTarget\.src =/);
  assert.match(siteImage, /"broken"/);
});

test("the quote form defends against spam and impossible dates", async () => {
  const [form, schema, route] = await Promise.all([
    readFile(new URL("components/quote-request-form.tsx", root), "utf8"),
    readFile(new URL("lib/lead-schema.ts", root), "utf8"),
    readFile(new URL("app/api/leads/route.ts", root), "utf8"),
  ]);

  assert.match(form, /form-honeypot/);
  assert.match(form, /source: attribution\.current\.source/, "leads record where they came from");

  // The browser may no longer write to the table: everything goes through the
  // route, so the spam checks cannot be skipped by not running the client.
  assert.match(form, /fetch\("\/api\/leads"/, "submission goes through the API route");
  assert.doesNotMatch(form, /from\("leads"\)\.insert/, "no direct anon insert may remain");

  assert.match(schema, /Choose a date in the future/, "the date rule is shared by both sides");
  assert.match(route, /leadSchema/, "the route validates with the same schema");
  assert.match(route, /honeypot/);
  assert.match(route, /elapsedMs/);
  assert.match(route, /submit_lead/, "inserts run through the security-definer function");
});

test("no page reads or writes local/demo state — everything is backed by Supabase", async () => {
  const guardedFiles = [
    "app/login/page.tsx",
    "app/signup/page.tsx",
    "app/onboarding/page.tsx",
    "app/dashboard/layout.tsx",
    "app/preview/layout.tsx",
    "components/app-provider.tsx",
    "components/quote-request-form.tsx",
  ];
  const contents = await Promise.all(guardedFiles.map(file => readFile(new URL(file, root), "utf8")));
  contents.forEach((content, index) => {
    assert.doesNotMatch(content, /localStorage/, `${guardedFiles[index]} should not touch localStorage`);
  });

  const [appProvider, getBusinessBundle] = await Promise.all([
    readFile(new URL("components/app-provider.tsx", root), "utf8"),
    readFile(new URL("lib/supabase/get-business-bundle.ts", root), "utf8"),
  ]);
  assert.match(appProvider, /initialState/, "AppProvider should be seeded from server-fetched state, not demo data");
  assert.match(getBusinessBundle, /getBusinessBundleForUser/);
});
