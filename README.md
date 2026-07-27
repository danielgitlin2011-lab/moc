# ServeSite MVP

ServeSite is a polished, local-first SaaS prototype for catering companies and private chefs. It combines a controlled website builder, menu manager, gallery, detailed quote-request form, and lightweight lead CRM.

The seeded demo business is **Olive & Ember Catering**, an elegant kosher caterer in Miami Beach.

## Run locally

Requirements:

- Node.js 22.13 or newer
- npm

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production and quality checks:

```bash
npm run build
npm run lint
npx tsc --noEmit
npm test
```

## Demo journey

1. Open the marketing page at `/`.
2. Start at `/onboarding` and complete the five setup steps.
3. Publish to the generated Olive & Ember demo website.
4. Submit an event request from `/site/olive-and-ember`.
5. Open `/dashboard/leads` to see the new request with **New** status.
6. Edit the request status, add an internal note, or switch to Kanban view.

Authentication, domain connections, notifications, subscriptions, and future quote/deposit features are clearly simulated. No paid external service is required.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public ServeSite marketing site |
| `/login` | Simulated authentication |
| `/onboarding` | Five-step business, template, brand, menu, and publish flow |
| `/dashboard` | Business overview and recent lead activity |
| `/dashboard/website` | Controlled section-based content editor |
| `/dashboard/content` | Services, highlights, process, team, testimonials, and FAQ collections |
| `/dashboard/design` | Template, palette, typography, and style editor |
| `/dashboard/menu` | Grid/table menu management with categories and filters |
| `/dashboard/gallery` | Gallery curation, captions, categories, and ordering |
| `/dashboard/leads` | Table/Kanban CRM with lead details and notes |
| `/dashboard/settings` | Business, domain, notification, plan, and reset controls |
| `/preview` | Desktop/mobile website preview |
| `/site/[businessSlug]` | Complete generated catering website and quote form |

## Architecture

- `app/` contains App Router route surfaces and the global visual system.
- `components/` contains reusable dashboard, editor, public-site, form, menu, and CRM components.
- `lib/types.ts` defines the domain interfaces: `Business`, `BusinessTheme`, `WebsiteSection`, `ServiceOffering`, `ProcessStep`, `TeamMember`, `Testimonial`, `FaqEntry`, `StatHighlight`, `MenuCategory`, `MenuItem`, `GalleryImage`, `Lead`, `LeadNote`, and `Subscription`.
- `lib/demo-data.ts` is the centralized seeded dataset.
- `components/app-provider.tsx` owns local application state and safe browser persistence.
- `components/image-uploader.tsx` optimizes customer images in the browser and uploads them via Vercel Blob.
- `app/api/uploads/` provides a validated image upload endpoint backed by Vercel Blob.

All edits persist to the `servesite-demo-v3` key in `localStorage`. Initial rendering is server-safe, and the provider hydrates saved data only in the browser. The storage boundary is centralized so it can later be replaced by a Supabase repository without rewriting the route components.

Uploaded image files are stored in Vercel Blob storage. Users can upload a logo, hero and story photography, menu-item images, and gallery images. Large photographs are resized and converted to WebP before upload.

## What a customer can put on their site

Every section of the generated website is driven by saved data — the renderer holds no sample copy of its own.

| Area | Editable from | What reaches the website |
| --- | --- | --- |
| Section copy | `/dashboard/website`, `/preview` | Eyebrow, headline, body, and button labels for each of the 13 sections, plus order and visibility |
| Business profile | `/dashboard/settings` → Business details | Name, type, tagline, description, long-form story, contact details, address, map link, service areas, founding year, team size, languages, certifications, awards |
| Booking policies | `/dashboard/settings` → Booking policies | Minimum booking, booking notice, deposit, cancellation, and travel policies — shown beside the quote form and in the contact section |
| Hours and social | `/dashboard/settings` → Hours & social | An editable list of opening hours plus five social profiles; empty profiles are hidden automatically |
| Services | `/dashboard/content` → Services | Title, description, image, price from, guest capacity, and an inclusion list per service |
| Highlights | `/dashboard/content` → Highlights | The stat band above the About section |
| Process | `/dashboard/content` → How it works | A numbered planning timeline with a duration per step |
| Team | `/dashboard/content` → Team | Portrait, name, role, and bio per team member |
| Testimonials | `/dashboard/content` → Testimonials | Quote, author, context, event date, and a star rating that also feeds the aggregate score |
| FAQ | `/dashboard/content` → FAQ | Question and answer pairs |
| Menu | `/dashboard/menu` | Per dish: name, description, price and unit, image, category, dietary labels, allergens, ingredients, serving size, preparation, lead time, minimum order, seasonality, signature flag, availability. Categories carry a description shown above their tab |
| Gallery | `/dashboard/gallery` | Image, caption, collection, event type, guest count, and location — surfaced in the collection filter and lightbox |
| Design | `/dashboard/design` | Five templates, colour palettes and individual colours including the page background, heading and body fonts, headline scale, logo, hero composition, section layouts, how many dishes and images appear, and five disclosure toggles for prices, dietary labels, allergens, opening hours, and social links |

## Product constraints

The website editor is intentionally section-based. Users can edit copy, visibility, order, theme, imagery, business information, service areas, menu data, and gallery data, but cannot freely position page elements. This keeps the generated sites presentation-ready.

The preview route also includes an **Edit on page** mode. It exposes controlled editing handles on each generated-site section while preserving the selected template’s layout.

Templates, palettes, fonts, and disclosure toggles are theme values rather than freeform styling, so a customer can restyle their whole site without producing a broken page. Font choices resolve through `fontStack` in `lib/utils.ts`, which pairs the chosen family with a resilient system fallback.

Remote demo imagery uses Unsplash URLs. Public-site images include native fallback behavior for invalid customer image URLs.
