import { put } from "@vercel/blob";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
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

  const extension = extensionByType[file.type];
  const key = `${crypto.randomUUID()}.${extension}`;
  const blob = await put(key, file, {
    access: "public",
    contentType: file.type,
  });

  return Response.json({ url: blob.url });
}
