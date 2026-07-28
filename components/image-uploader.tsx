"use client";

import { ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ImageUploader({
  value,
  onChange,
  label = "Upload image",
  hint = "JPG, PNG, WebP or GIF · up to 8 MB",
  compact = false,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const optimizedFile = await optimizeImage(file);
      const formData = new FormData();
      formData.append("file", optimizedFile);
      // Tell the server what this replaces, so the old blob is removed rather
      // than left public forever. The server re-checks that it is ours.
      if (value) formData.append("previousUrl", value);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "The image could not be uploaded.");
      onChange(result.url);
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
    </div>
  );
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
