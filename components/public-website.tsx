"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Pencil,
  Phone,
  Quote,
  Sparkles,
  Star,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { QuoteRequestForm } from "./quote-request-form";
import { cn, businessInitials, fontStack, yearsInBusiness } from "@/lib/utils";
import type { AppState, GalleryImage, WebsiteSection } from "@/lib/types";

const socialGlyphs: Record<string, React.ReactNode> = {
  instagram: <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" /><circle cx="12" cy="12" r="3.9" /><circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none" /></>,
  facebook: <path d="M14.6 8.4h2.6V5.2h-2.8c-2.3 0-3.8 1.5-3.8 3.9v2.2H8.1v3.2h2.5V22h3.3v-7.5h2.5l.5-3.2h-3V9.5c0-.8.3-1.1 1.2-1.1Z" />,
  tiktok: <><path d="M14.1 3.5v10.8a3.2 3.2 0 1 1-2.7-3.1" /><path d="M14.1 6.3c.7 1.8 2.2 3 4.1 3.1" /></>,
  pinterest: <><circle cx="12" cy="12" r="9" /><path d="M9.6 20.2c.8-2.7 1.5-5.3 1.5-5.3" /><path d="M10.3 11.6c0-1.7 1.1-3 2.6-3 1.4 0 2.4 1 2.4 2.5 0 2-1 4.2-2.8 4.2-.9 0-1.6-.7-1.4-1.7" /></>,
  youtube: <><rect x="2.6" y="5.6" width="18.8" height="12.8" rx="4" /><path d="M10.3 9.5v5l4.5-2.5z" /></>,
};

function SocialIcon({ network }: { network: string }) {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{socialGlyphs[network]}</svg>;
}

function Stars({ rating }: { rating: number }) {
  return <span className="star-row" aria-label={`${rating} out of 5`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} fill={index < rating ? "currentColor" : "none"} />)}</span>;
}

