import assert from "node:assert/strict";
import test from "node:test";
import { rankCommands, scoreMatch } from "../lib/command-search.ts";
import { resolveTheme } from "../lib/theme.ts";

test("scoreMatch accepts subsequences and rejects everything else", () => {
  assert.ok(scoreMatch("gal", "Gallery") !== null);
  assert.ok(scoreMatch("wedcake", "Wedding cake") !== null, "letters may be spread across words");
  assert.equal(scoreMatch("zzz", "Gallery"), null);
  assert.equal(scoreMatch("", "Gallery"), 0, "an empty query matches without ranking");
});

test("a prefix match outranks the same letters buried deeper", () => {
  const prefix = scoreMatch("men", "Menu");
  const buried = scoreMatch("men", "Table arrangement for men");
  assert.ok(prefix !== null && buried !== null);
  assert.ok(prefix > buried, "Menu should beat a late, incidental match");
});

test("rankCommands orders by relevance and drops non-matches", () => {
  const items = [
    { id: "a", label: "Settings" },
    { id: "b", label: "Gallery" },
    { id: "c", label: "Grilled aubergine", keywords: "starter vegetarian" },
  ];

  assert.deepEqual(rankCommands("gal", items).map(item => item.id), ["b"], "only Gallery holds a g-a-l subsequence");
  assert.deepEqual(rankCommands("gr", items).map(item => item.id), ["c", "b"], "the closer match leads");

  assert.equal(rankCommands("vegetarian", items)[0].id, "c", "keywords are searchable too");
  assert.equal(rankCommands("xyzzy", items).length, 0);
});

test("rankCommands returns the head of the list when there is no query", () => {
  const items = Array.from({ length: 30 }, (_, index) => ({ id: String(index), label: `Item ${index}` }));
  assert.equal(rankCommands("", items, 5).length, 5);
});

test("resolveTheme only consults the OS when the choice is 'system'", () => {
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
});
