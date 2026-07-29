"use client";

import { ImagePlus, Images, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn, sizedImage } from "@/lib/utils";
import { imageBankFor, type ImageBankCategory } from "@/lib/image-bank";

export function ImageUploader({
  value,
  onChange,
  label = "Upload image",
  hint = "JPG, PNG, WebP or GIF · up to 8 MB",
  compact = false,
  category,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
  /** Offers a "choose from our photo library" picker of stock photos suited to this field, for businesses that don't have their own shot yet. */
  category?: ImageBankCategory;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const libraryImages = category ? imageBankFor(category) : [];

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      onChange(await uploadImageFile(file, value));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The image could not be uploaded.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  /**
   * Clearing a slot also deletes the stored file. Leaving it behind meant a
   * photograph someone removed on purpose stayed reachable at its URL.
   */
  const clear = (url: string) => {
    onChange("");
    void fetch("/api/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => {
      // The slot is already cleared in the UI; a failed cleanup leaves an
      // orphan to sweep, not a broken page.
    });
  };

  return (
    <div className={cn("image-uploader", compact && "compact", value && "has-image")}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => void upload(event.target.files?.[0])} />
      {value ? (
        <div className="upload-preview">
          <img src={value} alt="" />
          <div><button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? <LoaderCircle className="spin" size={16} /> : <ImagePlus size={16} />} Replace</button><button type="button" onClick={() => clear(value)} aria-label="Remove image"><X size={15} /></button></div>
        </div>
      ) : (
        <button
          className="upload-dropzone"
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={event => event.preventDefault()}
          onDrop={event => { event.preventDefault(); void upload(event.dataTransfer.files?.[0]); }}
          disabled={uploading}
        >
          {uploading ? <LoaderCircle className="spin" size={21} /> : <UploadCloud size={21} />}
          <span><strong>{uploading ? "Uploading…" : label}</strong><small>{hint}</small></span>
        </button>
      )}
      {error && <p className="upload-error" role="alert">{error}</p>}
      {libraryImages.length > 0 && (
        <div className="image-library">
          <button type="button" className="image-library-toggle" onClick={() => setLibraryOpen(open => !open)}>
            <Images size={14} /> {libraryOpen ? "Hide photo library" : value ? "Choose a different library photo" : "No photo yet? Choose from our library"}
          </button>
          {libraryOpen && (
            <div className="image-library-grid">
              {libraryImages.map(image => (
                <button type="button" key={image} className={cn("image-library-item", value === image && "active")} onClick={() => { onChange(image); setLibraryOpen(false); }} aria-label="Use this library photo">
                  <img src={sizedImage(image, 240)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Uploads one image and resolves to its public URL. Shared by the single-slot
 * uploader below and the gallery's multi-file flow, so both optimize the file
 * the same way and hit the same server checks.
 */
export async function uploadImageFile(file: File, previousUrl?: string) {
  const optimizedFile = await optimizeImage(file);
  const formData = new FormData();
  formData.append("file", optimizedFile);
  // Tell the server what this replaces, so the old file is removed rather
  // than left public forever. The server re-checks that it is ours.
  if (previousUrl) formData.append("previousUrl", previousUrl);
  const response = await fetch("/api/uploads", { method: "POST", body: formData });
  const result = await response.json() as { url?: string; error?: string };
  if (!response.ok || !result.url) throw new Error(result.error || "The image could not be uploaded.");
  return result.url;
}

async function optimizeImage(file: File) {
  if (file.size < 900_000 || file.type === "image/gif") return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This image could not be read."));
      element.src = objectUrl;
    });
    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", .84));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
