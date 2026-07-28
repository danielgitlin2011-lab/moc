"use client";

import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Monitor, Pencil, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { PublicWebsite } from "@/components/public-website";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/app-provider";
import { Button, Field } from "@/components/ui";
import { ImageUploader } from "@/components/image-uploader";
import { createClient } from "@/lib/supabase/client";
import { sectionToRow } from "@/lib/supabase/mappers";
import type { Json } from "@/lib/supabase/types";
import type { BusinessTheme } from "@/lib/types";

export default function PreviewPage() {
  const { state, setState, businessId, notify } = useApp();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.sections.find(section => section.id === selectedId);

  const persistSection = async (section: NonNullable<typeof selected>, position: number) => {
    try {
      const row = sectionToRow(section, businessId, position);
      const { error } = await createClient().from("website_sections").update(row).eq("business_id", businessId).eq("section_key", section.id);
      if (error) throw error;
    } catch (err) {
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };
  const persistTheme = async (nextTheme: BusinessTheme) => {
    try {
      const { error } = await createClient().from("businesses").update({ theme: nextTheme as unknown as Json }).eq("id", businessId);
      if (error) throw error;
    } catch (err) {
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };

  const updateSection = (patch: Partial<NonNullable<typeof selected>>) => {
    if (!selected) return;
    const next = { ...selected, ...patch };
    const position = state.sections.findIndex(section => section.id === selectedId);
    setState(current => ({ ...current, sections: current.sections.map(section => section.id === selectedId ? next : section) }));
    void persistSection(next, position);
  };
  const updateHeroImage = (heroImage: string) => {
    const next = { ...state.theme, heroImage };
    setState(current => ({ ...current, theme: next }));
    void persistTheme(next);
  };
  return (
    <div className="preview-page">
      <header className="preview-toolbar"><Link href="/dashboard/website"><ArrowLeft size={18} /> Back to editor</Link><div className="preview-toolbar-center"><div className="device-control"><button className={cn(device === "desktop" && "active")} onClick={() => setDevice("desktop")} aria-label="Desktop preview"><Monitor size={18} /></button><button className={cn(device === "mobile" && "active")} onClick={() => setDevice("mobile")} aria-label="Mobile preview"><Smartphone size={18} /></button></div><button className={cn("edit-mode-toggle", editMode && "active")} onClick={() => { setEditMode(value => !value); setSelectedId(null); }}><Pencil size={15} /> {editMode ? "Editing on page" : "Edit on page"}</button></div><Link href={`/site/${state.business.slug}`}>Open live site <ExternalLink size={16} /></Link></header>
      <div className={cn("preview-workspace", editMode && "editing")}>
        <div className={cn("preview-canvas", `preview-${device}`)}><div className="preview-frame"><PublicWebsite state={state} businessId={businessId} preview editable={editMode} onSectionSelect={setSelectedId} /></div></div>
        {editMode && <aside className={cn("on-page-editor", selected && "has-selection")}>
          {selected ? <><header><div><span>Editing on page</span><h2>{selected.label}</h2></div><button onClick={() => setSelectedId(null)} aria-label="Close editing panel"><X size={18} /></button></header><div className="on-page-editor-fields"><Field label="Small section label"><input value={selected.eyebrow} onChange={event => updateSection({ eyebrow: event.target.value })} /></Field><Field label="Headline"><input value={selected.title} onChange={event => updateSection({ title: event.target.value })} /></Field><Field label="Supporting text"><textarea rows={5} value={selected.body} onChange={event => updateSection({ body: event.target.value })} /></Field>{selected.ctaLabel !== undefined && <Field label="Button text"><input value={selected.ctaLabel} onChange={event => updateSection({ ctaLabel: event.target.value })} /></Field>}{selected.id === "hero" && <Field label="Hero image"><ImageUploader compact value={state.theme.heroImage} onChange={updateHeroImage} /></Field>}<label className="inline-toggle-row"><span><strong>Show this section</strong><small>Hidden sections remain available in the main editor.</small></span><span className="switch"><input type="checkbox" checked={selected.visible} onChange={event => updateSection({ visible: event.target.checked })} /><i /></span></label><Button onClick={() => { notify("Section changes saved"); setSelectedId(null); }}><Check size={16} /> Done editing</Button></div></> : <div className="on-page-editor-empty"><Pencil size={24} /><h3>Click any “Edit” label</h3><p>Select a section directly on the site to update its text and media while seeing the final result.</p></div>}
        </aside>}
      </div>
    </div>
  );
}
