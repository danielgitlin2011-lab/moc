import assert from "node:assert/strict";
import test from "node:test";

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const environment = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const context = { waitUntil() {}, passThroughOnException() {} };

async function render(worker, path) {
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    environment,
    context,
  );
}

test("server-renders the ServeSite marketing experience", async () => {
  const worker = await getWorker();
  const response = await render(worker, "/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /ServeSite/);
  assert.match(html, /Your catering website, menu, and leads/);
  assert.match(html, /Create your website/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("all customer journey routes return successful HTML", async () => {
  const worker = await getWorker();
  const routes = [
    "/login",
    "/onboarding",
    "/dashboard",
    "/dashboard/website",
    "/dashboard/design",
    "/dashboard/menu",
    "/dashboard/gallery",
    "/dashboard/leads",
    "/dashboard/settings",
    "/preview",
    "/site/olive-and-ember",
  ];
  for (const route of routes) {
    const response = await render(worker, route);
    assert.equal(response.status, 200, `${route} should return 200`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  }
});
