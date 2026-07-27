"use client";

import { ArrowRight } from "lucide-react";
import { useApp } from "./app-provider";

export function WebsitePreview({ scale = "normal" }: { scale?: "normal" | "small" }) {
  const { state } = useApp();
  const { business, theme, sections, menuItems, gallery } = state;
  const visible = (id: string) => sections.find(section => section.id === id)?.visible;
  const hero = sections.find(section => section.id === "hero");
  const about = sections.find(section => section.id === "about");
  return (
    <div className={`website-preview ${scale === "small" ? "preview-small" : ""}`} style={{ "--preview-primary": theme.primary, "--preview-accent": theme.accent, "--preview-radius": theme.imageCorners === "rounded" ? "20px" : theme.imageCorners === "soft" ? "7px" : "0px" } as React.CSSProperties}>
      <div className="preview-site-nav"><strong>O&amp;E</strong><div><span>About</span><span>Menus</span><span>Gallery</span></div><b>Plan your event</b></div>
      {visible("hero") && <div className="preview-site-hero"><img src={theme.heroImage} alt="" /><div><small>{business.type} · Miami</small><h2>{hero?.title}</h2><p>{hero?.body}</p><b>Plan your event <ArrowRight size={11} /></b></div></div>}
      {visible("about") && <div className="preview-site-about"><span>OUR TABLE</span><h3>{about?.title}</h3><p>{business.description}</p></div>}
      {visible("services") && <div className="preview-site-services"><h3>Made for your kind of gathering</h3><div><span>Weddings</span><span>Private dinners</span><span>Corporate catering</span></div></div>}
      {visible("menus") && <div className="preview-site-menu"><span>FROM THE KITCHEN</span><h3>Menus your guests will remember</h3><div>{menuItems.slice(0, 3).map(item => <article key={item.id}><img src={item.image} alt="" /><strong>{item.name}</strong><small>{item.price}</small></article>)}</div></div>}
      {visible("gallery") && <div className="preview-site-gallery">{gallery.slice(0, 3).map(image => <img src={image.url} alt="" key={image.id} />)}</div>}
      {visible("quote") && <div className="preview-site-quote"><span>BEGIN A CONVERSATION</span><h3>Tell us about your event</h3><b>Request a quote</b></div>}
    </div>
  );
}
