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
- `lib/types.ts` defines the domain interfaces: `Business`, `BusinessTheme`, `WebsiteSection`, `MenuCategory`, `MenuItem`, `GalleryImage`, `Lead`, `LeadNote`, and `Subscription`.
- `lib/demo-data.ts` is the centralized seeded dataset.
- `components/app-provider.tsx` owns local application state and safe browser persistence.

All edits persist to the `servesite-demo-v1` key in `localStorage`. Initial rendering is server-safe, and the provider hydrates saved data only in the browser. The storage boundary is centralized so it can later be replaced by a Supabase repository without rewriting the route components.

## Product constraints

The website editor is intentionally section-based. Users can edit copy, visibility, order, theme, imagery, business information, service areas, menu data, and gallery data, but cannot freely position page elements. This keeps the generated sites presentation-ready.

Remote demo imagery uses Unsplash URLs. Public-site images include native fallback behavior for invalid customer image URLs.
