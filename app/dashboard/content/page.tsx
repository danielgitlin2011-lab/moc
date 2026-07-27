"use client";

import { ChevronDown, ChevronUp, HelpCircle, ListOrdered, MessageSquareQuote, Plus, Save, Sparkles, Star, Trash2, Users, Utensils } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useApp } from "@/components/app-provider";
import { Button, ConfirmDialog, EmptyState, Field } from "@/components/ui";
import { ImageUploader } from "@/components/image-uploader";
import { cn, uid } from "@/lib/utils";
import type { AppState, FaqEntry, ProcessStep, ServiceOffering, StatHighlight, TeamMember, Testimonial } from "@/lib/types";

type CollectionKey = "services" | "stats" | "processSteps" | "team" | "testimonials" | "faqs";

const tabs: { key: CollectionKey; label: string; singular: string; icon: React.ElementType; blurb: string; sectionId: string }[] = [
  { key: "services", singular: "service", label: "Services", icon: Utensils, blurb: "The kinds of events you cater, with pricing and capacity.", sectionId: "services" },
  { key: "stats", singular: "highlight", label: "Highlights", icon: Sparkles, blurb: "The numbers that build trust at a glance.", sectionId: "stats" },
  { key: "processSteps", singular: "step", label: "How it works", icon: ListOrdered, blurb: "The planning journey from first call to event day.", sectionId: "process" },
  { key: "team", singular: "team member", label: "Team", icon: Users, blurb: "The chefs and hosts your clients will work with.", sectionId: "team" },
  { key: "testimonials", singular: "testimonial", label: "Testimonials", icon: MessageSquareQuote, blurb: "Kind words from hosts you have already served.", sectionId: "testimonials" },
  { key: "faqs", singular: "question", label: "FAQ", icon: HelpCircle, blurb: "Answers that save you repeat emails and calls.", sectionId: "faq" },
];

const blanks: Record<CollectionKey, () => { id: string }> = {
  services: (): ServiceOffering => ({ id: uid("service"), title: "New service", description: "", image: "", priceFrom: "", capacity: "", highlights: [] }),
  stats: (): StatHighlight => ({ id: uid("stat"), value: "", label: "" }),
  processSteps: (): ProcessStep => ({ id: uid("step"), title: "New step", description: "", duration: "" }),
  team: (): TeamMember => ({ id: uid("member"), name: "New team member", role: "", bio: "", image: "" }),
  testimonials: (): Testimonial => ({ id: uid("testimonial"), quote: "", author: "", context: "", rating: 5, eventDate: "" }),
  faqs: (): FaqEntry => ({ id: uid("faq"), question: "New question", answer: "" }),
};

