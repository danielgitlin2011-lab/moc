# ServeSite

ServeSite is a Supabase-backed SaaS for catering companies and private chefs. It combines a controlled website builder, menu manager, gallery, detailed quote-request form, and a lightweight lead CRM — every customer signs up, sets up their own business, and publishes a generated website at `/site/<slug>`.

## Run locally

Requirements:

- Node.js 22.13 or newer
- npm
- A Supabase project

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon or publishable key>
BLOB_READ_WRITE_TOKEN=<vercel blob token>   # image uploads only
```

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test:unit   # fast behavioural tests, no build needed
npm test            # production build + the full suite
```

## Customer journey

1. Sign up at `/signup`.
2. Complete the five-step setup at `/onboarding` — business, template, branding, first menu items, publish.
3. Manage everything from `/dashboard`.
4. Visitors send event requests from `/site/<slug>`; each one lands in `/dashboard/leads` with **New** status.
5. Track the request through Contacted → Quote sent → Won/Lost, and add internal notes.

Domain connection, notifications, subscriptions, and quote/deposit generation are still simulated and clearly labelled as such in the UI.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public ServeSite marketing site |
| `/login`, `/signup` | Supabase email + password authentication |
| `/onboarding` | Five-step business, template, brand, menu, and publish flow |
| `/dashboard` | Overview built from measured data |
| `/dashboard/website` | Controlled section-based content editor |
| `/dashboard/content` | Services, highlights, process, team, testimonials, and FAQ collections |
| `/dashboard/design` | Template, palette, typography, and style editor |
| `/dashboard/menu` | Grid/table menu management with categories and filters |
| `/dashboard/gallery` | Gallery curation, captions, categories, and ordering |
| `/dashboard/leads` | Table/Kanban CRM with lead details and notes |
| `/dashboard/settings` | Business profile, policies, publishing, domain, notifications, and plan |
| `/preview` | Desktop/mobile preview with on-page editing |
| `/site/[businessSlug]` | The generated catering website and quote form |
| `/robots.txt`, `/sitemap.xml` | Crawler directives and every published site |
| `/api/uploads` | Authenticated image upload (Vercel Blob) |
| `/api/track` | Records one website view per visitor session |

## Architecture

- `app/` — App Router routes, metadata, and the global visual system (`app/globals.css`).
- `components/` — dashboard, editor, public-site, form, menu, and CRM components.
- `lib/types.ts` — the domain model: `Business`, `BusinessTheme`, `WebsiteSection`, `ServiceOffering`, `ProcessStep`, `TeamMember`, `Testimonial`, `FaqEntry`, `StatHighlight`, `MenuCategory`, `MenuItem`, `GalleryImage`, `Lead`, `LeadNote`, `SiteVisitDay`, `Subscription`.
- `lib/supabase/` — browser, server, and middleware clients, generated `types.ts`, row⇄domain `mappers.ts`, and the two loaders that assemble an `AppState`:
  - `get-business-bundle.ts` — the signed-in owner's workspace, including leads and 90 days of traffic.
  - `get-public-business.ts` — the published, visitor-facing bundle (no leads, no analytics).
- `lib/analytics.ts` — pure functions behind every dashboard number: view/lead trends, booking rate, profile completion.
- `lib/structured-data.ts` — schema.org graph for a generated site; `lib/seo.ts` resolves the request origin.
- `components/app-provider.tsx` — client state seeded from the server-fetched bundle; edits write straight back to Supabase.
- `components/site-image.tsx` — every customer-supplied image, with a single-shot fallback and lazy loading.
- `components/use-modal-behavior.ts` — Escape, focus trap, focus restore, and scroll lock for overlays.

There is no local seed data and no `localStorage` persistence: server components fetch from Supabase, and each editor persists its own change immediately.

### Database

Row Level Security is enabled on every table. Owners reach only their own business and its children; anonymous visitors can read the content of **published** businesses and insert a lead against one. Two extras support the dashboard:

