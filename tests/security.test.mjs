import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../lib/json-ld.ts";
import { safeHttpUrl } from "../lib/utils.ts";

test("a business name containing </script> cannot close the JSON-LD block", () => {
  const hostile = '</script><script>alert(document.cookie)</script>';
  const payload = serializeJsonLd({ "@type": "Caterer", name: hostile });

  // The one property that matters: nothing in the output can terminate the
  // <script> element the browser is currently parsing.
  assert.ok(!payload.includes("</script>"), "the closing tag must not survive serialisation");
  assert.ok(!payload.includes("<"), "no raw < may reach the document at all");
  assert.match(payload, /\\u003c/, "< is emitted as its JSON unicode escape");

  // …and the escaping must be lossless: the consumer still reads the real name.
  assert.equal(JSON.parse(payload).name, hostile);
});

test("serializeJsonLd escapes the characters an HTML or JS parser reacts to", () => {
  const payload = serializeJsonLd({ a: "<", b: ">", c: "&", d: "\u2028", e: "\u2029" });
  for (const raw of ["<", ">", "&", "\u2028", "\u2029"]) {
    assert.ok(!payload.includes(raw), `${JSON.stringify(raw)} must not appear raw`);
  }
  assert.deepEqual(JSON.parse(payload), { a: "<", b: ">", c: "&", d: "\u2028", e: "\u2029" });
});

test("safeHttpUrl passes http(s) through and rejects every executable scheme", () => {
  assert.equal(safeHttpUrl("https://example.com/photo.jpg"), "https://example.com/photo.jpg");
  assert.equal(safeHttpUrl("  http://example.com/  "), "http://example.com/", "surrounding space is trimmed");

  for (const hostile of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "  javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "blob:https://example.com/abc",
  ]) {
    assert.equal(safeHttpUrl(hostile), "", `${hostile} must not survive`);
  }
});

test("safeHttpUrl treats unusable input as 'not set' rather than throwing", () => {
  assert.equal(safeHttpUrl(""), "");
  assert.equal(safeHttpUrl(null), "");
  assert.equal(safeHttpUrl(undefined), "");
  assert.equal(safeHttpUrl("not a url"), "");
  assert.equal(safeHttpUrl("/relative/path.png"), "", "every stored URL is absolute");
});