export default function ContentPage() {
  const { state, setState, notify } = useApp();
  const [tab, setTab] = useState<CollectionKey>("services");
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const activeTab = tabs.find(entry => entry.key === tab)!;
  const items = state[tab] as { id: string }[];
  const section = state.sections.find(entry => entry.id === activeTab.sectionId);

  const mutate = (transform: (list: { id: string }[]) => { id: string }[]) =>
    setState(current => ({ ...current, [tab]: transform(current[tab] as { id: string }[]) } as AppState));
  const update = (id: string, patch: Record<string, unknown>) => mutate(list => list.map(entry => entry.id === id ? { ...entry, ...patch } : entry));
  const move = (index: number, direction: -1 | 1) => mutate(list => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return list;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const add = () => { mutate(list => [...list, blanks[tab]()]); notify(`New ${activeTab.singular} added`); };
  const remove = (id: string) => { mutate(list => list.filter(entry => entry.id !== id)); notify(`${activeTab.singular} deleted`); };

  return (
    <DashboardShell
      title="Content"
      description="Everything your website says beyond the main section headlines."
      actions={<Button onClick={() => notify("Content saved")}><Save size={16} /> Save content</Button>}
    >
      <div className="content-tabs" role="tablist" aria-label="Content collections">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} className={cn(tab === key && "active")} onClick={() => setTab(key)}>
            <Icon size={16} /> {label} <b>{(state[key] as unknown[]).length}</b>
          </button>
        ))}
      </div>

      <div className="content-editor-head">
        <div>
          <span>{activeTab.label}</span>
          <h2>{section?.title || activeTab.label}</h2>
          <p>{activeTab.blurb}</p>
        </div>
        <div className="content-head-side">
          {section && (
            <label className="switch-row">
              <span>{section.visible ? "Visible on your website" : "Hidden from your website"}</span>
              <span className="switch">
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={event => setState(current => ({ ...current, sections: current.sections.map(entry => entry.id === section.id ? { ...entry, visible: event.target.checked } : entry) }))}
                />
                <i />
              </span>
            </label>
          )}
          <Button variant="secondary" onClick={add}><Plus size={16} /> Add {activeTab.singular}</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<activeTab.icon />}
          title={`No ${activeTab.label.toLowerCase()} yet`}
          body={`${activeTab.blurb} This section stays hidden on your website until you add an entry.`}
          action={<Button onClick={add}><Plus size={16} /> Add the first one</Button>}
        />
      ) : (
        <div className={cn("content-list", tab === "stats" && "content-list-compact")}>
          {items.map((item, index) => (
            <article className="content-item" key={item.id}>
              <header>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{entryTitle(tab, item)}</strong>
                <div className="content-item-actions">
                  <button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ChevronUp size={16} /></button>
                  <button onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down"><ChevronDown size={16} /></button>
                  <button className="danger-text" onClick={() => setDeleting({ id: item.id, name: entryTitle(tab, item) })} aria-label="Delete entry"><Trash2 size={16} /></button>
                </div>
              </header>
              <div className="content-item-fields">{renderFields(tab, item, update)}</div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this entry?"
        body={`“${deleting?.name || "This entry"}” will be removed from your dashboard and website.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => { if (deleting) remove(deleting.id); setDeleting(null); }}
      />
    </DashboardShell>
  );
}

function entryTitle(tab: CollectionKey, item: { id: string }) {
  const entry = item as Record<string, unknown>;
  const value = (entry.title || entry.name || entry.question || entry.author || entry.value || "Untitled") as string;
  return String(value).trim() || "Untitled";
}

function renderFields(tab: CollectionKey, item: { id: string }, update: (id: string, patch: Record<string, unknown>) => void) {
  const set = (patch: Record<string, unknown>) => update(item.id, patch);
  switch (tab) {
    case "services": {
      const service = item as ServiceOffering;
      return (
        <>
          <Field label="Service name"><input value={service.title} onChange={event => set({ title: event.target.value })} /></Field>
          <Field label="Description"><textarea rows={3} value={service.description} onChange={event => set({ description: event.target.value })} placeholder="What this kind of event looks like with you." /></Field>
          <div className="form-grid">
            <Field label="Price from" hint="Shown as a pill on the service card"><input value={service.priceFrom} onChange={event => set({ priceFrom: event.target.value })} placeholder="$145 per guest" /></Field>
            <Field label="Guest capacity"><input value={service.capacity} onChange={event => set({ capacity: event.target.value })} placeholder="40–350 guests" /></Field>
          </div>
          <Field label="What is included" hint="Separate each point with a comma"><input value={service.highlights.join(", ")} onChange={event => set({ highlights: splitList(event.target.value) })} placeholder="Tasting for two, Full service staff" /></Field>
          <Field label="Service image"><ImageUploader compact value={service.image} onChange={image => set({ image })} /></Field>
        </>
      );
    }
    case "stats": {
      const stat = item as StatHighlight;
      return (
        <div className="form-grid">
          <Field label="Number"><input value={stat.value} onChange={event => set({ value: event.target.value })} placeholder="640" /></Field>
          <Field label="What it measures"><input value={stat.label} onChange={event => set({ label: event.target.value })} placeholder="Events catered since 2014" /></Field>
        </div>
      );
    }
    case "processSteps": {
      const step = item as ProcessStep;
      return (
        <>
          <div className="form-grid">
            <Field label="Step title"><input value={step.title} onChange={event => set({ title: event.target.value })} /></Field>
            <Field label="Timing"><input value={step.duration} onChange={event => set({ duration: event.target.value })} placeholder="Within 2 days" /></Field>
          </div>
          <Field label="What happens"><textarea rows={3} value={step.description} onChange={event => set({ description: event.target.value })} /></Field>
        </>
      );
    }
    case "team": {
      const member = item as TeamMember;
      return (
        <>
          <div className="form-grid">
            <Field label="Name"><input value={member.name} onChange={event => set({ name: event.target.value })} /></Field>
            <Field label="Role"><input value={member.role} onChange={event => set({ role: event.target.value })} placeholder="Executive chef" /></Field>
          </div>
          <Field label="Short bio"><textarea rows={3} value={member.bio} onChange={event => set({ bio: event.target.value })} /></Field>
          <Field label="Portrait"><ImageUploader compact value={member.image} onChange={image => set({ image })} /></Field>
        </>
      );
    }
    case "testimonials": {
      const testimonial = item as Testimonial;
      return (
        <>
          <Field label="What they said"><textarea rows={3} value={testimonial.quote} onChange={event => set({ quote: event.target.value })} /></Field>
          <div className="form-grid">
            <Field label="Who said it"><input value={testimonial.author} onChange={event => set({ author: event.target.value })} placeholder="Rachel & Levi" /></Field>
            <Field label="Event and place"><input value={testimonial.context} onChange={event => set({ context: event.target.value })} placeholder="Wedding · Miami Beach" /></Field>
            <Field label="When"><input value={testimonial.eventDate} onChange={event => set({ eventDate: event.target.value })} placeholder="March 2026" /></Field>
            <Field label="Rating">
              <div className="rating-picker">
                {[1, 2, 3, 4, 5].map(value => (
                  <button type="button" key={value} className={cn(value <= testimonial.rating && "active")} onClick={() => set({ rating: value })} aria-label={`${value} star${value > 1 ? "s" : ""}`}>
                    <Star size={16} fill={value <= testimonial.rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </>
      );
    }
    case "faqs": {
      const faq = item as FaqEntry;
      return (
        <>
          <Field label="Question"><input value={faq.question} onChange={event => set({ question: event.target.value })} /></Field>
          <Field label="Answer"><textarea rows={4} value={faq.answer} onChange={event => set({ answer: event.target.value })} /></Field>
        </>
      );
    }
  }
}

function splitList(value: string) {
  return value.split(",").map(entry => entry.trim()).filter(Boolean);
}