- `businesses.published_at` — when the site last went live.
- `site_visit_days (business_id, visited_on, views)` — one aggregated counter row per business per day, written only through the `record_site_visit` security-definer function, readable only by the owner.

Leads also carry `source` and `referrer`, captured from UTM parameters and the referring page.

### Numbers in the dashboard

Every figure on `/dashboard` is derived from the account's own rows — views from `site_visit_days`, inquiry counts and booking rate from `leads`, profile completion from the content that exists. When there is nothing to measure yet, the UI says so instead of showing a placeholder number.

## What a customer can put on their site

Every section of the generated website is driven by saved data — the renderer holds no sample copy of its own.

| Area | Editable from | What reaches the website |
| --- | --- | --- |
| Section copy | `/dashboard/website`, `/preview` | Eyebrow, headline, body, and button labels for each of the 13 sections, plus order and visibility |
| Business profile | `/dashboard/settings` → Business details | Name, type, tagline, description, long-form story, contact details, address, map link, service areas, founding year, team size, languages, certifications, awards |
| Booking policies | `/dashboard/settings` → Booking policies | Minimum booking, booking notice, deposit, cancellation, and travel policies — shown beside the quote form and in the contact section |
| Publishing | `/dashboard/settings` → Domain & publishing | Whether the site is reachable at all, and when it went live |
| Hours and social | `/dashboard/settings` → Hours & social | An editable list of opening hours plus five social profiles; empty profiles are hidden automatically |
| Services | `/dashboard/content` → Services | Title, description, image, price from, guest capacity, and an inclusion list per service |
| Highlights | `/dashboard/content` → Highlights | The stat band above the About section |
| Process | `/dashboard/content` → How it works | A numbered planning timeline with a duration per step |
| Team | `/dashboard/content` → Team | Portrait, name, role, and bio per team member |
| Testimonials | `/dashboard/content` → Testimonials | Quote, author, context, event date, and a star rating that also feeds the aggregate score and the site's structured data |
| FAQ | `/dashboard/content` → FAQ | Question and answer pairs, also published as `FAQPage` structured data |
| Menu | `/dashboard/menu` | Per dish: name, description, price and unit, image, category, dietary labels, allergens, ingredients, serving size, preparation, lead time, minimum order, seasonality, signature flag, availability. Categories carry a description shown above their tab |
| Gallery | `/dashboard/gallery` | Image, caption, collection, event type, guest count, and location — surfaced in the collection filter and lightbox |
| Design | `/dashboard/design` | Five templates, colour palettes and individual colours, heading and body fonts, headline scale, logo, hero composition, section layouts, how many dishes and images appear, and five disclosure toggles |

## Product constraints

The website editor is intentionally section-based. Users can edit copy, visibility, order, theme, imagery, business information, service areas, menu data, and gallery data, but cannot freely position page elements. This keeps generated sites presentation-ready.

The preview route also includes an **Edit on page** mode, exposing controlled editing handles on each section while preserving the template's layout.

Templates, palettes, fonts, and disclosure toggles are theme values rather than freeform styling, so a customer can restyle a whole site without producing a broken page. Font choices resolve through `fontStack` in `lib/utils.ts`.

## SEO, accessibility, and security

- Each generated site emits a canonical URL, Open Graph and Twitter metadata, and a schema.org graph (`Caterer`/`LocalBusiness`, `Menu`, `FAQPage`) built from the customer's real content. `/sitemap.xml` lists every published site; `/robots.txt` keeps dashboards and APIs out of the index.
- Keyboard support throughout: a skip link, visible focus rings, arrow-key menu tabs, and overlays that trap focus, close on Escape, restore focus, and lock background scrolling. `prefers-reduced-motion` disables smooth scrolling and reveal animations.
- Images load lazily, request a right-sized rendition from hosts that support it, and degrade to a placeholder instead of retrying a broken URL forever.
- `/api/uploads` requires a signed-in session and verifies the file's magic bytes; uploads are namespaced per user. Security headers are set in `next.config.ts`. The quote form carries a honeypot and a submit-timing check.
