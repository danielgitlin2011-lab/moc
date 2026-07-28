"use client";

import { ImagePlus, Megaphone, RotateCcw, Save } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { TemplateCard, templateNames } from "@/components/template-card";
import { WebsitePreview } from "@/components/website-preview";
import { useApp } from "@/components/app-provider";
import { Button, Field } from "@/components/ui";
import type { BusinessTheme } from "@/lib/types";
import { defaultTheme } from "@/lib/default-theme";
import { businessInitials } from "@/lib/utils";
import { ImageUploader } from "@/components/image-uploader";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

const headingFonts = ["Cormorant Garamond", "Playfair Display", "Fraunces", "Libre Baskerville", "Inter"];
const bodyFonts = ["Inter", "Source Sans", "DM Sans", "Lato", "Work Sans"];

const palettes: { name: string; primary: string; accent: string; surface: string }[] = [
  { name: "Olive & ember", primary: "#233a31", accent: "#c79d59", surface: "#fdfcf8" },
  { name: "Terracotta", primary: "#5a2f24", accent: "#d08a5c", surface: "#fdf7f2" },
  { name: "Harbour", primary: "#17313c", accent: "#7fa8b4", surface: "#f4f8f9" },
  { name: "Vineyard", primary: "#3a2440", accent: "#b98bb0", surface: "#faf6fa" },
  { name: "Midnight", primary: "#14140f", accent: "#c9a961", surface: "#14140f" },
];

