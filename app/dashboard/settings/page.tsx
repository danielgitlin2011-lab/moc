"use client";

import { Bell, Check, ChevronRight, CircleAlert, CreditCard, Globe2, Plus, Save, Settings2, Share2, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useApp } from "@/components/app-provider";
import { Badge, Button, Field } from "@/components/ui";
import { cn, formatDate, uid } from "@/lib/utils";
import type { AppState, Business, OpeningHour, SocialLinks } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { businessToRow } from "@/lib/supabase/mappers";

type SettingsTab = "business" | "policies" | "presence" | "domain" | "notifications" | "subscription";

const socialNetworks: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbusiness" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourbusiness" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourbusiness" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/yourbusiness" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourbusiness" },
];

export default function SettingsPage() {
  const { state, setState, businessId, notify } = useApp();
  const [tab, setTab] = useState<SettingsTab>("business");

  const persistBusiness = async (next: Business) => {
    try {
      const update: Partial<ReturnType<typeof businessToRow>> = businessToRow(next, state.theme, "", { onboarded: state.onboarded, published: next.published });
      delete update.owner_id;
      const { error } = await createClient().from("businesses").update(update).eq("id", businessId);
      if (error) {
        if (error.code === "23505") throw new Error("That website address is already taken — try a different one.");
        throw error;
      }
    } catch (err) {
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };

  const persistNotifications = async (next: AppState["notifications"]) => {
    try {
      const { error } = await createClient().from("businesses").update({ notifications: next }).eq("id", businessId);
      if (error) throw error;
    } catch (err) {
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };

  const setPublished = async (published: boolean) => {
    const publishedAt = published ? new Date().toISOString() : state.publishedAt;
    setState(current => ({ ...current, business: { ...current.business, published }, publishedAt }));
    try {
      const { error } = await createClient().from("businesses").update({ published, published_at: publishedAt }).eq("id", businessId);
      if (error) throw error;
      notify(published ? "Your website is live" : "Your website is now hidden");
    } catch (err) {
      setState(current => ({ ...current, business: { ...current.business, published: !published } }));
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };

  const updateBusiness = <K extends keyof Business>(key: K, value: Business[K]) => {
    const next = { ...state.business, [key]: value };
    setState(current => ({ ...current, business: next }));
    void persistBusiness(next);
  };
  const updateSocial = (key: keyof SocialLinks, value: string) => {
    const next = { ...state.business, social: { ...state.business.social, [key]: value } };
    setState(current => ({ ...current, business: next }));
    void persistBusiness(next);
  };
  const updateHours = (id: string, patch: Partial<OpeningHour>) =>
    updateBusiness("openingHours", state.business.openingHours.map(hour => hour.id === id ? { ...hour, ...patch } : hour));
  const updateNotifications = (patch: Partial<AppState["notifications"]>) => {
    const next = { ...state.notifications, ...patch };
    setState(current => ({ ...current, notifications: next }));
    void persistNotifications(next);
  };
  const list = (value: string) => value.split(",").map(entry => entry.trim()).filter(Boolean);

  return (
    <DashboardShell title="Settings" description="Manage your business profile, policies, domain, notifications, and plan." actions={<Button onClick={() => notify("Settings saved")}><Save size={16} /> Save changes</Button>}>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <button className={cn(tab === "business" && "active")} onClick={() => setTab("business")}><Settings2 size={17} /><span><strong>Business details</strong><small>Profile, contact, and credentials</small></span><ChevronRight size={15} /></button>
          <button className={cn(tab === "policies" && "active")} onClick={() => setTab("policies")}><ShieldCheck size={17} /><span><strong>Booking policies</strong><small>Minimums, deposits, and travel</small></span><ChevronRight size={15} /></button>
          <button className={cn(tab === "presence" && "active")} onClick={() => setTab("presence")}><Share2 size={17} /><span><strong>Hours &amp; social</strong><small>Opening hours and profiles</small></span><ChevronRight size={15} /></button>
          <button className={cn(tab === "domain" && "active")} onClick={() => setTab("domain")}><Globe2 size={17} /><span><strong>Domain</strong><small>Website address and DNS</small></span><ChevronRight size={15} /></button>
          <button className={cn(tab === "notifications" && "active")} onClick={() => setTab("notifications")}><Bell size={17} /><span><strong>Notifications</strong><small>Lead and summary alerts</small></span><ChevronRight size={15} /></button>
          <button className={cn(tab === "subscription" && "active")} onClick={() => setTab("subscription")}><CreditCard size={17} /><span><strong>Subscription</strong><small>Plan and billing</small></span><ChevronRight size={15} /></button>
        </nav>

        <section className="settings-panel">
          {tab === "business" && <>
            <div className="settings-heading"><span>Business profile</span><h2>Business details</h2><p>This information appears across your website, footer, and quote experience.</p></div>
            <div className="settings-form">
              <div className="form-grid">
                <Field label="Business name"><input value={state.business.name} onChange={e => updateBusiness("name", e.target.value)} /></Field>
                <Field label="Business type" hint="Shown as the hero label"><input value={state.business.type} onChange={e => updateBusiness("type", e.target.value)} placeholder="Family-run restaurant" /></Field>
              </div>
              <Field label="Tagline" hint="A single memorable line"><input value={state.business.tagline} onChange={e => updateBusiness("tagline", e.target.value)} /></Field>
              <Field label="Short description" hint="Opens your About section"><textarea rows={4} value={state.business.description} onChange={e => updateBusiness("description", e.target.value)} /></Field>
              <Field label="Your story" hint="A longer paragraph about how you started and how you work"><textarea rows={6} value={state.business.story} onChange={e => updateBusiness("story", e.target.value)} /></Field>
              <div className="form-grid">
                <Field label="Email"><input type="email" value={state.business.email} onChange={e => updateBusiness("email", e.target.value)} /></Field>
                <Field label="Phone"><input value={state.business.phone} onChange={e => updateBusiness("phone", e.target.value)} /></Field>
                <Field label="WhatsApp" hint="Leave empty to hide the floating button"><input value={state.business.whatsapp} onChange={e => updateBusiness("whatsapp", e.target.value)} /></Field>
                <Field label="City"><input value={state.business.city} onChange={e => updateBusiness("city", e.target.value)} /></Field>
              </div>
              <Field label="Address"><input value={state.business.address} onChange={e => updateBusiness("address", e.target.value)} /></Field>
              <Field label="Map link" hint="Adds an “Open in maps” link to your contact section"><input value={state.business.mapUrl} onChange={e => updateBusiness("mapUrl", e.target.value)} placeholder="https://maps.google.com/?q=…" /></Field>
              <Field label="Service areas" hint="Separate service areas with commas"><input value={state.business.serviceAreas.join(", ")} onChange={e => updateBusiness("serviceAreas", list(e.target.value))} /></Field>
              <div className="form-grid">
                <Field label="Founded" hint="Drives the “years in business” badges"><input value={state.business.foundedYear} onChange={e => updateBusiness("foundedYear", e.target.value)} placeholder="2014" /></Field>
                <Field label="Team size"><input value={state.business.teamSize} onChange={e => updateBusiness("teamSize", e.target.value)} placeholder="18 chefs and service staff" /></Field>
              </div>
              <Field label="Languages you host in" hint="Separate with commas"><input value={state.business.languages.join(", ")} onChange={e => updateBusiness("languages", list(e.target.value))} /></Field>
              <Field label="Certifications" hint="Shown as trust chips in your About section"><input value={state.business.certifications.join(", ")} onChange={e => updateBusiness("certifications", list(e.target.value))} /></Field>
              <Field label="Awards and press" hint="The first entry appears on your hero badge"><input value={state.business.awards.join(", ")} onChange={e => updateBusiness("awards", list(e.target.value))} /></Field>
            </div>
          </>}

          {tab === "policies" && <>
            <div className="settings-heading"><span>Set expectations early</span><h2>Booking policies</h2><p>These answers appear beside your quote form, so fewer hosts need to ask.</p></div>
            <div className="settings-form">
              <div className="form-grid">
                <Field label="Minimum booking"><input value={state.business.minimumGuests} onChange={e => updateBusiness("minimumGuests", e.target.value)} placeholder="10 guests for drop-off, 30 for full service" /></Field>
                <Field label="Booking notice"><input value={state.business.bookingNotice} onChange={e => updateBusiness("bookingNotice", e.target.value)} placeholder="Two weeks for dinners, three months for weddings" /></Field>
              </div>
              <Field label="Deposit policy"><textarea rows={3} value={state.business.depositPolicy} onChange={e => updateBusiness("depositPolicy", e.target.value)} /></Field>
              <Field label="Cancellation policy"><textarea rows={3} value={state.business.cancellationPolicy} onChange={e => updateBusiness("cancellationPolicy", e.target.value)} /></Field>
              <Field label="Travel policy" hint="Shown in your contact section"><textarea rows={3} value={state.business.travelPolicy} onChange={e => updateBusiness("travelPolicy", e.target.value)} /></Field>
            </div>
          </>}

          {tab === "presence" && <>
            <div className="settings-heading"><span>Where clients find you</span><h2>Hours &amp; social</h2><p>Opening hours appear in your contact section and footer. Empty social fields are hidden automatically.</p></div>
            <div className="settings-form">
              <div className="hours-editor">
                <div className="hours-editor-head"><strong>Opening hours</strong><button onClick={() => updateBusiness("openingHours", [...state.business.openingHours, { id: uid("hours"), days: "", hours: "" }])}><Plus size={14} /> Add a row</button></div>
                {state.business.openingHours.map(hour => (
                  <div className="hours-row" key={hour.id}>
                    <input aria-label="Days" value={hour.days} onChange={e => updateHours(hour.id, { days: e.target.value })} placeholder="Sunday – Thursday" />
                    <input aria-label="Hours" value={hour.hours} onChange={e => updateHours(hour.id, { hours: e.target.value })} placeholder="9:00 – 18:00" />
                    <button aria-label="Remove row" className="danger-text" onClick={() => updateBusiness("openingHours", state.business.openingHours.filter(entry => entry.id !== hour.id))}><Trash2 size={15} /></button>
                  </div>
                ))}
                {state.business.openingHours.length === 0 && <p className="hours-empty">No hours listed yet. Add a row so guests know when you answer.</p>}
              </div>
              <div className="form-grid">
                {socialNetworks.map(network => (
                  <Field key={network.key} label={network.label}><input value={state.business.social[network.key]} onChange={e => updateSocial(network.key, e.target.value)} placeholder={network.placeholder} /></Field>
                ))}
              </div>
            </div>
          </>}

          {tab === "domain" && <>
            <div className="settings-heading"><span>Your website address</span><h2>Domain &amp; publishing</h2><p>Use your ServeSite address now, then connect a custom domain when you’re ready.</p></div>
            <div className="publish-control">
              <div>
                <strong>{state.business.published ? "Your website is live" : "Your website is hidden"}</strong>
                <small>
                  {state.business.published
                    ? state.publishedAt ? `Visible to everyone since ${formatDate(state.publishedAt)}.` : "Visible to everyone with the link."
                    : "Only you can see it. Visitors get a “not available” page."}
                </small>
              </div>
              <label className="switch">
                <input type="checkbox" checked={state.business.published} onChange={e => void setPublished(e.target.checked)} aria-label="Publish website" />
                <i />
              </label>
            </div>
            <div className="domain-current"><div><Globe2 size={20} /><span><small>Current demo subdomain</small><strong>{state.business.slug}.servesite.co</strong></span></div>{state.business.published ? <Badge tone="green"><Check size={13} /> Live</Badge> : <Badge>Not published</Badge>}</div>
            <div className="settings-form"><Field label="Website address" hint="Used in your dashboard links and demo subdomain"><input value={state.business.slug} onChange={e => updateBusiness("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} /></Field></div>
            <div className="domain-connect"><h3>Connect a custom domain</h3><p>Enter a domain you already own. This prototype simulates the connection steps.</p><div><input placeholder="www.yourfoodbusiness.com" /><Button onClick={() => notify("Domain connection simulated")}>Connect domain</Button></div></div>
            <div className="dns-placeholder"><div><ShieldCheck size={21} /><span><strong>DNS instructions</strong><p>After starting a connection, you’ll receive CNAME and verification records to add at your domain provider.</p></span></div><Badge>Placeholder</Badge></div>
          </>}

          {tab === "notifications" && <>
            <div className="settings-heading"><span>Stay informed</span><h2>Notifications</h2><p>Choose what ServeSite should send and where.</p></div>
            <div className="notification-list">
              <NotificationToggle title="Email for new leads" body={`Send every quote request to ${state.business.email}.`} checked={state.notifications.emailLeads} onChange={value => updateNotifications({ emailLeads: value })} />
              <NotificationToggle title="WhatsApp notification" body="Receive a WhatsApp alert when a lead arrives. Coming soon." checked={state.notifications.whatsapp} onChange={value => updateNotifications({ whatsapp: value })} comingSoon />
              <NotificationToggle title="Weekly performance summary" body="A Monday recap of views, inquiries, and menu engagement." checked={state.notifications.weeklySummary} onChange={value => updateNotifications({ weeklySummary: value })} />
            </div>
          </>}

          {tab === "subscription" && <>
            <div className="settings-heading"><span>Plan and billing</span><h2>Subscription</h2><p>Your demo account is currently exploring the {state.subscription.plan} plan.</p></div>
            <div className="current-plan"><div><span>Current plan</span><h3>{state.subscription.plan}</h3><p>Unlimited menu items, lead management, galleries, and advanced inquiries.</p></div><div><Badge tone="gold">{state.subscription.status}</Badge><strong>₪{state.subscription.price}<small>/month</small></strong></div></div>
            <div className="upgrade-list">
              <article><div><h3>Starter</h3><p>Everything needed to launch a professional food business site.</p></div><strong>₪149<small>/month</small></strong><Button variant="secondary" onClick={() => notify("Plan changes are simulated in this prototype")}>Choose Starter</Button></article>
              <article className="selected"><div><h3>Business</h3><p>Lead management, unlimited menus, galleries, and more.</p></div><strong>₪249<small>/month</small></strong><Badge tone="green">Current plan</Badge></article>
              <article><div><h3>Pro</h3><p>Deposits, automated quotes, and team members. Coming soon.</p></div><strong>₪449<small>/month</small></strong><Button variant="secondary" onClick={() => notify("Pro features are coming soon")}>Join waitlist</Button></article>
            </div>
            <div className="billing-note"><CircleAlert size={18} /><p>No payment processing is connected in this prototype. Plan actions are safe demo interactions.</p></div>
          </>}
        </section>
      </div>
    </DashboardShell>
  );
}

function NotificationToggle({ title, body, checked, onChange, comingSoon }: { title: string; body: string; checked: boolean; onChange: (value: boolean) => void; comingSoon?: boolean }) {
  return <label><span><strong>{title}{comingSoon && <Badge>Coming soon</Badge>}</strong><small>{body}</small></span><span className="switch"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><i /></span></label>;
}
