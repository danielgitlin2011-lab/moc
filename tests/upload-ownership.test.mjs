import assert from "node:assert/strict";
import test from "node:test";
import { ownsUploadUrl, uploadPathFromUrl } from "../lib/upload-ownership.ts";

const USER = "6f1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9";
const OTHER = "00000000-1111-2222-3333-444444444444";
const ORIGIN = "https://demo-project.supabase.co";
const prefix = `${ORIGIN}/storage/v1/object/public/images`;

process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGIN;

test("a user's own upload is recognised", () => {
  assert.equal(ownsUploadUrl(`${prefix}/${USER}/photo.jpg`, USER), true);
  assert.equal(ownsUploadUrl(`${prefix}/${USER}/nested/photo.jpg`, USER), true);
});

test("deletion cannot be aimed at another account", () => {
  // The whole point of the check: the URL comes from the client.
  assert.equal(ownsUploadUrl(`${prefix}/${OTHER}/photo.jpg`, USER), false);
  assert.equal(ownsUploadUrl(`${prefix}/${USER}-evil/photo.jpg`, USER), false, "the id must end at a separator");
  assert.equal(ownsUploadUrl(`${prefix}/prefix${USER}/photo.jpg`, USER), false);
});

test("only this project's Supabase origin qualifies", () => {
  assert.equal(ownsUploadUrl(`http://demo-project.supabase.co/storage/v1/object/public/images/${USER}/a.jpg`, USER), false, "the protocol must match too");
  assert.equal(ownsUploadUrl(`https://evil.example.com/storage/v1/object/public/images/${USER}/a.jpg`, USER), false);
  assert.equal(
    ownsUploadUrl(`https://demo-project.supabase.co.evil.example/storage/v1/object/public/images/${USER}/a.jpg`, USER),
    false,
    "a lookalike suffix must not pass",
  );
  assert.equal(ownsUploadUrl(`${ORIGIN}/storage/v1/object/public/other-bucket/${USER}/a.jpg`, USER), false, "only the images bucket");
});

test("unusable input is simply not owned", () => {
  assert.equal(ownsUploadUrl("", USER), false);
  assert.equal(ownsUploadUrl("not a url", USER), false);
  assert.equal(ownsUploadUrl(`${prefix}/${USER}/a.jpg`, ""), false);
});

test("a missing storage origin denies everything rather than guessing", () => {
  const saved = process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    assert.equal(ownsUploadUrl(`${prefix}/${USER}/a.jpg`, USER), false);
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_URL = saved;
  }
});

test("the bucket path behind a public URL round-trips", () => {
  assert.equal(uploadPathFromUrl(`${prefix}/${USER}/photo.jpg`), `${USER}/photo.jpg`);
  assert.equal(uploadPathFromUrl(`${ORIGIN}/somewhere/else.jpg`), "");
  assert.equal(uploadPathFromUrl("not a url"), "");
});