export default function DesignEditorPage() {
  const { state, setState, businessId, notify } = useApp();

  const persistTheme = async (nextTheme: BusinessTheme) => {
    try {
      const { error } = await createClient().from("businesses").update({ theme: nextTheme as unknown as Json }).eq("id", businessId);
      if (error) throw error;
    } catch (err) {
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };

  const update = (patch: Partial<BusinessTheme>) => {
    const next = { ...state.theme, ...patch };
    setState(current => ({ ...current, theme: next }));
    void persistTheme(next);
  };
  const monogram = businessInitials(state.business.name);

  return (
    <DashboardShell title="Design" description="Tune the visual system behind your website." actions={<Button onClick={() => notify("Design changes saved")}><Save size={16} /> Save design</Button>}>
      <div className="design-editor-layout">
        <div className="design-controls">
          <ControlSection number="01" title="Template" blurb="Choose the structure and overall mood.">
            <div className="compact-template-list">
              {templateNames.map(value => <TemplateCard compact key={value} value={value} monogram={monogram} selected={state.theme.template === value} onSelect={() => update({ template: value })} />)}
            </div>
          </ControlSection>

          <ControlSection number="02" title="Colors" blurb="Start from a palette, then fine-tune each color.">
            <div className="palette-list">
              {palettes.map(palette => (
                <button
                  key={palette.name}
                  className={state.theme.primary === palette.primary && state.theme.accent === palette.accent ? "active" : ""}
                  onClick={() => update({ primary: palette.primary, accent: palette.accent, surface: palette.surface })}
                >
                  <span><i style={{ background: palette.primary }} /><i style={{ background: palette.accent }} /><i style={{ background: palette.surface }} /></span>
                  {palette.name}
                </button>
              ))}
            </div>
            <div className="form-grid">
              <Field label="Primary"><div className="color-control"><input type="color" value={state.theme.primary} onChange={e => update({ primary: e.target.value })} /><input value={state.theme.primary} onChange={e => update({ primary: e.target.value })} /></div></Field>
              <Field label="Accent"><div className="color-control"><input type="color" value={state.theme.accent} onChange={e => update({ accent: e.target.value })} /><input value={state.theme.accent} onChange={e => update({ accent: e.target.value })} /></div></Field>
              <Field label="Page background"><div className="color-control"><input type="color" value={state.theme.surface} onChange={e => update({ surface: e.target.value })} /><input value={state.theme.surface} onChange={e => update({ surface: e.target.value })} /></div></Field>
            </div>
          </ControlSection>

          <ControlSection number="03" title="Typography" blurb="Choose expressive headings and readable body type.">
            <div className="form-grid">
              <Field label="Heading font"><select value={state.theme.headingFont} onChange={e => update({ headingFont: e.target.value })}>{headingFonts.map(value => <option key={value}>{value}</option>)}</select></Field>
              <Field label="Body font"><select value={state.theme.bodyFont} onChange={e => update({ bodyFont: e.target.value })}>{bodyFonts.map(value => <option key={value}>{value}</option>)}</select></Field>
            </div>
            <DesignChoice label="Headline size" value={state.theme.headingScale} options={["calm", "balanced", "dramatic"]} onChange={value => update({ headingScale: value as BusinessTheme["headingScale"] })} />
          </ControlSection>

          <ControlSection number="04" title="Brand assets" blurb="Upload a logo that appears in your navigation and footer.">
            <div className="asset-control-label"><ImagePlus size={16} /><span><strong>Business logo</strong><small>Transparent PNG or WebP works best. Without one we use the “{monogram}” monogram.</small></span></div>
            <ImageUploader compact value={state.business.logo} onChange={logo => {
              setState(current => ({ ...current, business: { ...current.business, logo: logo || undefined } }));
              void (async () => {
                try {
                  const { error } = await createClient().from("businesses").update({ logo: logo || "" }).eq("id", businessId);
                  if (error) throw error;
                } catch (err) {
                  notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
                }
              })();
            }} />
          </ControlSection>

          <ControlSection number="05" title="Hero composition" blurb="Control the first impression without breaking the layout.">
            <DesignChoice label="Layout" value={state.theme.heroLayout} options={["overlay", "split", "centered"]} onChange={value => update({ heroLayout: value as BusinessTheme["heroLayout"] })} />
            <DesignChoice label="Hero height" value={state.theme.heroHeight} options={["compact", "grand"]} onChange={value => update({ heroHeight: value as BusinessTheme["heroHeight"] })} />
            <DesignChoice label="Header" value={state.theme.headerStyle} options={["transparent", "solid"]} onChange={value => update({ headerStyle: value as BusinessTheme["headerStyle"] })} />
            <Field label={`Image overlay · ${state.theme.heroOverlay}%`}><input className="range-control" type="range" min="25" max="80" value={state.theme.heroOverlay} onChange={e => update({ heroOverlay: Number(e.target.value) })} /></Field>
          </ControlSection>

          <ControlSection number="06" title="Section layouts" blurb="Choose how services, menus, and photography are presented.">
            <DesignChoice label="Service style" value={state.theme.serviceLayout} options={["cards", "rows", "tiles"]} onChange={value => update({ serviceLayout: value as BusinessTheme["serviceLayout"] })} />
            <DesignChoice label="Menu style" value={state.theme.menuLayout} options={["editorial", "cards", "list"]} onChange={value => update({ menuLayout: value as BusinessTheme["menuLayout"] })} />
            <DesignChoice label="Gallery style" value={state.theme.galleryLayout} options={["editorial", "mosaic", "grid"]} onChange={value => update({ galleryLayout: value as BusinessTheme["galleryLayout"] })} />
            <Field label={`Dishes shown on the homepage · ${state.theme.menuItemLimit}`}><input className="range-control" type="range" min="3" max="12" value={state.theme.menuItemLimit} onChange={e => update({ menuItemLimit: Number(e.target.value) })} /></Field>
            <Field label={`Gallery images shown · ${state.theme.galleryLimit}`}><input className="range-control" type="range" min="3" max="12" value={state.theme.galleryLimit} onChange={e => update({ galleryLimit: Number(e.target.value) })} /></Field>
          </ControlSection>

          <ControlSection number="07" title="What your menu reveals" blurb="Decide how much detail guests see before they contact you.">
            <ToggleRow label="Show menu prices" hint="Hide prices when every event requires a custom quote." checked={state.theme.showMenuPrices} onChange={showMenuPrices => update({ showMenuPrices })} />
            <ToggleRow label="Show dietary labels" hint="Kosher, vegan, and gluten-free chips under each dish." checked={state.theme.showDietaryLabels} onChange={showDietaryLabels => update({ showDietaryLabels })} />
            <ToggleRow label="Show allergens" hint="Adds allergens to the expandable dish details." checked={state.theme.showAllergens} onChange={showAllergens => update({ showAllergens })} />
            <ToggleRow label="Show opening hours" hint="Adds your hours to the contact section and footer." checked={state.theme.showOpeningHours} onChange={showOpeningHours => update({ showOpeningHours })} />
            <ToggleRow label="Show social links" hint="Only the profiles you filled in are displayed." checked={state.theme.showSocialLinks} onChange={showSocialLinks => update({ showSocialLinks })} />
          </ControlSection>

          <ControlSection number="08" title="Details" blurb="Fine-tune shapes, spacing, and navigation.">
            <DesignChoice label="Button shape" value={state.theme.buttonShape} options={["square", "soft", "pill"]} onChange={value => update({ buttonShape: value as BusinessTheme["buttonShape"] })} />
            <DesignChoice label="Image corners" value={state.theme.imageCorners} options={["square", "soft", "rounded"]} onChange={value => update({ imageCorners: value as BusinessTheme["imageCorners"] })} />
            <DesignChoice label="Section spacing" value={state.theme.sectionSpacing} options={["compact", "comfortable", "spacious"]} onChange={value => update({ sectionSpacing: value as BusinessTheme["sectionSpacing"] })} />
            <DesignChoice label="Navigation" value={state.theme.navigation} options={["minimal", "centered", "classic"]} onChange={value => update({ navigation: value as BusinessTheme["navigation"] })} />
          </ControlSection>

          <ControlSection number="09" title="Announcement bar" blurb="Share booking availability or a seasonal message.">
            <label className="inline-toggle-row"><span><Megaphone size={16} /><strong>Show announcement</strong></span><span className="switch"><input type="checkbox" checked={state.theme.showAnnouncement} onChange={e => update({ showAnnouncement: e.target.checked })} /><i /></span></label>
            {state.theme.showAnnouncement && <Field label="Announcement text"><input value={state.theme.announcementText} onChange={e => update({ announcementText: e.target.value })} /></Field>}
          </ControlSection>

          <button className="reset-design" onClick={() => { setState(current => ({ ...current, theme: defaultTheme })); notify("Template defaults restored"); void persistTheme(defaultTheme); }}><RotateCcw size={16} /> Reset to template defaults</button>
        </div>
        <aside className="design-preview-sticky">
          <div><span>Live website preview</span><small>All changes appear instantly</small></div>
          <div className="design-preview-frame"><WebsitePreview /></div>
        </aside>
      </div>
    </DashboardShell>
  );
}

function ControlSection({ number, title, blurb, children }: { number: string; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section className="control-section">
      <div className="control-section-heading"><span>{number}</span><div><h2>{title}</h2><p>{blurb}</p></div></div>
      {children}
    </section>
  );
}

function DesignChoice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="design-choice"><span>{label}</span><div>{options.map(option => <button key={option} className={value === option ? "active" : ""} onClick={() => onChange(option)}>{option}</button>)}</div></div>;
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="inline-toggle-row"><span><strong>{label}</strong><small>{hint}</small></span><span className="switch"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><i /></span></label>;
}
