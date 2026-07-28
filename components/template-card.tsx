"use client";

import { Check, Monitor, Smartphone } from "lucide-react";
import type { TemplateName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SiteImage } from "./site-image";

const details: Record<TemplateName, { name: string; description: string; headline: string; image: string }> = {
  editorial: {
    name: "Editorial",
    description: "Elegant serif typography with an editorial, premium-events focus.",
    headline: "Gather beautifully.",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80",
  },
  modern: {
    name: "Modern",
    description: "Confident grid layouts and crisp, minimal sans-serif typography.",
    headline: "GOOD FOOD. GREAT COMPANY.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  },
  warm: {
    name: "Warm",
    description: "Friendly, family-style storytelling with soft shapes and rich color.",
    headline: "Made for gathering.",
    image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=900&q=80",
  },
  coastal: {
    name: "Coastal",
    description: "Airy blues and open space for seaside weddings and destination events.",
    headline: "Set the table by the sea.",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
  },
  noir: {
    name: "Noir",
    description: "A dark, dramatic canvas that makes plated dishes and evening events glow.",
    headline: "Dinner, after dark.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
};

export function TemplateCard({ value, selected, onSelect, compact = false, monogram = "O&E" }: { value: TemplateName; selected: boolean; onSelect: () => void; compact?: boolean; monogram?: string }) {
  const item = details[value];
  return (
    <button type="button" className={cn("template-card", selected && "selected", compact && "compact")} onClick={onSelect} aria-pressed={selected}>
      <div className={`template-card-preview card-${value}`}>
        <SiteImage src={item.image} alt="" width={400} />
        <span className="mini-logo">{monogram}</span>
        <b>{item.headline}</b>
        <span className="mini-button">Plan your event</span>
        <div className="device-tags"><Monitor size={12} /><Smartphone size={12} /></div>
        {selected && <i className="selected-check"><Check size={14} /></i>}
      </div>
      <span className="template-card-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
    </button>
  );
}

export const templateNames = Object.keys(details) as TemplateName[];
