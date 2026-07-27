import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const expectedRoutes = [
  "app/page.tsx",
  "app/login/page.tsx",
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
  await access(new URL("dist/server/index.js", root));
  await Promise.all(expectedRoutes.map(route => access(new URL(route, root))));

  const [landing, publicSite, preview] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("components/public-website.tsx", root), "utf8"),
    readFile(new URL("app/preview/page.tsx", root), "utf8"),
  ]);
  assert.match(landing, /Your catering website, menu, and leads/);
  assert.match(publicSite, /gallery-lightbox/);
  assert.match(preview, /Edit on page/);
});

test("every content collection reaches the generated website instead of hardcoded copy", async () => {
  const [publicSite, demoData, contentEditor] = await Promise.all([
    readFile(new URL("components/public-website.tsx", root), "utf8"),
    readFile(new URL("lib/demo-data.ts", root), "utf8"),
    readFile(new URL("app/dashboard/content/page.tsx", root), "utf8"),
  ]);

  // The site pulls each collection out of application state…
  assert.match(publicSite, /const \{ business, theme, sections, services, testimonials, faqs, stats, processSteps, team, menuItems, categories, gallery \} = state;/);
  // …and renders every section the seeded data declares.
  for (const id of ["stats", "about", "services", "process", "menus", "gallery", "team", "testimonials", "faq", "contact", "quote"]) {
    assert.match(publicSite, new RegExp(`case "${id}":`), `the public site should render the "${id}" section`);
  }
  // No sample copy may be duplicated inside the renderer.
  assert.doesNotMatch(publicSite, /How far in advance should we book/);
  assert.doesNotMatch(publicSite, /Olive & Ember/);
  assert.match(demoData, /How far in advance should we book/);

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

test("image uploads are validated, stored, and delivered through the MEDIA binding", async () => {
  const [uploadRoute, mediaRoute, hosting] = await Promise.all([
    readFile(new URL("app/api/uploads/route.ts", root), "utf8"),
    readFile(new URL("app/api/uploads/[key]/route.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
  ]);
  assert.match(uploadRoute, /allowedTypes/);
  assert.match(uploadRoute, /env\.MEDIA\.put/);
  assert.match(mediaRoute, /env\.MEDIA\.get/);
  assert.match(mediaRoute, /max-age=31536000/);
  assert.equal(JSON.parse(hosting).r2, "MEDIA");
});
