"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn, safeHttpUrl, sizedImage } from "@/lib/utils";

type Source = "primary" | "fallback" | "broken";

function firstSource(src?: string, fallback?: string): Source {
  return src ? "primary" : fallback ? "fallback" : "broken";
}

/**
 * Image for customer-supplied URLs. A broken source falls back exactly once and
 * then degrades to a neutral placeholder — assigning a new `src` inside `onError`
 * (the previous approach) loops forever when the fallback is broken too.
 */
export function SiteImage({
  src: rawSrc,
  fallback: rawFallback = "",
  alt,
  className,
  width,
  priority = false,
  sizes,
}: {
  src?: string;
  fallback?: string;
  alt: string;
  className?: string;
  /** Intrinsic width to request from resizing image hosts. */
  width?: number;
  /** Set on the single largest above-the-fold image only. */
  priority?: boolean;
  sizes?: string;
}) {
  // Every customer-supplied image in the product reaches the DOM through this
  // component, which makes it the one place scheme validation has to happen.
  // A `javascript:` or `data:text/html` URL becomes "no image" rather than a
  // payload, and the placeholder below takes over.
  const src = safeHttpUrl(rawSrc);
  const fallback = safeHttpUrl(rawFallback);

  // New URLs restart at the primary source; adjusting during render (rather than
  // in an effect) avoids rendering the previous image's failure state first.
  const [state, setState] = useState({ src, fallback, source: firstSource(src, fallback) });
  if (state.src !== src || state.fallback !== fallback) {
    setState({ src, fallback, source: firstSource(src, fallback) });
  }
  const source = state.src === src && state.fallback === fallback ? state.source : firstSource(src, fallback);

  if (source === "broken") {
    return (
      <span className={cn("image-placeholder", className)} role="img" aria-label={alt}>
        <ImageOff size={20} aria-hidden="true" />
      </span>
    );
  }

  const url = source === "primary" ? src! : fallback;

  return (
    <img
      className={className}
      src={width ? sizedImage(url, width) : url}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setState(current => ({ ...current, source: current.source === "primary" && fallback ? "fallback" : "broken" }))}
    />
  );
}
