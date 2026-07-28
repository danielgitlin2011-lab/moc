import assert from "node:assert/strict";
import test from "node:test";
import { businessInitials, fontStack, formatDate, formatDateTime, parseDate, relativeTime, sizedImage, yearsInBusiness } from "../lib/utils.ts";

test("formatDate handles both calendar dates and database timestamps", () => {
  assert.equal(formatDate("2026-09-01"), "Sep 1, 2026");
  // Leads carry a full timestamptz — this used to render "Invalid Date".
  assert.equal(formatDate("2026-07-28T04:20:18.077529+00:00"), "Jul 28, 2026");
  assert.equal(formatDate(""), "—");
  assert.equal(formatDate("not a date"), "—");
});

test("calendar dates are not shifted by the local timezone", () => {
  const parsed = parseDate("2026-09-01");
  assert.equal(parsed.getDate(), 1);
  assert.equal(parsed.getMonth(), 8);
});

test("formatDateTime keeps the time for timestamped values", () => {
  assert.match(formatDateTime("2026-07-28T15:30:00.000Z"), /Jul 2[89]/);
  assert.equal(formatDateTime("nonsense"), "—");
});

test("relativeTime describes recent activity in human terms", () => {
  const now = new Date("2026-07-28T12:00:00Z");
  assert.equal(relativeTime("2026-07-28T09:00:00Z", now), "today");
  assert.equal(relativeTime("2026-07-26T12:00:00Z", now), "2 days ago");
  assert.match(relativeTime("2026-07-07T12:00:00Z", now), /week/);
  assert.equal(relativeTime("", now), "—");
});

test("businessInitials builds a monogram from any script", () => {
  assert.equal(businessInitials("Olive & Ember Catering"), "OE");
  assert.equal(businessInitials("dandev"), "D");
  assert.equal(businessInitials("מטבח פתוח"), "מפ");
});

test("fontStack pairs a chosen family with a matching fallback", () => {
  assert.match(fontStack("Inter"), /^'Inter', 'Helvetica Neue'/);
  assert.match(fontStack("Cormorant Garamond"), /serif$/);
  assert.doesNotMatch(fontStack(""), /''/);
});

test("sizedImage requests a right-sized rendition, and leaves other hosts alone", () => {
  const resized = new URL(sizedImage("https://images.unsplash.com/photo-123", 800));
  assert.equal(resized.searchParams.get("w"), "800");
  assert.equal(resized.searchParams.get("auto"), "format");

  const stored = "https://demo-project.supabase.co/storage/v1/object/public/images/user/pic.webp";
  assert.equal(sizedImage(stored, 800), stored);
  assert.equal(sizedImage("", 800), "");
});

test("yearsInBusiness ignores unusable founding years", () => {
  assert.equal(yearsInBusiness("2016"), new Date().getFullYear() - 2016);
  assert.equal(yearsInBusiness(""), 0);
  assert.equal(yearsInBusiness("soon"), 0);
  assert.equal(yearsInBusiness("1492"), 0);
});
