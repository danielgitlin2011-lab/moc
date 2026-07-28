import { put } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
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
  // Uploads write to shared blob storage and cost money — signed-in owners only.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Please log in again to upload images." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

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

  const extension = extensionByType[file.type];
  const key = `${user.id}/${crypto.randomUUID()}.${extension}`;

  try {
    const blob = await put(key, file, { access: "public", contentType: file.type });
    return Response.json({ url: blob.url });
  } catch {
    return Response.json({ error: "The image could not be stored. Please try again." }, { status: 502 });
  }
}
