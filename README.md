# ServeSite

ServeSite is a Supabase-backed SaaS for food businesses — caterers, private chefs, restaurants, and more. It combines a controlled website builder, menu manager, gallery, detailed quote-request form, and a lightweight lead CRM — every customer signs up, sets up their own business, and publishes a generated website at `/site/<slug>`.

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
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000
```

`NEXT_PUBLIC_SITE_ORIGIN` must be set in every deployed environment. Canonical
URLs, the sitemap, Open Graph URLs, and password-reset links are built from it;
without it the app falls back to the request's `Host` header, which the caller
controls — the classic way to make a password-reset mail point at someone
else's domain.

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
| `/site/[businessSlug]` | The generated business website and quote form |
| `/robots.txt`, `/sitemap.xml` | Crawler directives and every published site |
| `/reset-password` | Where an emailed reset link lands; sets a new password |
| `/privacy`, `/terms` | Privacy Policy and Terms of Service |
| `/manifest.webmanifest` | Installable-app metadata, opening straight into `/dashboard` |
| `/site/[businessSlug]/opengraph-image` | Social card composed from the customer's photo, name, and palette |
| `/api/leads` | Validates and records an event request (the only write path for leads) |
| `/api/uploads` | Authenticated image upload and delete (Vercel Blob) |
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
- `components/traffic-chart.tsx` — the overview's 7/30/90-day area chart, zero-based and hoverable.
- `components/command-palette.tsx` + `lib/command-search.ts` — ⌘K search; the ranking is a pure, tested function.
- `components/workspace-shortcuts.tsx` — global key handling and the shortcut reference.
- `components/use-lead-status.ts` — the one path a lead's stage changes through, from the board or the drawer.
- `components/site-chrome.tsx` — scroll-linked chrome for a published site.
- `lib/theme.ts` — the colour-theme contract shared by the head bootstrap and the toggle.

There is no local seed data and no `localStorage` persistence: server components fetch from Supabase, and each editor persists its own change immediately. The single exception is the colour-theme choice, which is a device preference rather than account data.

### The visual system

`app/globals.css` opens with a token layer — neutral ramp, surfaces, brand, feedback, type scale, spacing, radii, elevation, and motion — and everything downstream is expressed in those tokens.

- **11px floor.** Nothing in the product chrome is smaller than 11px. The miniature website previews inside the editor are the deliberate exception: they are scale models of a page, so their type stays proportionally tiny.
- **Two brand tokens, not one.** `--green` is brand *ink* (links, active states, icons); `--brand-surface` is the solid brand *fill* behind white text. They diverge in dark mode, where ink lightens and the fill stays a deep plate.
- **Dark mode** is stamped on `<html>` by an inline bootstrap in `app/layout.tsx` before first paint, so switching never flashes. `system` is resolved in that script rather than in CSS, which keeps the whole contract to a single `[data-theme="dark"]` block, and it keeps following the OS as the OS changes.
- **Customer sites opt out.** `.public-site` pins every application token back to its light value: a published site is the customer's brand, and must render identically no matter which theme the operator happens to be using.

### Working at the keyboard

| Keys | Does |
| --- | --- |
| `⌘K` / `Ctrl+K` | Command palette over every page plus the account's own leads, dishes, and gallery images |
| `?` | The full shortcut reference |
| `G` then `O W C D M I L S P` | Jump to Overview, Website, Content, Design, Menu, Gallery, Leads, Settings, Preview |
| `⌘←` / `⌘→` | Move the focused inquiry between pipeline stages on the Leads board |

Leads also drag between Kanban columns with a pointer. Either way the move is optimistic, confirmed by an undoable toast, and rolled back if Supabase rejects it.

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

- Each generated site emits a canonical URL, Open Graph and Twitter metadata, and a schema.org graph (`FoodEstablishment`/`LocalBusiness`, `Menu`, `FAQPage`) built from the customer's real content. `/sitemap.xml` lists every published site; `/robots.txt` keeps dashboards and APIs out of the index.
- The social card for a published site is composed per business — hero photograph, name, tagline, service areas, and the customer's own palette — instead of handing a share dialog a raw stock photo. The photo is fetched with a deadline, so a slow host costs the card its background rather than the whole image.
- Keyboard support throughout: a skip link, visible focus rings, arrow-key menu tabs, and overlays that trap focus, close on Escape, restore focus, and lock background scrolling. `prefers-reduced-motion` disables smooth scrolling and reveal animations.
- The pipeline board is reachable without a pointer: `⌘←` / `⌘→` performs the same move a drag does, and the board carries a described-by hint saying so.
- Images load lazily, request a right-sized rendition from hosts that support it, and degrade to a placeholder instead of retrying a broken URL forever.
- `/api/uploads` requires a signed-in session and verifies the file's magic bytes; uploads are namespaced per user, capped at 300 images per account, and a replaced or cleared image is deleted from Blob storage rather than left public at its old URL. Because the URL to delete comes from the client, `ownsBlobUrl` re-checks the namespace server-side.
- Security headers are set in `next.config.ts`: a Content-Security-Policy, HSTS with `preload`, COOP, CORP, and the sniffing/framing/referrer set that was already there.
- Lead capture is server-side. The browser posts to `/api/leads`, which validates with the shared zod schema, checks the honeypot and submit timing where a bot cannot skip them, and applies a per-IP ceiling; `public.submit_lead` then re-checks the business and applies a per-business ceiling. The anon key can no longer write to `leads` directly.
- Everything a customer types that ends up in an `href` or `src` — social profiles, map links, logos, hero and gallery images — is narrowed to an absolute http(s) URL by `safeHttpUrl`, on the way into the database and again on the way out.

## Security operations

Some of what protects this product is configuration rather than code. The
application enforces what it can; the rest has to be switched on in the
Supabase project, and is listed here so it does not get forgotten.

### Turn these on in Supabase Auth

| Setting | Why |
| --- | --- |
| **Leaked password protection** (Auth → Policies) | Checks new passwords against the Have I Been Pwned corpus. The app enforces an eight-character minimum, which stops nothing on its own — reuse of an already-breached password is the realistic failure. |
| **Minimum password length = 8** | Matches `MIN_PASSWORD_LENGTH` in `lib/password.ts`, so the server agrees with the form. |
| **MFA (TOTP)** (Auth → Multi-Factor) | Available on every project. Enabling the factor is a project setting; the app does not yet render enrolment or challenge screens, so treat this as configured-but-unsurfaced until that UI exists. |
| **Rate limits** (Auth → Rate Limits) | Caps sign-in, sign-up, and password-reset email attempts per hour. The in-process limiter in `lib/rate-limit.ts` does not survive multiple serverless instances and is not a substitute. |
| **Confirm email** | Keeps someone from claiming an address they do not control. |

### Applying the migrations

`supabase/migrations/` runs in filename order, with one deliberate exception:
`20260728161000_restrict_anon_lead_insert.sql` removes anon's INSERT on
`leads` and must be applied **after** a deployment containing
`app/api/leads/route.ts` is live and a real submission has succeeded through
it. Until then both paths work; after it, `public.submit_lead` is the only
way a lead can be created. The file carries its own rollback.

The CHECK constraints are added `NOT VALID`, so they apply in full to every
future write while grandfathering rows that predate them. Once existing data
is known to comply, run `alter table … validate constraint …`.

### Known gaps

- **Bot submissions.** `/api/leads` checks a honeypot, submit timing, and a
  per-IP ceiling, and `public.submit_lead` adds a per-business hourly ceiling
  that survives someone calling PostgREST directly. None of that is a CAPTCHA.
  Verifying a Turnstile or reCAPTCHA token inside `submit_lead` is the real
  fix and the next thing to build.
- **Nonce-based CSP.** `script-src` still carries `'unsafe-inline'` because
  Next streams the RSC payload through per-request inline scripts. Minting a
  nonce in `proxy.ts` and letting Next stamp its own tags removes it.
- **No security event monitoring.** Failed sign-ins, password resets, and
  rate-limit rejections are not logged anywhere durable and nothing alerts on
  them, so a slow credential-stuffing run against the login form would pass
  unnoticed. Supabase Auth logs record the attempts; shipping them somewhere
  with alerting is outstanding work.

### Deleting an account and its data

There is no self-service delete button yet. The documented procedure is:

1. The account holder emails `privacy@servesite.example` from the address on
   the account.
2. Identity is confirmed against that address.
3. The row in `businesses` is deleted. Every child table — `website_sections`,
   `services`, `testimonials`, `faqs`, `stats`, `process_steps`,
   `team_members`, `menu_categories`, `menu_items`, `gallery_images`, `leads`,
   `lead_notes`, `site_visit_days` — cascades from it, so the event requests
   the business collected go with it.
4. The auth user is deleted through the Supabase dashboard or the Admin API.
5. Uploaded images under `blob:<user-id>/` are removed from Blob storage.
6. Backups age out on their own schedule within 30 days.

This matters beyond tidiness: the product stores end-client PII — names,
phone numbers, email addresses, event locations — that those clients gave to a
business, not to us. Building this as a self-service flow is tracked work, and
`/privacy` states the commitment in the meantime.

## On a phone, and on paper

- A published site keeps a fixed action bar at the bottom of the viewport on phones — call, WhatsApp, and request a quote — replacing the single floating bubble, because those are the things a visitor came to do. It respects `env(safe-area-inset-bottom)`.
- Past the hero, the site header condenses into a solid pinned bar and a thin progress rule tracks how far through the page a reader is. Both are skipped inside the dashboard's preview frame, where window scroll is not the page's scroll.
- Every dashboard route has a loading skeleton shaped like the page it stands in for, so navigation never shows a blank frame.
- The print stylesheet turns the open lead into a one-page event brief and a published site into a clean printed page: chrome, toolbars, and overlays drop out, and link targets are spelled out after their text.
