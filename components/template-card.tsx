"use client";

import { Check, Monitor, Smartphone } from "lucide-react";
import type { TemplateName } from "@/lib/types";
import { cn } from "@/lib/utils";

const details = {
  editorial: { name: "Editorial", description: "Elegant serif typography with an editorial, premium-events focus.", image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80" },
  modern: { name: "Modern", description: "Confident grid layouts and crisp, minimal sans-serif typography.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80" },
  warm: { name: "Warm", description: "Friendly, family-style storytelling with soft shapes and rich color.", image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=900&q=80" },
};

export function TemplateCard({ value, selected, onSelect, compact = false }: { value: TemplateName; selected: boolean; onSelect: () => void; compact?: boolean }) {
  const item = details[value];
  return (
    <button type="button" className={cn("template-card", selected && "selected", compact && "compact")} onClick={onSelect} aria-pressed={selected}>
      <div className={`template-card-preview card-${value}`}><img src={item.image} alt="" /><span className="mini-logo">O&amp;E</span><b>{value === "modern" ? "GOOD FOOD. GREAT COMPANY." : value === "warm" ? "Made for gathering." : "Gather beautifully."}</b><span className="mini-button">Plan your event</span><div className="device-tags"><Monitor size={12} /><Smartphone size={12} /></div>{selected && <i className="selected-check"><Check size={14} /></i>}</div>
      <span className="template-card-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
    </button>
  );
}