export function PublicWebsite({
  state,
  businessId,
  preview = false,
  editable = false,
  onSectionSelect,
}: {
  state: AppState;
  businessId: string;
  preview?: boolean;
  editable?: boolean;
  onSectionSelect?: (id: string) => void;
}) {
  const { business, theme, sections, services, testimonials, faqs, stats, processSteps, team, menuItems, categories, gallery } = state;
  const [mobileNav, setMobileNav] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCollection, setActiveCollection] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionMap = useMemo(() => Object.fromEntries(sections.map(section => [section.id, section])), [sections]);

  const radius = theme.imageCorners === "square" ? "0px" : theme.imageCorners === "soft" ? "10px" : "28px";
  const buttonRadius = theme.buttonShape === "square" ? "0px" : theme.buttonShape === "soft" ? "7px" : "999px";
  const spacing = theme.sectionSpacing === "compact" ? "78px" : theme.sectionSpacing === "comfortable" ? "112px" : "145px";
  const headingScale = theme.headingScale === "calm" ? "0.88" : theme.headingScale === "dramatic" ? "1.12" : "1";
  const style = {
    "--site-primary": theme.primary,
    "--site-accent": theme.accent,
    "--site-surface": theme.surface,
    "--site-radius": radius,
    "--site-button-radius": buttonRadius,
    "--site-spacing": spacing,
    "--site-heading-font": fontStack(theme.headingFont),
    "--site-body-font": fontStack(theme.bodyFont),
    "--site-heading-scale": headingScale,
    "--hero-overlay": `${theme.heroOverlay / 100}`,
  } as React.CSSProperties;

  const initials = businessInitials(business.name);
  const years = yearsInBusiness(business.foundedYear);
  const availableItems = menuItems.filter(item => item.available);
  const categoryItems = availableItems.filter(item => activeCategory === "all" || item.categoryId === activeCategory);
  const featuredFirst = activeCategory === "all" ? [...categoryItems].sort((a, b) => Number(b.featured) - Number(a.featured)) : categoryItems;
  const shownItems = featuredFirst.slice(0, Math.max(theme.menuItemLimit, 3));
  const activeCategoryMeta = categories.find(category => category.id === activeCategory);
  const collections = useMemo(() => Array.from(new Set(gallery.map(image => image.category))).filter(Boolean), [gallery]);
  const shownGallery = useMemo(
    () => gallery.filter(image => activeCollection === "all" || image.category === activeCollection).slice(0, Math.max(theme.galleryLimit, 3)),
    [gallery, activeCollection, theme.galleryLimit],
  );
  const socialEntries = Object.entries(business.social).filter(([, url]) => url.trim().length > 0);
  const averageRating = testimonials.length
    ? (testimonials.reduce((total, item) => total + item.rating, 0) / testimonials.length).toFixed(1)
    : "5.0";
  const heroCredential = business.awards[0] || business.certifications[0] || business.type;
  const anchorSections = ["about", "services", "process", "menus", "gallery", "team", "testimonials", "faq", "contact"];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const activeImage: GalleryImage | undefined = lightboxIndex === null ? undefined : shownGallery[lightboxIndex];

  const editButton = (id: string, label: string) => editable ? (
    <button className="inline-edit-button" onClick={() => onSectionSelect?.(id)}><Pencil size={13} /> Edit {label}</button>
  ) : null;

  const renderSection = (section: WebsiteSection) => {
    switch (section.id) {
      case "hero":
        return (
          <section id="top" className={cn("public-hero", `hero-layout-${theme.heroLayout}`, `hero-height-${theme.heroHeight}`)}>
            <div className="hero-image-panel">
              <img src={theme.heroImage} alt={`${business.name} catered event`} onError={event => { event.currentTarget.src = gallery[0]?.url || ""; }} />
              <div className="public-hero-shade" />
            </div>
            <div className="public-hero-content reveal-on-scroll">
              <span>{section.eyebrow}</span>
              <h1>{section.title}</h1>
              <p>{section.body}</p>
              <div className="hero-actions-row">
                <a className="public-cta" href="#quote">{section.ctaLabel || "Plan your event"} <ArrowRight size={17} /></a>
                <a className="public-text-link" href="#menus">{section.secondaryCtaLabel || "Explore our menus"}</a>
              </div>
              <ul className="hero-facts">
                {years > 0 && <li><Clock size={13} /> {years} years catering</li>}
                {business.minimumGuests && <li><Users size={13} /> {business.minimumGuests}</li>}
                {business.serviceAreas.length > 0 && <li><MapPin size={13} /> {business.serviceAreas.slice(0, 2).join(" · ")}</li>}
              </ul>
            </div>
            <div className="hero-award"><Star size={16} fill="currentColor" /><span><strong>{heroCredential}</strong><small>{business.city}</small></span></div>
            <div className="public-hero-detail"><span>Discover our table</span><i /></div>
            {editButton("hero", "hero")}
          </section>
        );
      case "stats":
        return stats.length ? (
          <section id="highlights" className="public-section public-stats">
            <div className="stats-intro"><span>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.body}</p></div>
            <div className="stats-grid reveal-on-scroll">{stats.map(stat => <article key={stat.id}><strong>{stat.value}</strong><span>{stat.label}</span></article>)}</div>
            {editButton("stats", "highlights")}
          </section>
        ) : null;
      case "about":
        return (
          <section id="about" className="public-section public-about">
            <div className="section-kicker">{section.eyebrow}</div>
            <div className="about-copy">
              <h2>{section.title}</h2>
              <p className="public-lede">{business.description}</p>
              <p>{section.body}</p>
              {business.story && <p className="about-story">{business.story}</p>}
              {business.certifications.length > 0 && (
                <ul className="credential-list">{business.certifications.map(item => <li key={item}><BadgeCheck size={14} /> {item}</li>)}</ul>
              )}
              <a href="#services">{section.ctaLabel || "Our approach"} <ArrowRight size={15} /></a>
              <div className="signature">{business.name}</div>
            </div>
            <div className="about-images">
              <img src={theme.aboutImage || gallery[1]?.url} alt={`The team behind ${business.name}`} />
              <img src={theme.detailImage || gallery[0]?.url} alt="An event detail" />
              {years > 0 && <span><strong>{years}+</strong><small>years around<br />beautiful tables</small></span>}
            </div>
            {editButton("about", "about")}
          </section>
        );
      case "services":
        return services.length ? (
          <section id="services" className={cn("public-section public-services", `service-layout-${theme.serviceLayout}`)}>
            <div className="public-section-heading light"><span>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.body}</p></div>
            <div className="service-cards reveal-on-scroll">
              {services.map((service, index) => (
                <article key={service.id}>
                  <div className="service-card-image">
                    <img src={service.image || gallery[index % Math.max(gallery.length, 1)]?.url} alt={service.title} onError={event => { event.currentTarget.src = theme.heroImage; }} />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    {service.highlights.length > 0 && (
                      <ul className="service-highlights">{service.highlights.map(highlight => <li key={highlight}><Check size={12} /> {highlight}</li>)}</ul>
                    )}
                    <div className="service-meta">
                      {service.priceFrom && <span><Utensils size={12} /> {service.priceFrom}</span>}
                      {service.capacity && <span><Users size={12} /> {service.capacity}</span>}
                    </div>
                    <a href="#quote">Plan this gathering <ArrowRight size={14} /></a>
                  </div>
                </article>
              ))}
            </div>
            {editButton("services", "services")}
          </section>
        ) : null;
      case "process":
        return processSteps.length ? (
          <section id="process" className="public-section public-process">
            <div className="public-section-heading"><span>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.body}</p></div>
            <ol className="process-track reveal-on-scroll">
              {processSteps.map((step, index) => (
                <li key={step.id}>
                  <span className="process-index">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {step.duration && <small><Clock size={11} /> {step.duration}</small>}
                </li>
              ))}
            </ol>
            {editButton("process", "the planning process")}
          </section>
        ) : null;
      case "menus":
        return (
          <section id="menus" className={cn("public-section public-menus", `menu-layout-${theme.menuLayout}`)}>
            <div className="public-section-heading"><span>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.body}</p></div>
            <div className="public-menu-tabs" role="tablist" aria-label="Menu categories">
              <button role="tab" aria-selected={activeCategory === "all"} className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>Featured</button>
              {categories.filter(category => availableItems.some(item => item.categoryId === category.id)).map(category => (
                <button role="tab" aria-selected={activeCategory === category.id} className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)} key={category.id}>{category.name}</button>
              ))}
            </div>
            {activeCategoryMeta?.description && <p className="menu-category-note">{activeCategoryMeta.description}</p>}
            <div className="featured-menu-grid">
              {shownItems.map((item, index) => (
                <article className={index === 0 ? "featured-menu-hero" : ""} key={item.id}>
                  <div className="menu-image-wrap">
                    <img src={item.image} alt={item.name} onError={event => { event.currentTarget.src = theme.heroImage; }} />
                    <span>{categories.find(category => category.id === item.categoryId)?.name}</span>
                    {item.featured && <b className="menu-featured-flag"><Star size={9} fill="currentColor" /> Signature</b>}
                  </div>
                  <div className="menu-card-body">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    {theme.showMenuPrices && item.price && <strong>{item.price} <small>{item.pricingUnit}</small></strong>}
                    {theme.showDietaryLabels && item.dietary.length > 0 && (
                      <div className="dietary-row">{item.dietary.slice(0, 4).map(label => <i key={label}>{label}</i>)}</div>
                    )}
                    {(item.ingredients || item.servingSize || item.leadTime || (theme.showAllergens && item.allergens.length > 0)) && (
                      <details className="menu-details">
                        <summary>Dish details <ChevronRight size={12} /></summary>
                        <dl>
                          {item.ingredients && <><dt>Ingredients</dt><dd>{item.ingredients}</dd></>}
                          {item.servingSize && <><dt>Serving</dt><dd>{item.servingSize}</dd></>}
                          {item.preparation && <><dt>Preparation</dt><dd>{item.preparation}</dd></>}
                          {item.leadTime && <><dt>Lead time</dt><dd>{item.leadTime}</dd></>}
                          {item.minimumOrder && <><dt>Minimum</dt><dd>{item.minimumOrder}</dd></>}
                          {item.seasonal && <><dt>Availability</dt><dd>{item.seasonal}</dd></>}
                          {theme.showAllergens && item.allergens.length > 0 && <><dt>Allergens</dt><dd>{item.allergens.join(", ")}</dd></>}
                        </dl>
                      </details>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div className="menu-footer-row">
              <div className="menu-promise"><Check size={18} /><span>Every menu can be tailored to your event, dietary needs, and style of service.</span></div>
              <a className="public-outline-cta" href="#quote">{section.ctaLabel || "Build your menu"} <ArrowRight size={15} /></a>
            </div>
            {editButton("menus", "menus")}
          </section>
        );
      case "gallery":
        return (
          <section id="gallery" className={cn("public-section public-gallery", `gallery-layout-${theme.galleryLayout}`)}>
            <div className="gallery-heading-row">
              <div className="public-section-heading"><span>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.body}</p></div>
              <p><Sparkles size={17} /> Every gathering tells its own story.</p>
            </div>
            {collections.length > 1 && (
              <div className="gallery-filter-row">
                <button className={activeCollection === "all" ? "active" : ""} onClick={() => { setActiveCollection("all"); setLightboxIndex(null); }}>All work</button>
                {collections.map(collection => (
                  <button key={collection} className={activeCollection === collection ? "active" : ""} onClick={() => { setActiveCollection(collection); setLightboxIndex(null); }}>{collection}</button>
                ))}
              </div>
            )}
            <div className="gallery-mosaic">
              {shownGallery.map((image, index) => (
                <button key={image.id} className={`gallery-${index + 1}`} onClick={() => openLightbox(index)} aria-label={`Open ${image.caption}`}>
                  <img src={image.url} alt={image.caption} />
                  <span>{image.category}</span>
                  <strong>{image.caption}</strong>
                  {(image.guestCount || image.location) && <em>{[image.guestCount, image.location].filter(Boolean).join(" · ")}</em>}
                </button>
              ))}
            </div>
            {editButton("gallery", "gallery")}
          </section>
        );
      case "team":
        return team.length ? (
          <section id="team" className="public-section public-team">
            <div className="public-section-heading"><span>{section.eyebrow}</span><h2>{section.title}</h2><p>{section.body}</p></div>
            <div className="team-grid reveal-on-scroll">
              {team.map(member => (
                <article key={member.id}>
                  <div className="team-portrait"><img src={member.image} alt={member.name} onError={event => { event.currentTarget.src = theme.aboutImage; }} /></div>
                  <h3>{member.name}</h3>
                  <span>{member.role}</span>
                  <p>{member.bio}</p>
                </article>
              ))}
            </div>
            {business.languages.length > 0 && (
              <p className="team-languages"><ChefHat size={14} /> Our team hosts in {business.languages.join(", ")}{business.teamSize ? ` · ${business.teamSize}` : ""}</p>
            )}
            {editButton("team", "team")}
          </section>
        ) : null;
      case "testimonials":
        return testimonials.length ? (
          <section id="testimonials" className="public-testimonial">
            <div className="public-section-heading light">
              <span>{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <div className="rating-summary"><Stars rating={Math.round(Number(averageRating))} /><small>{averageRating} average from {testimonials.length} host reviews</small></div>
            </div>
            <div className="testimonial-grid reveal-on-scroll">
              {testimonials.map(item => (
                <article key={item.id}>
                  <Quote size={25} />
                  <Stars rating={item.rating} />
                  <blockquote>“{item.quote}”</blockquote>
                  <div>
                    <span>{businessInitials(item.author)}</span>
                    <strong>{item.author}<small>{item.context}{item.eventDate ? ` · ${item.eventDate}` : ""}</small></strong>
                  </div>
                </article>
              ))}
            </div>
            {editButton("testimonials", "testimonials")}
          </section>
        ) : null;
      case "faq":
        return faqs.length ? (
          <section id="faq" className="public-section public-faq">
            <div>
              <span>{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <div className="faq-note"><Phone size={18} /><span><small>Still wondering?</small><strong>{business.phone}</strong></span></div>
              <div className="faq-note"><Mail size={18} /><span><small>Write to us</small><strong>{business.email}</strong></span></div>
            </div>
            <div>
              {faqs.map((faq, index) => (
                <details key={faq.id} open={index === 0}>
                  <summary>{faq.question}<span>+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
            {editButton("faq", "FAQ")}
          </section>
        ) : null;
      case "contact":
        return (
          <section id="contact" className="service-area">
            <div><MapPin size={22} /><span>{section.eyebrow}</span></div>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            <div className="area-list">{business.serviceAreas.map(area => <span key={area}>{area}</span>)}</div>
            <div className="contact-detail-grid">
              {business.address && (
                <article><MapPin size={16} /><span><small>Kitchen &amp; studio</small><strong>{business.address}</strong>{business.mapUrl && <a href={business.mapUrl} target="_blank" rel="noreferrer">Open in maps <ArrowUpRight size={12} /></a>}</span></article>
              )}
              {theme.showOpeningHours && business.openingHours.length > 0 && (
                <article><Clock size={16} /><span><small>Office hours</small>{business.openingHours.map(hour => <strong key={hour.id}>{hour.days}<i>{hour.hours}</i></strong>)}</span></article>
              )}
              {business.travelPolicy && <article><Leaf size={16} /><span><small>Travel</small><strong>{business.travelPolicy}</strong></span></article>}
            </div>
            {editButton("contact", "service areas")}
          </section>
        );
      case "quote":
        return (
          <section id="quote" className="public-section public-quote">
            <aside>
              <span>{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <div className="quote-contact"><Phone size={18} /><span><small>Prefer to call?</small><strong>{business.phone}</strong></span></div>
              <div className="quote-contact"><CalendarDays size={18} /><span><small>Response time</small><strong>Within one business day</strong></span></div>
              {business.minimumGuests && <div className="quote-contact"><Users size={18} /><span><small>Minimum</small><strong>{business.minimumGuests}</strong></span></div>}
              <div className="planning-facts">
                {business.bookingNotice && <p><strong>Booking notice</strong>{business.bookingNotice}</p>}
                {business.depositPolicy && <p><strong>Deposit</strong>{business.depositPolicy}</p>}
                {business.cancellationPolicy && <p><strong>Cancellation</strong>{business.cancellationPolicy}</p>}
              </div>
            </aside>
            <QuoteRequestForm businessId={businessId} />
            {editButton("quote", "inquiry intro")}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn("public-site", `template-${theme.template}`, `header-${theme.headerStyle}`, preview && "is-preview", editable && "is-editable")}
      style={style}
    >
      {theme.showAnnouncement && theme.announcementText && (
        <div className="public-announcement"><span>{theme.announcementText}</span><a href="#quote">Check availability <ArrowRight size={12} /></a></div>
      )}
      <header className={cn("public-header", `nav-${theme.navigation}`, theme.showAnnouncement && "with-announcement")}>
        <Link href="#top" className="public-logo">
          {business.logo ? <img src={business.logo} alt={`${business.name} logo`} /> : <span>{initials}</span>}
          <strong>{business.name}</strong>
        </Link>
        <nav className={cn(mobileNav && "open")} aria-label="Catering website navigation">
          {anchorSections.map(id => sectionMap[id]?.visible && <a key={id} href={`#${id}`} onClick={() => setMobileNav(false)}>{sectionMap[id].label}</a>)}
          <a className="mobile-nav-phone" href={`tel:${business.phone}`}>{business.phone}</a>
        </nav>
        <a className="public-cta desktop-public-cta" href="#quote">{sectionMap.quote?.ctaLabel || "Request a quote"}</a>
        <button className="public-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation" aria-expanded={mobileNav}>{mobileNav ? <X /> : <Menu />}</button>
      </header>

      {sections.filter(section => section.visible && section.id !== "footer").map(section => <Fragment key={section.id}>{renderSection(section)}</Fragment>)}

      {sectionMap.footer?.visible && (
        <footer className="public-footer">
          <div>
            {business.logo ? <img className="public-footer-logo" src={business.logo} alt="" /> : <span className="public-footer-mark">{initials}</span>}
            <h2>{business.name}</h2>
            <p>{sectionMap.footer.body}</p>
            {theme.showSocialLinks && socialEntries.length > 0 && (
              <div className="footer-socials">
                {socialEntries.map(([network, url]) => (
                  <a key={network} href={url} target="_blank" rel="noreferrer" aria-label={network}><SocialIcon network={network} /><span>{network}</span></a>
                ))}
              </div>
            )}
          </div>
          <div>
            <strong>Explore</strong>
            {anchorSections.map(id => sectionMap[id]?.visible && <a key={id} href={`#${id}`}>{sectionMap[id].label}</a>)}
            <a href="#quote">{sectionMap.quote?.ctaLabel || "Plan your event"}</a>
          </div>
          <div>
            <strong>Contact</strong>
            <a href={`mailto:${business.email}`}>{business.email}</a>
            <a href={`tel:${business.phone}`}>{business.phone}</a>
            <span>{business.address}</span>
            <small>Serving {business.serviceAreas.slice(0, 3).join(", ")}</small>
          </div>
          <div>
            <strong>Good to know</strong>
            {theme.showOpeningHours && business.openingHours.map(hour => <span key={hour.id}>{hour.days} · {hour.hours}</span>)}
            {business.certifications.slice(0, 2).map(item => <span key={item}>{item}</span>)}
          </div>
          <small>© {new Date().getFullYear()} {business.name}. Thoughtfully built with <Link href="/">ServeSite</Link>.</small>
          {editButton("footer", "footer")}
        </footer>
      )}

      {business.whatsapp && (
        <a className="whatsapp-float" href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="Contact us on WhatsApp"><MessageCircle size={22} /><span>WhatsApp</span></a>
      )}

      {activeImage && lightboxIndex !== null && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onMouseDown={() => setLightboxIndex(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close gallery"><X /></button>
          <button className="lightbox-arrow prev" disabled={lightboxIndex === 0} onClick={event => { event.stopPropagation(); setLightboxIndex(index => Math.max(0, (index || 0) - 1)); }} aria-label="Previous image"><ChevronLeft /></button>
          <figure onMouseDown={event => event.stopPropagation()}>
            <img src={activeImage.url} alt={activeImage.caption} />
            <figcaption>
              <span>{activeImage.category}</span>
              <strong>{activeImage.caption}</strong>
              <em>{[activeImage.eventType, activeImage.guestCount, activeImage.location].filter(Boolean).join(" · ")}</em>
            </figcaption>
          </figure>
          <button className="lightbox-arrow next" disabled={lightboxIndex === shownGallery.length - 1} onClick={event => { event.stopPropagation(); setLightboxIndex(index => Math.min(shownGallery.length - 1, (index || 0) + 1)); }} aria-label="Next image"><ChevronRight /></button>
        </div>
      )}
    </div>
  );
}
