import { createClient } from "@/lib/supabase/server";
import { ownsUploadUrl, uploadPathFromUrl } from "@/lib/upload-ownership";

const BUCKET = "images";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
/**
 * Ceiling on stored images per account.
 *
 * Storage is billed by the byte and an authenticated caller could loop
 * uploads all day. A business with a full gallery, a menu with a photo on
 * every dish, services, and a team lands well under this; anything past it
 * is not a business website.
 */
const MAX_IMAGES_PER_USER = 300;

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Confirms the bytes match the declared type, so a renamed file cannot slip through. */
async function hasImageSignature(file: File, type: string) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...bytes: number[]) => bytes.every((byte, index) => header[index] === byte);

  switch (type) {
    case "image/jpeg":
      return startsWith(0xff, 0xd8, 0xff);
    case "image/png":
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/gif":
      return startsWith(0x47, 0x49, 0x46, 0x38);
    case "image/webp":
      return startsWith(0x52, 0x49, 0x46, 0x46) && [0x57, 0x45, 0x42, 0x50].every((byte, index) => header[8 + index] === byte);
    default:
      return false;
  }
}

export async function POST(request: Request) {
  // Uploads write to shared storage and cost money — signed-in owners only.
  // The Storage policies re-check ownership server-side: this client acts as
  // the signed-in user, and RLS confines writes to their own folder.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Please log in again to upload images." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const previousUrl = formData.get("previousUrl");

  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!allowedTypes.has(file.type)) {
    return Response.json({ error: "Use a JPG, PNG, WebP, or GIF image." }, { status: 415 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return Response.json({ error: "Images must be smaller than 8 MB." }, { status: 413 });
  }
  if (!(await hasImageSignature(file, file.type))) {
    return Response.json({ error: "That file isn't a valid image." }, { status: 415 });
  }

  // Replacing an image does not count against the quota, because the one it
  // replaces is removed below.
  const replacing = typeof previousUrl === "string" && ownsUploadUrl(previousUrl, user.id);
  if (!replacing) {
    // One extra so a full account is distinguishable from an exactly-full one.
    // If the count cannot be read, allow the upload rather than blocking real
    // work on a storage hiccup — the size and type checks above still apply.
    const { data: existing } = await supabase.storage.from(BUCKET).list(user.id, { limit: MAX_IMAGES_PER_USER + 1 });
    if (existing && existing.length >= MAX_IMAGES_PER_USER) {
      return Response.json(
        { error: `You've reached the ${MAX_IMAGES_PER_USER}-image limit. Delete a few images and try again.` },
        { status: 413 },
      );
    }
  }

  const extension = extensionByType[file.type];
  const key = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
    contentType: file.type,
    // Keys are unique per upload, so renditions can be cached hard forever.
    cacheControl: "31536000",
  });
  if (error) {
    return Response.json({ error: "The image could not be stored. Please try again." }, { status: 502 });
  }

  // Only once the replacement is safely stored: the old URL is still what the
  // page renders until this response comes back. A failed cleanup must never
  // fail the upload that triggered it, so the result is deliberately ignored.
  if (replacing) {
    const previousPath = uploadPathFromUrl(previousUrl as string);
    if (previousPath) await supabase.storage.from(BUCKET).remove([previousPath]);
  }

  return Response.json({ url: supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl });
}

/**
 * Removes an image the user cleared from a slot.
 *
 * Without this, "deleted" images stayed public at their original URL forever —
 * a storage cost, and a privacy problem for anyone who removed a photograph
 * because it should not have been published.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Please log in again." }, { status: 401 });
  }

  let url: unknown;
  try {
    ({ url } = (await request.json()) as { url?: unknown });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof url !== "string" || !ownsUploadUrl(url, user.id)) {
    // The same answer whether the URL is malformed or belongs to someone else,
    // so this cannot be used to probe what another account has stored.
    return Response.json({ error: "That image can't be removed." }, { status: 400 });
  }

  const { error } = await supabase.storage.from(BUCKET).remove([uploadPathFromUrl(url)]);
  if (error) {
    return Response.json({ error: "The image could not be removed. Please try again." }, { status: 502 });
  }

  return new Response(null, { status: 204 });
}
