"use client";

import { RotateCcw, Save } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { TemplateCard } from "@/components/template-card";
import { WebsitePreview } from "@/components/website-preview";
import { useApp } from "@/components/app-provider";
import { Button, Field } from "@/components/ui";
import type { TemplateName } from "@/lib/types";
import { initialData } from "@/lib/demo-data";

export default function DesignEditorPage() {
  const { state, setState, notify } = useApp();
  const update = (patch: Partial<typeof state.theme>) => setState(current => ({ ...current, theme: { ...current.theme, ...patch } }));
  return (
    <DashboardShell title="Design" description="Tune the visual system behind your website." actions={<Button onClick={() => notify("Design changes saved")}><Save size={16} /> Save design</Button>}>
      <div className="design-editor-layout">
        <div className="design-controls">
          <section className="control-section"><div className="control-section-heading"><span>01</span><div><h2>Template</h2><p>Choose the structure and overall mood.</p></div></div><div className="compact-template-list">{(["editorial", "modern", "warm"] as TemplateName[]).map(value => <TemplateCard compact key={value} value={value} selected={state.theme.template === value} onSelect={() => update({ template: value })} />)}</div></section>
          <section className="control-section"><div className="control-section-heading"><span>02</span><div><h2>Colors</h2><p>Set your core brand palette.</p></div></div><div className="form-grid"><Field label="Primary"><div className="color-control"><input type="color" value={state.theme.primary} onChange={e => update({ primary: e.target.value })} /><input value={state.theme.primary} onChange={e => update({ primary: e.target.value })} /></div></Field><Field label="Accent"><div className="color-control"><input type="color" value={state.theme.accent} onChange={e => update({ accent: e.target.value })} /><input value={state.theme.accent} onChange={e => update({ accent: e.target.value })} /></div></Field></div></section>
          <section className="control-section"><div className="control-section-heading"><span>03</span><div><h2>Typography</h2><p>Choose expressive headings and readable body type.</p></div></div><div className="form-grid"><Field label="Heading font"><select value={state.theme.headingFont} onChange={e => update({ headingFont: e.target.value })}>{["Cormorant", "Playfair", "Fraunces", "Inter"].map(value => <option key={value}>{value}</option>)}</select></Field><Field label="Body font"><select value={state.theme.bodyFont} onChange={e => update({ bodyFont: e.target.value })}>{["Inter", "Source Sans", "DM Sans", "Lato"].map(value => <option key={value}>{value}</option>)}</select></Field></div></section>
          <section className="control-section"><div className="control-section-heading"><span>04</span><div><h2>Details</h2><p>Fine-tune shapes, spacing, and navigation.</p></div></div><DesignChoice label="Button shape" value={state.theme.buttonShape} options={["square", "soft", "pill"]} onChange={value => update({ buttonShape: value as typeof state.theme.buttonShape })} /><DesignChoice label="Image corners" value={state.theme.imageCorners} options={["square", "soft", "rounded"]} onChange={value => update({ imageCorners: value as typeof state.theme.imageCorners })} /><DesignChoice label="Section spacing" value={state.theme.sectionSpacing} options={["compact", "comfortable", "spacious"]} onChange={value => update({ sectionSpacing: value as typeof state.theme.sectionSpacing })} /><DesignChoice label="Navigation" value={state.theme.navigation} options={["minimal", "centered", "classic"]} onChange={value => update({ navigation: value as typeof state.theme.navigation })} /></section>
          <button className="reset-design" onClick={() => { setState(current => ({ ...current, theme: initialData.theme })); notify("Template defaults restored"); }}><RotateCcw size={16} /> Reset to template defaults</button>
        </div>
        <aside className="design-preview-sticky"><div><span>Live website preview</span><small>All changes appear instantly</small></div><div className="design-preview-frame"><WebsitePreview /></div></aside>
      </div>
    </DashboardShell>
  );
}

function DesignChoice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="design-choice"><span>{label}</span><div>{options.map(option => <button key={option} className={value === option ? "active" : ""} onClick={() => onChange(option)}>{option}</button>)}</div></div>;
}
