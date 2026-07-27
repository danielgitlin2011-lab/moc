"use client";

import { ArrowRight, ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, ImagePlus, ListPlus, Monitor, RotateCcw, Save, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { WebsitePreview } from "@/components/website-preview";
import { useApp } from "@/components/app-provider";
import { Button, Field } from "@/components/ui";
import { cn } from "@/lib/utils";
import { initialData } from "@/lib/demo-data";
import { ImageUploader } from "@/components/image-uploader";

const collectionSections: Record<string, string> = {
  stats: "Manage your highlights",
  services: "Manage your services",
  process: "Manage your planning steps",
  team: "Manage your team",
  testimonials: "Manage your testimonials",
  faq: "Manage your questions",
};

export default function WebsiteEditorPage() {
  const { state, setState, notify } = useApp();
  const [activeId, setActiveId] = useState("hero");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const active = state.sections.find(section => section.id === activeId)!;

  const updateSection = (patch: Partial<typeof active>) => setState(current => ({ ...current, sections: current.sections.map(section => section.id === activeId ? { ...section, ...patch } : section) }));
  const move = (direction: -1 | 1) => setState(current => {
    const index = current.sections.findIndex(section => section.id === activeId);
    const target = index + direction;
    if (target < 0 || target >= current.sections.length) return current;
    const sections = [...current.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    return { ...current, sections };
  });
  const resetSection = () => {
    const original = initialData.sections.find(section => section.id === activeId);
    if (original) updateSection(original);
    notify(`${active.label} content reset`);
  };

  return (
    <DashboardShell title="Website content" description="Shape each section while your layout stays beautifully structured." actions={<Button onClick={() => notify("Website changes saved")}><Save size={16} /> Save changes</Button>}>
      <div className="mobile-editor-tabs"><button className={mobileTab === "edit" ? "active" : ""} onClick={() => setMobileTab("edit")}>Edit</button><button className={mobileTab === "preview" ? "active" : ""} onClick={() => setMobileTab("preview")}>Preview</button></div>
      <div className="website-editor-layout">
        <div className={cn("section-list-panel", mobileTab !== "edit" && "mobile-hidden")}>
          <div className="editor-intro"><h2>Page sections</h2><p>Choose a section to edit, show, hide, or reorder.</p></div>
          <div className="section-list">{state.sections.map((section) => <button key={section.id} className={cn(activeId === section.id && "active")} onClick={() => setActiveId(section.id)}><GripVertical size={16} /><span><strong>{section.label}</strong><small>{section.visible ? "Visible" : "Hidden"}</small></span>{section.visible ? <Eye size={15} /> : <EyeOff size={15} />}{activeId === section.id && <i />}</button>)}</div>
          <div className="section-editor">
            <div className="section-editor-heading"><div><span>Editing section</span><h3>{active.label}</h3></div><label className="switch"><input type="checkbox" checked={active.visible} onChange={e => updateSection({ visible: e.target.checked })} /><i /></label></div>
            <Field label="Small section label"><input value={active.eyebrow} onChange={e => updateSection({ eyebrow: e.target.value })} placeholder="A short eyebrow label" /></Field>
            <Field label="Section headline"><input value={active.title} onChange={e => updateSection({ title: e.target.value })} /></Field>
            <Field label="Supporting text"><textarea rows={4} value={active.body} onChange={e => updateSection({ body: e.target.value })} /></Field>
            {active.ctaLabel !== undefined && <Field label="Primary button text"><input value={active.ctaLabel} onChange={e => updateSection({ ctaLabel: e.target.value })} /></Field>}
            {active.secondaryCtaLabel !== undefined && <Field label="Secondary button text"><input value={active.secondaryCtaLabel} onChange={e => updateSection({ secondaryCtaLabel: e.target.value })} /></Field>}
            {collectionSections[activeId] && <Link className="editor-jump-link" href="/dashboard/content"><ListPlus size={15} /><span><strong>{collectionSections[activeId]}</strong><small>The headline above is section copy. Edit the entries themselves in Content.</small></span><ArrowRight size={14} /></Link>}
            {activeId === "hero" && <div className="editor-media-block"><div><ImagePlus size={16} /><span><strong>Hero image</strong><small>Upload a wide, high-resolution event image.</small></span></div><ImageUploader compact value={state.theme.heroImage} onChange={heroImage => setState(current => ({ ...current, theme: { ...current.theme, heroImage } }))} /></div>}
            {activeId === "about" && <div className="editor-media-stack"><div className="editor-media-block"><div><ImagePlus size={16} /><span><strong>Chef or team image</strong><small>The main portrait in your story section.</small></span></div><ImageUploader compact value={state.theme.aboutImage} onChange={aboutImage => setState(current => ({ ...current, theme: { ...current.theme, aboutImage } }))} /></div><div className="editor-media-block"><div><ImagePlus size={16} /><span><strong>Supporting detail image</strong><small>Food, tablescape, or behind-the-scenes detail.</small></span></div><ImageUploader compact value={state.theme.detailImage} onChange={detailImage => setState(current => ({ ...current, theme: { ...current.theme, detailImage } }))} /></div></div>}
            <div className="section-tools"><div><button onClick={() => move(-1)} disabled={state.sections[0].id === activeId} title="Move section up"><ChevronUp size={16} /> Move up</button><button onClick={() => move(1)} disabled={state.sections.at(-1)?.id === activeId} title="Move section down"><ChevronDown size={16} /> Move down</button></div><button onClick={resetSection}><RotateCcw size={15} /> Reset content</button></div>
          </div>
        </div>
        <div className={cn("live-preview-panel", mobileTab !== "preview" && "mobile-hidden")}>
          <div className="preview-panel-toolbar"><div><Monitor size={16} /><Smartphone size={15} /></div><span>Live preview</span><small>Updates automatically</small></div>
          <div className="preview-scroll"><WebsitePreview /></div>
        </div>
      </div>
    </DashboardShell>
  );
}
