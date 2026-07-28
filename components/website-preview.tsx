"use client";

import { ArrowRight } from "lucide-react";
import { useApp } from "./app-provider";
import { businessInitials, fontStack } from "@/lib/utils";
import { SiteImage } from "./site-image";

export function WebsitePreview({ scale = "normal" }: { scale?: "normal" | "small" }) {
  const { state } = useApp();
  const { business, theme, sections, services, stats, menuItems, gallery } = state;
  const section = (id: string) => sections.find(entry => entry.id === id);
  const visible = (id: string) => section(id)?.visible;
  const hero = section("hero");
  const about = section("about");
  return (
    <div
      className={`website-preview template-${theme.template} ${scale === "small" ? "preview-small" : ""}`}
      style={{
        "--preview-primary": theme.primary,
        "--preview-accent": theme.accent,
        "--preview-surface": theme.surface,
        "--preview-heading": fontStack(theme.headingFont),
        "--preview-radius": theme.imageCorners === "rounded" ? "20px" : theme.imageCorners === "soft" ? "7px" : "0px",
      } as React.CSSProperties}
    >
      <div className="preview-site-nav">
        <strong>{business.logo ? <SiteImage src={business.logo} alt="" width={120} /> : businessInitials(business.name)}</strong>
        <div>{["about", "menus", "gallery"].filter(visible).map(id => <span key={id}>{section(id)?.label}</span>)}</div>
        <b>{section("quote")?.ctaLabel || "Plan your event"}</b>
      </div>
      {visible("hero") && <div className="preview-site-hero"><SiteImage src={theme.heroImage} alt="" width={900} /><div><small>{hero?.eyebrow}</small><h2>{hero?.title}</h2><p>{hero?.body}</p><b>{hero?.ctaLabel || "Plan your event"} <ArrowRight size={11} /></b></div></div>}
      {visible("stats") && stats.length > 0 && <div className="preview-site-stats">{stats.slice(0, 4).map(stat => <span key={stat.id}><strong>{stat.value}</strong>{stat.label}</span>)}</div>}
      {visible("about") && <div className="preview-site-about"><span>{about?.eyebrow?.toUpperCase()}</span><h3>{about?.title}</h3><p>{business.description}</p></div>}
      {visible("services") && services.length > 0 && <div className="preview-site-services"><h3>{section("services")?.title}</h3><div>{services.slice(0, 3).map(service => <span key={service.id}>{service.title}</span>)}</div></div>}
      {visible("menus") && <div className="preview-site-menu"><span>{section("menus")?.eyebrow?.toUpperCase()}</span><h3>{section("menus")?.title}</h3><div>{menuItems.filter(item => item.available).slice(0, 3).map(item => <article key={item.id}><SiteImage src={item.image} alt="" width={300} /><strong>{item.name}</strong><small>{theme.showMenuPrices ? item.price : item.pricingUnit}</small></article>)}</div></div>}
      {visible("gallery") && <div className="preview-site-gallery">{gallery.slice(0, 3).map(image => <SiteImage src={image.url} alt="" width={300} key={image.id} />)}</div>}
      {visible("quote") && <div className="preview-site-quote"><span>{section("quote")?.eyebrow?.toUpperCase()}</span><h3>{section("quote")?.title}</h3><b>{section("quote")?.ctaLabel || "Request a quote"}</b></div>}
    </div>
  );
}
