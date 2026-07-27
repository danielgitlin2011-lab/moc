"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, MapPin, Menu, MessageCircle, Phone, Quote, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "./app-provider";
import { QuoteRequestForm } from "./quote-request-form";
import { cn } from "@/lib/utils";

const services = [
  ["Weddings & celebrations", "Elegant menus and attentive service for milestone gatherings."],
  ["Private chef dinners", "Restaurant-level dining, thoughtfully hosted in your own space."],
  ["Corporate catering", "Polished breakfast, lunch, and dinner for teams and clients."],
  ["Shabbat & holidays", "Generous, ready-to-serve menus for meaningful tables."],
];

export function PublicWebsite({ preview = false }: { preview?: boolean }) {
  const { state } = useApp();
  const { business, theme, sections, menuItems, categories, gallery } = state;
  const [mobileNav, setMobileNav] = useState(false);
  const sectionMap = useMemo(() => Object.fromEntries(sections.map(section => [section.id, section])), [sections]);
  const radius = theme.imageCorners === "square" ? "0px" : theme.imageCorners === "soft" ? "8px" : "24px";
  const buttonRadius = theme.buttonShape === "square" ? "0px" : theme.buttonShape === "soft" ? "6px" : "999px";
  const spacing = theme.sectionSpacing === "compact" ? "72px" : theme.sectionSpacing === "comfortable" ? "104px" : "136px";
  const style = {
    "--site-primary": theme.primary,
    "--site-accent": theme.accent,
    "--site-radius": radius,
    "--site-button-radius": buttonRadius,
    "--site-spacing": spacing,
  } as React.CSSProperties;
  const featuredItems = menuItems.filter(item => item.available).slice(0, 6);

  return (
    <div className={cn("public-site", `template-${theme.template}`, preview && "is-preview")} style={style}>
      <header className={cn("public-header", `nav-${theme.navigation}`)}>
        <Link href="#top" className="public-logo"><span>O&amp;E</span><strong>{business.name}</strong></Link>
        <nav className={cn(mobileNav && "open")} aria-label="Catering website navigation">
          {["about", "services", "menus", "gallery", "quote"].map(id => sectionMap[id]?.visible && <a key={id} href={`#${id}`} onClick={() => setMobileNav(false)}>{id === "quote" ? "Plan your event" : sectionMap[id].label}</a>)}
        </nav>
        <a className="public-cta desktop-public-cta" href="#quote">Request a quote</a>
        <button className="public-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav ? <X /> : <Menu />}</button>
      </header>

      {sectionMap.hero?.visible && <section id="top" className="public-hero">
        <img src={theme.heroImage} alt="An elegant Olive & Ember catered event" onError={(event) => { event.currentTarget.src = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1800&q=80"; }} />
        <div className="public-hero-shade" />
        <div className="public-hero-content"><span>{business.type} · {business.city}</span><h1>{sectionMap.hero.title}</h1><p>{sectionMap.hero.body}</p><div><a className="public-cta" href="#quote">Plan your event <ArrowRight size={17} /></a><a className="public-text-link" href="#menus">Explore our menus</a></div></div>
        <div className="public-hero-detail"><span>Scroll to discover</span><i /></div>
      </section>}

      {sectionMap.about?.visible && <section id="about" className="public-section public-about">
        <div className="section-kicker">Our table</div>
        <div><h2>{sectionMap.about.title}</h2><p className="public-lede">{business.description}</p><div className="signature">Olive &amp; Ember</div></div>
        <div className="about-images"><img src={gallery[1]?.url} alt="Chef preparing a meal" /><img src={gallery[0]?.url} alt="An elegant event table" /></div>
      </section>}

      {sectionMap.services?.visible && <section id="services" className="public-section public-services">
        <div className="public-section-heading"><span>What we do</span><h2>{sectionMap.services.title}</h2><p>{sectionMap.services.body}</p></div>
        <div className="services-list">{services.map(([name, body], index) => <article key={name}><span>0{index + 1}</span><div><h3>{name}</h3><p>{body}</p></div><ArrowRight size={19} /></article>)}</div>
      </section>}

      {sectionMap.menus?.visible && <section id="menus" className="public-section public-menus">
        <div className="public-section-heading"><span>From the kitchen</span><h2>{sectionMap.menus.title}</h2><p>{sectionMap.menus.body}</p></div>
        <div className="featured-menu-grid">{featuredItems.map((item, index) => <article className={index === 0 ? "featured-menu-hero" : ""} key={item.id}><img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.src = theme.heroImage; }} /><div><span>{categories.find(category => category.id === item.categoryId)?.name}</span><h3>{item.name}</h3><p>{item.description}</p><strong>{item.price} <small>{item.pricingUnit}</small></strong><div className="dietary-row">{item.dietary.slice(0, 3).map(label => <i key={label}>{label}</i>)}</div></div></article>)}</div>
        <div className="menu-promise"><Check size={19} /><span>Every menu can be tailored to your event, dietary needs, and style of service.</span></div>
      </section>}

      {sectionMap.gallery?.visible && <section id="gallery" className="public-section public-gallery">
        <div className="public-section-heading"><span>Gatherings</span><h2>{sectionMap.gallery.title}</h2><p>{sectionMap.gallery.body}</p></div>
        <div className="gallery-mosaic">{gallery.slice(0, 5).map((image, index) => <figure key={image.id} className={`gallery-${index + 1}`}><img src={image.url} alt={image.caption} /><figcaption>{image.caption}</figcaption></figure>)}</div>
      </section>}

      {sectionMap.testimonials?.visible && <section id="testimonials" className="public-testimonial">
        <Quote size={40} /><blockquote>“From the first tasting to the final plate, Olive &amp; Ember made our wedding feel effortless, generous, and completely us.”</blockquote><div><span>RL</span><strong>Rachel &amp; Levi<small>Miami Beach · Demo testimonial</small></strong></div>
      </section>}

      <section className="service-area">
        <div><MapPin size={24} /><span>Serving South Florida</span></div><h2>Bringing a beautiful table to you.</h2><div className="area-list">{business.serviceAreas.map(area => <span key={area}>{area}</span>)}</div>
      </section>

      {sectionMap.quote?.visible && <section id="quote" className="public-section public-quote">
        <aside><span>Begin a conversation</span><h2>{sectionMap.quote.title}</h2><p>{sectionMap.quote.body}</p><div className="quote-contact"><Phone size={18} /><span><small>Prefer to call?</small><strong>{business.phone}</strong></span></div><div className="quote-contact"><CalendarDays size={18} /><span><small>Response time</small><strong>Within one business day</strong></span></div></aside>
        <QuoteRequestForm />
      </section>}

      {sectionMap.footer?.visible && <footer className="public-footer">
        <div><span className="public-footer-mark">O&amp;E</span><h2>{business.name}</h2><p>{business.tagline}</p></div>
        <div><strong>Explore</strong><a href="#about">About</a><a href="#menus">Menus</a><a href="#gallery">Gallery</a><a href="#quote">Plan your event</a></div>
        <div><strong>Contact</strong><a href={`mailto:${business.email}`}>{business.email}</a><a href={`tel:${business.phone}`}>{business.phone}</a><span>{business.address}</span></div>
        <small>© 2026 {business.name}. Website by <Link href="/">ServeSite</Link>.</small>
      </footer>}
      <a className="whatsapp-float" href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="Contact us on WhatsApp"><MessageCircle size={22} /><span>WhatsApp</span></a>
    </div>
  );
}
