import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  MessageSquareText,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { BrandMark, LinkButton } from "@/components/ui";
import { sizedImage } from "@/lib/utils";

const features = [
  { icon: LayoutTemplate, title: "Niche-perfect websites", body: "Choose a polished catering template and customize the details—without ever breaking the design." },
  { icon: UtensilsCrossed, title: "Menus that sell the experience", body: "Organize dishes, packages, dietary labels, pricing, and seasonal availability in minutes." },
  { icon: MessageSquareText, title: "Better event inquiries", body: "Capture guest count, budget, menu preferences, and event details before the first call." },
  { icon: FileText, title: "A lightweight catering CRM", body: "Keep every lead, note, and follow-up together from first inquiry to booked event." },
  { icon: ImageIcon, title: "Galleries made simple", body: "Showcase weddings, private dinners, and corporate events with a curated visual story." },
  { icon: Sparkles, title: "Always presentation-ready", body: "Every controlled option is designed to keep your site cohesive, premium, and mobile-ready." },
];

const plans = [
  { name: "Starter", price: "₪149", description: "For new caterers ready to look established.", features: ["Professional website", "Custom domain support", "Up to 30 menu items", "Quote request form", "WhatsApp button"] },
  { name: "Business", price: "₪249", description: "For growing teams turning inquiries into events.", featured: true, features: ["Unlimited menu items", "Lead management dashboard", "Event galleries", "Advanced quote form", "Remove ServeSite branding"] },
  { name: "Pro", price: "₪449", description: "For established catering operations.", features: ["Everything in Business", "Online deposits — Coming soon", "Automated quotes — Coming soon", "Multiple team members — Coming soon", "Priority support"] },
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <a className="skip-link" href="#features">Skip to main content</a>
      <header className="marketing-nav container">
        <BrandMark />
        <nav aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="text-link">Log in</Link>
          <LinkButton href="/onboarding">Create your website <ArrowRight size={16} /></LinkButton>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy container">
          <span className="eyebrow"><CircleCheck size={15} /> Built exclusively for catering businesses</span>
          <h1>Your catering website, menu, and leads—<em>all in one place.</em></h1>
          <p>Launch a professional catering website, display your menus, and receive detailed event requests without dealing with complicated website builders.</p>
          <div className="hero-actions">
            <LinkButton href="/onboarding">Create your website <ArrowRight size={17} /></LinkButton>
            <LinkButton href="/site/olive-and-ember" variant="secondary">View live demo</LinkButton>
          </div>
          <div className="hero-note"><span>14-day free trial</span><span>No credit card</span><span>Publish in under an hour</span></div>
        </div>
        <div className="hero-showcase container">
          <div className="browser-frame">
            <div className="browser-bar"><span /><span /><span /><div>oliveandember.servesite.co</div></div>
            <div className="browser-content">
              <img src={sizedImage("https://images.unsplash.com/photo-1555244162-803834f70033", 1600)} alt="Elegant catered table" width={1600} height={900} fetchPriority="high" decoding="sync" />
              <div className="browser-overlay"><small>OLIVE &amp; EMBER</small><h2>Gather beautifully.<br />Dine memorably.</h2><p>Elegant kosher catering for unforgettable gatherings in Miami.</p><span className="demo-button">Plan your event</span></div>
            </div>
          </div>
          <div className="floating-lead">
            <div className="lead-avatar">RL</div>
            <div><strong>New wedding inquiry</strong><span>Rachel · 120 guests · Miami</span></div>
            <span className="new-dot" />
          </div>
        </div>
      </section>

      <section className="brand-strip"><div className="container"><span>Designed for</span><strong>Private chefs</strong><i /> <strong>Wedding caterers</strong><i /> <strong>Kosher kitchens</strong><i /> <strong>Corporate caterers</strong></div></section>

      <section id="features" className="section container">
        <div className="section-heading split-heading"><div><span className="eyebrow plain">One focused workspace</span><h2>Everything your catering business needs online.</h2></div><p>ServeSite replaces the patchwork of a generic website builder, PDF menus, and scattered inquiry emails with one elegant system.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, body }) => <article className="feature-card" key={title}><Icon size={23} /><h3>{title}</h3><p>{body}</p><span>Explore feature <ChevronRight size={14} /></span></article>)}</div>
      </section>

      <section className="how-section">
        <div className="container">
          <div className="section-heading centered"><span className="eyebrow plain">From idea to inquiries</span><h2>Your new site, live in three steps.</h2></div>
          <div className="steps">{[
            ["01", "Share your business", "Add your specialty, service areas, contact details, and the story behind your food."],
            ["02", "Choose your look", "Select a catering-first template, then tune colors, typography, imagery, and content."],
            ["03", "Publish and grow", "Go live on your demo URL and manage detailed catering requests from one dashboard."],
          ].map(([n, title, body]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div>
      </section>

      <section id="templates" className="section container">
        <div className="section-heading split-heading"><div><span className="eyebrow plain">Catering-first templates</span><h2>Distinctive by design. Impossible to break.</h2></div><p>Controlled customization keeps every page polished across desktop and mobile—no nudging boxes or fixing broken layouts.</p></div>
        <div className="template-showcase">
          <article className="template-preview editorial-preview"><div className="template-image"><img src={sizedImage("https://images.unsplash.com/photo-1515003197210-e0cd71810b5f", 800)} alt="Editorial catering template" width={800} height={1000} loading="lazy" decoding="async" /><span>Gather<br />beautifully.</span></div><div><strong>Editorial</strong><small>Elegant serif · Premium events</small></div></article>
          <article className="template-preview modern-preview"><div className="template-image"><div><b>GOOD FOOD.<br />GREAT PEOPLE.</b><img src={sizedImage("https://images.unsplash.com/photo-1547592180-85f173990554", 800)} alt="Modern catering template" width={800} height={1000} loading="lazy" decoding="async" /></div></div><div><strong>Modern</strong><small>Bold grid · Clean sans-serif</small></div></article>
          <article className="template-preview warm-preview"><div className="template-image"><img src={sizedImage("https://images.unsplash.com/photo-1533777857889-4be7c70b33f7", 800)} alt="Warm catering template" width={800} height={1000} loading="lazy" decoding="async" /><span>Food made<br />with heart.</span></div><div><strong>Warm</strong><small>Welcoming · Family-style</small></div></article>
        </div>
      </section>

      <section className="testimonial-band">
        <div className="container"><div className="quote-mark">“</div><blockquote>ServeSite makes our business look as considered online as our events feel in person. The best part is how much more useful every new inquiry is.</blockquote><div className="quote-person"><span>AE</span><div><strong>Arielle E.</strong><small>Founder, Cedar Table Events · Demo testimonial</small></div></div></div>
      </section>

      <section id="pricing" className="section container">
        <div className="section-heading centered"><span className="eyebrow plain">Simple pricing</span><h2>Choose the plan that fits your table.</h2><p>Start with a 14-day trial. Upgrade, downgrade, or cancel anytime.</p></div>
        <div className="pricing-grid">{plans.map((plan) => <article className={`pricing-card ${plan.featured ? "featured" : ""}`} key={plan.name}>{plan.featured && <span className="popular">Most popular</span>}<h3>{plan.name}</h3><p>{plan.description}</p><div className="price">{plan.price}<small>/month</small></div><LinkButton href="/onboarding" variant={plan.featured ? "primary" : "secondary"}>Start free trial</LinkButton><ul>{plan.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul></article>)}</div>
      </section>

      <section className="faq-section container">
        <div><span className="eyebrow plain">FAQ</span><h2>A few helpful answers.</h2><p>Still deciding? Explore the demo to see the complete customer journey.</p><LinkButton href="/site/olive-and-ember" variant="secondary">Explore the demo</LinkButton></div>
        <div className="faq-list">{[
          ["Do I need design or technical experience?", "Not at all. ServeSite gives you controlled, catering-specific options so you can personalize your site without managing layouts or code."],
          ["Can I use my own domain?", "Yes. Every plan supports a custom domain. The prototype includes the connection flow and DNS guidance."],
          ["Can customers pay deposits online?", "Online deposits are planned for Pro and clearly marked as coming soon in this prototype."],
          ["Will my site work on mobile?", "Yes. Every template and dashboard workflow is responsive by design."],
        ].map(([q, a], index) => <details key={q} open={index === 0}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div>
      </section>

      <section className="final-cta"><div className="container"><span className="eyebrow">Your next event could start here</span><h2>A better website. Better inquiries.<br />More memorable events.</h2><LinkButton href="/onboarding">Create your catering website <ArrowRight size={17} /></LinkButton></div></section>

      <footer className="marketing-footer container"><BrandMark /><p>Websites and lead management, purpose-built for caterers.</p><div><Link href="/login">Log in</Link><a href="#pricing">Pricing</a><Link href="/site/olive-and-ember">Demo site</Link></div><small>© 2026 ServeSite. Demo product prototype.</small></footer>
    </main>
  );
}
