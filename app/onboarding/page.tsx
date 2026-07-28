"use client";

import { ArrowLeft, ArrowRight, Check, CheckCircle2, Globe2, Plus, Rocket, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { defaultBusiness, defaultSections, defaultTheme } from "@/lib/default-theme";
import { businessToRow, menuItemToRow, sectionToRow } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/client";
import { TemplateCard, templateNames } from "@/components/template-card";
import { BrandMark, Button, Field } from "@/components/ui";
import { businessInitials, cn, uid } from "@/lib/utils";
import { ImageUploader } from "@/components/image-uploader";
import type { MenuItem } from "@/lib/types";

const stepNames = ["Business", "Template", "Branding", "Menu", "Publish"];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "") || "business";
}

function blankMenuItem(): MenuItem {
  return {
    id: uid("menu"),
    name: "New menu item",
    description: "Describe this dish or package.",
    price: "$0",
    pricingUnit: "Per person",
    image: "",
    categoryId: "",
    dietary: [],
    allergens: [],
    ingredients: "",
    servingSize: "",
    preparation: "",
    leadTime: "",
    minimumOrder: "",
    seasonal: "",
    featured: false,
    available: true,
    views: 0,
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [business, setBusiness] = useState({ ...defaultBusiness, serviceAreas: defaultBusiness.serviceAreas.join(", ") });
  const [theme, setTheme] = useState({ ...defaultTheme });
  const [items, setItems] = useState<MenuItem[]>([]);
  const completion = step * 20;
  const previewSlug = useMemo(() => slugify(business.name), [business.name]);

  const validateAndNext = () => {
    if (step === 1) {
      const missing = [["Business name", business.name], ["Phone number", business.phone], ["Email", business.email], ["City", business.city]].filter(([, value]) => !value).map(([label]) => label);
      setErrors(missing);
      if (missing.length) return;
    }
    setErrors([]);
    setStep(value => Math.min(5, value + 1));
  };

  const publish = async () => {
    setPublishError("");
    setPublishing(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPublishError("Your session expired. Please log in again.");
      setPublishing(false);
      router.push("/login");
      return;
    }

    const finalBusiness = {
      ...defaultBusiness,
      ...business,
      serviceAreas: business.serviceAreas.split(",").map(area => area.trim()).filter(Boolean),
    };

    let businessId: string | null = null;
    let attemptSlug = previewSlug;
    for (let attempt = 0; attempt < 3 && !businessId; attempt += 1) {
      const row = businessToRow({ ...finalBusiness, slug: attemptSlug }, theme, user.id, { onboarded: true, published: true });
      const { data: inserted, error } = await supabase.from("businesses").insert(row).select("id").single();
      if (!error && inserted) {
        businessId = inserted.id;
      } else if (error?.code === "23505") {
        attemptSlug = `${previewSlug}-${Math.random().toString(36).slice(2, 6)}`;
      } else if (error) {
        setPublishError(error.message);
        setPublishing(false);
        return;
      }
    }

    if (!businessId) {
      setPublishError("Could not create your business — please try again.");
      setPublishing(false);
      return;
    }

    const sectionRows = defaultSections.map((section, index) => sectionToRow(section, businessId!, index));
    const { error: sectionsError } = await supabase.from("website_sections").insert(sectionRows);
    if (sectionsError) {
      setPublishError(sectionsError.message);
      setPublishing(false);
      return;
    }

    if (items.length > 0) {
      const { data: category, error: categoryError } = await supabase
        .from("menu_categories")
        .insert({ business_id: businessId, name: "Menu", description: "", position: 0 })
        .select("id")
        .single();
      if (categoryError) {
        setPublishError(categoryError.message);
        setPublishing(false);
        return;
      }
      const itemRows = items.map((item, index) => menuItemToRow(item, businessId!, category.id, index));
      const { error: itemsError } = await supabase.from("menu_items").insert(itemRows);
      if (itemsError) {
        setPublishError(itemsError.message);
        setPublishing(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  const previewStyle = useMemo(() => ({ "--mini-primary": theme.primary, "--mini-accent": theme.accent }) as React.CSSProperties, [theme]);

  return (
    <main className="onboarding-page">
      <header className="onboarding-header"><BrandMark /><div className="onboarding-progress"><span>Step {step} of 5</span><div><i style={{ width: `${completion}%` }} /></div></div></header>
      <div className="onboarding-shell">
        <aside className="step-sidebar"><p>Set up your website</p>{stepNames.map((name, index) => <button key={name} className={cn(step === index + 1 && "active", step > index + 1 && "complete")} onClick={() => step > index + 1 && setStep(index + 1)}><span>{step > index + 1 ? <Check size={15} /> : index + 1}</span>{name}</button>)}</aside>
        <section className="onboarding-content">
          {step === 1 && <div className="onboarding-step"><span className="step-kicker">01 · The essentials</span><h1>Tell us about your business.</h1><p>We’ll use these details to create your website content and contact experience.</p>
            {errors.length > 0 && <div className="form-alert">Please complete: {errors.join(", ")}.</div>}
            <div className="form-grid">
              <Field label="Business name"><input value={business.name} onChange={e => setBusiness({ ...business, name: e.target.value })} /></Field>
              <Field label="Business type"><select value={business.type} onChange={e => setBusiness({ ...business, type: e.target.value })}>{["Catering company", "Private chef", "Event catering", "Kosher catering", "Corporate catering", "Meal delivery"].map(value => <option key={value}>{value}</option>)}</select></Field>
              <Field label="Email"><input type="email" value={business.email} onChange={e => setBusiness({ ...business, email: e.target.value })} /></Field>
              <Field label="Phone number"><input value={business.phone} onChange={e => setBusiness({ ...business, phone: e.target.value })} /></Field>
              <Field label="WhatsApp number"><input value={business.whatsapp} onChange={e => setBusiness({ ...business, whatsapp: e.target.value })} /></Field>
              <Field label="City"><input value={business.city} onChange={e => setBusiness({ ...business, city: e.target.value })} /></Field>
            </div>
            <Field label="Tagline" hint="The single line that opens your website"><input value={business.tagline} onChange={e => setBusiness({ ...business, tagline: e.target.value })} /></Field>
            <Field label="Short description"><textarea rows={4} value={business.description} onChange={e => setBusiness({ ...business, description: e.target.value })} /></Field>
            <Field label="Your story" hint="Optional now — you can expand it later in Settings"><textarea rows={4} value={business.story} onChange={e => setBusiness({ ...business, story: e.target.value })} /></Field>
            <div className="form-grid">
              <Field label="Service areas" hint="Separate areas with commas"><input value={business.serviceAreas} onChange={e => setBusiness({ ...business, serviceAreas: e.target.value })} /></Field>
              <Field label="Founded" hint="Drives the “years catering” badge"><input value={business.foundedYear} onChange={e => setBusiness({ ...business, foundedYear: e.target.value })} /></Field>
            </div>
          </div>}

          {step === 2 && <div className="onboarding-step wide"><span className="step-kicker">02 · Your visual foundation</span><h1>Choose a template that fits your style.</h1><p>Every template is fully responsive and stays professionally designed as you customize it.</p><div className="onboarding-template-grid">{templateNames.map(value => <TemplateCard key={value} value={value} monogram={businessInitials(business.name)} selected={theme.template === value} onSelect={() => setTheme({ ...theme, template: value })} />)}</div></div>}

          {step === 3 && <div className="onboarding-step brand-step"><div><span className="step-kicker">03 · Make it yours</span><h1>Shape your visual identity.</h1><p>Choose a refined starting palette and typography. You can revisit these choices anytime.</p>
            <div className="brand-controls"><div className="form-grid"><Field label="Primary color"><div className="color-control"><input type="color" value={theme.primary} onChange={e => setTheme({ ...theme, primary: e.target.value })} /><input value={theme.primary} onChange={e => setTheme({ ...theme, primary: e.target.value })} /></div></Field><Field label="Accent color"><div className="color-control"><input type="color" value={theme.accent} onChange={e => setTheme({ ...theme, accent: e.target.value })} /><input value={theme.accent} onChange={e => setTheme({ ...theme, accent: e.target.value })} /></div></Field></div>
              <Field label="Font pair"><select value={`${theme.headingFont}|${theme.bodyFont}`} onChange={e => { const [headingFont, bodyFont] = e.target.value.split("|"); setTheme({ ...theme, headingFont, bodyFont }); }}><option value="Cormorant|Inter">Cormorant + Inter</option><option value="Playfair|Source Sans">Playfair + Source Sans</option><option value="Fraunces|Inter">Fraunces + Inter</option><option value="Inter|Inter">Inter + Inter</option></select></Field>
              <Field label="Button style"><div className="segmented-control">{(["square", "soft", "pill"] as const).map(value => <button type="button" className={theme.buttonShape === value ? "active" : ""} key={value} onClick={() => setTheme({ ...theme, buttonShape: value })}>{value}</button>)}</div></Field>
              <Field label="Logo"><ImageUploader compact value={business.logo} onChange={logo => setBusiness({ ...business, logo })} label="Upload your logo" /></Field>
              <Field label="Hero image"><ImageUploader compact value={theme.heroImage} onChange={heroImage => setTheme({ ...theme, heroImage })} label="Upload a hero image" /></Field>
              <Field label="Or paste a hero image URL"><input value={theme.heroImage} onChange={e => setTheme({ ...theme, heroImage: e.target.value })} /></Field>
            </div></div>
            <div className="mini-live-preview" style={previewStyle}><div className="mini-browser-bar"><span /><span /><span /></div><img src={theme.heroImage} alt="Live website preview" /><div><small>{business.name}</small><h2>{business.tagline}</h2><p>{business.description.slice(0, 96)}…</p><b style={{ borderRadius: theme.buttonShape === "pill" ? 99 : theme.buttonShape === "soft" ? 6 : 0 }}>Plan your event</b></div><em>Live preview</em></div>
          </div>}

          {step === 4 && <div className="onboarding-step wide"><span className="step-kicker">04 · Start your menu</span><h1>Add a few dishes or packages.</h1><p>Add your first menu items now, or skip this and build your full menu later.</p><div className="first-menu-list">{items.map((item, index) => <article key={item.id}><img src={item.image} alt="" /><div className="menu-edit-fields"><input aria-label={`Menu item ${index + 1} name`} value={item.name} onChange={e => setItems(current => current.map(entry => entry.id === item.id ? { ...entry, name: e.target.value } : entry))} /><input aria-label={`Menu item ${index + 1} description`} value={item.description} onChange={e => setItems(current => current.map(entry => entry.id === item.id ? { ...entry, description: e.target.value } : entry))} /></div><input className="price-input" aria-label={`Menu item ${index + 1} price`} value={item.price} onChange={e => setItems(current => current.map(entry => entry.id === item.id ? { ...entry, price: e.target.value } : entry))} /><button onClick={() => setItems(current => current.filter(entry => entry.id !== item.id))} aria-label={`Remove ${item.name}`}><Trash2 size={17} /></button></article>)}</div><Button variant="secondary" type="button" onClick={() => setItems(current => [...current, blankMenuItem()])}><Plus size={17} /> Add menu item</Button></div>}

          {step === 5 && <div className="onboarding-step review-step"><div className="publish-icon"><Rocket size={28} /></div><span className="step-kicker">05 · Ready to gather</span><h1>Your new website is ready.</h1><p>Review the essentials below, then publish your site to its address.</p>
            {publishError && <div className="form-alert">{publishError}</div>}
            <div className="review-card"><div><small>Business</small><strong>{business.name}</strong><span>{business.type} · {business.city}</span></div><div><small>Template</small><strong className="capitalize">{theme.template}</strong><span>{theme.headingFont} + {theme.bodyFont}</span></div><div><small>Menu</small><strong>{items.length} starter items</strong><span>Ready to edit anytime</span></div><div className="demo-url"><Globe2 size={18} /><span><small>Your website address</small><strong>{previewSlug}.servesite.co</strong></span><CheckCircle2 size={18} /></div></div><div className="publish-note"><CheckCircle2 size={18} /><span>You can keep editing after publishing. Changes are saved automatically.</span></div></div>}
          <div className="onboarding-actions">{step > 1 ? <Button variant="secondary" onClick={() => setStep(value => value - 1)} disabled={publishing}><ArrowLeft size={17} /> Back</Button> : <span />}{step < 5 ? <Button onClick={validateAndNext}>Continue <ArrowRight size={17} /></Button> : <Button onClick={publish} disabled={publishing}>{publishing ? "Publishing…" : <>Publish website <Rocket size={17} /></>}</Button>}</div>
        </section>
      </div>
    </main>
  );
}
