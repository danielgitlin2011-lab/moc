import assert from "node:assert/strict";
import test from "node:test";
import { ownsBlobUrl } from "../lib/blob-ownership.ts";

const USER = "6f1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9";
const OTHER = "00000000-1111-2222-3333-444444444444";
const host = "https://abc123.public.blob.vercel-storage.com";

test("a user's own blob is recognised", () => {
  assert.equal(ownsBlobUrl(`${host}/${USER}/photo.jpg`, USER), true);
  assert.equal(ownsBlobUrl(`${host}/${USER}/nested/photo.jpg`, USER), true);
});

test("deletion cannot be aimed at another account", () => {
  // The whole point of the check: the URL comes from the client.
  assert.equal(ownsBlobUrl(`${host}/${OTHER}/photo.jpg`, USER), false);
  assert.equal(ownsBlobUrl(`${host}/${USER}-evil/photo.jpg`, USER), false, "the id must end at a separator");
  assert.equal(ownsBlobUrl(`${host}/prefix${USER}/photo.jpg`, USER), false);
});

test("only real Blob hosts over https qualify", () => {
  assert.equal(ownsBlobUrl(`http://abc.public.blob.vercel-storage.com/${USER}/a.jpg`, USER), false, "plaintext is refused");
  assert.equal(ownsBlobUrl(`https://evil.example.com/${USER}/a.jpg`, USER), false);
  assert.equal(
    ownsBlobUrl(`https://public.blob.vercel-storage.com.evil.example/${USER}/a.jpg`, USER),
    false,
    "a lookalike suffix must not pass",
  );
});

test("unusable input is simply not owned", () => {
  assert.equal(ownsBlobUrl("", USER), false);
  assert.equal(ownsBlobUrl("not a url", USER), false);
  assert.equal(ownsBlobUrl(`${host}/${USER}/a.jpg`, ""), false);
});
