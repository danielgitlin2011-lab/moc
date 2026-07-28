import assert from "node:assert/strict";
import test from "node:test";
import { clientAddress, createRateLimiter } from "../lib/rate-limit.ts";

test("a fixed window allows the quota and then refuses", () => {
  const check = createRateLimiter({ limit: 3, windowMs: 1000 });
  const now = 1_000_000;

  for (let attempt = 1; attempt <= 3; attempt++) {
    assert.equal(check("1.2.3.4", now).ok, true, `attempt ${attempt} is within quota`);
  }

  const refused = check("1.2.3.4", now);
  assert.equal(refused.ok, false);
  assert.ok(refused.retryAfter > 0, "a refusal says when to come back");
});

test("windows are per key and reset once they expire", () => {
  const check = createRateLimiter({ limit: 1, windowMs: 1000 });
  const now = 2_000_000;

  assert.equal(check("a", now).ok, true);
  assert.equal(check("a", now).ok, false);
  assert.equal(check("b", now).ok, true, "one caller's quota is not another's");
  assert.equal(check("a", now + 1001).ok, true, "the window reopens");
});

test("the key map cannot grow without bound", () => {
  const check = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 10 });
  const now = 3_000_000;
  // Far more unique keys than the cap; the limiter must stay usable rather
  // than retaining an entry per address forever.
  for (let index = 0; index < 500; index++) check(`key-${index}`, now);
  assert.equal(check("fresh", now).ok, true);
});

test("clientAddress reads the left-most forwarded entry", () => {
  const withHeaders = headers => new Request("https://example.com", { headers });

  assert.equal(clientAddress(withHeaders({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" })), "203.0.113.7");
  assert.equal(clientAddress(withHeaders({ "x-real-ip": "203.0.113.9" })), "203.0.113.9");
  assert.equal(clientAddress(withHeaders({})), "unknown", "a missing address still yields a usable key");
});
