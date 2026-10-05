# Suntec Renewable Systems — Website (Nuxt 4)

SEO-first static website built with **Nuxt 4** and pre-rendered to plain HTML (`nuxt generate`).
The enquiry form saves to **Google Sheets** and emails the admin on every new enquiry.

## What's included for SEO

| Feature | Where |
|---|---|
| Pre-rendered HTML for every page (crawlable without JS) | `nitro.prerender` in `nuxt.config.ts` |
| Unique `<title>`, meta description, canonical URL per page | `app/composables/usePageSeo.ts` |
| Open Graph + Twitter card tags (WhatsApp/Facebook/LinkedIn previews) | `usePageSeo` |
| JSON-LD: `ElectricalContractor` business (address, phones, GST, founding year) | `schemaOrg.identity` in `nuxt.config.ts` |
| JSON-LD: `FAQPage` (home), `Service` ×4 (products), `ContactPage` | page files |
| `sitemap.xml` (with images) and `robots.txt` | `@nuxtjs/sitemap`, `@nuxtjs/robots` |
| Responsive WebP images with width/height (no layout shift) | `@nuxt/image` (`<NuxtImg>`) |
| One `<h1>` per page, semantic landmarks, geo meta | layouts/components |
| **English + Tamil** (`/` and `/ta/…`) with `hreflang` alternates, per-language canonical, `og:locale`, `<html lang>` | `@nuxtjs/i18n`, `layouts/default.vue` |
| Per-language sitemaps (`/sitemap_index.xml`) with hreflang links | `@nuxtjs/sitemap` (auto with i18n) |
| BreadcrumbList structured data on inner pages | `components/PageHero.vue` |
| Case-study pages per installation (`/projects/<slug>`) | `app/data/projects.ts` |
| Hero image preloaded with `fetchpriority=high` (LCP) | `heroImage` in `app/data/company.ts` |

## Project structure

```
app/
├── app.vue, error.vue
├── layouts/default.vue          Header + footer + WhatsApp button
├── pages/                       index, about, products, projects, contact
├── components/                  SiteHeader, SiteFooter, PageHero, CtaBanner, EnquiryForm, WhatsAppButton
├── composables/usePageSeo.ts    Per-page SEO tags
├── content/en.ts, ta.ts         ← All page copy, English and Tamil (typed by content/types.ts)
├── data/company.ts              ← Company facts: phones, address, clients, partners, hero image
├── data/projects.ts             ← Case studies
├── utils/enquiry.ts             Form validation (unit tested)
├── plugins/reveal.client.ts     Scroll fade-in animation
└── assets/css/main.css
public/img/                      Photos and diagrams
google-apps-script/Code.gs       Backend: Google Sheet + email alert
tests/unit/                      Vitest: validation, content parity, case studies, Apps Script backend
tests/nuxt/                      Vitest: EnquiryForm mounted in Nuxt (validation, submit, errors, Tamil)
```

All wording lives in `app/content/en.ts` and `app/content/ta.ts` — edit the same key in both.
`content/types.ts` makes a missing Tamil (or English) string a type error, and `tests/unit/content.test.ts`
fails if the two files' lists drift apart. Contact details, clients and partners are in
`app/data/company.ts` and update everywhere at once.

## Tamil version

Tamil pages are served at `/ta`, `/ta/about`, `/ta/products`, `/ta/projects`, `/ta/contact`.
The header has an English ⇄ தமிழ் switch. Visitors are **not** auto-redirected by browser language
(Google must always see the same page for a URL).

> The Tamil copy was AI-drafted. Have a native Tamil speaker at Suntec review
> `app/content/ta.ts` before launch — especially the hero, FAQ and product descriptions.

Enquiry option values are always submitted in English so the Google Sheet stays consistent;
a **Language** column records whether the visitor used the English or Tamil site.
(If you already deployed `Code.gs`, update it and create a new deployment version.)

## Case studies

Each entry in `app/data/projects.ts` becomes `/projects/<slug>` and `/ta/projects/<slug>`.

1. Fill in `location`, `capacityKwp`, `systemType`, `mounting`, `year`, `summary` (en + ta),
   `highlights` and `photos` (put images in `public/img/projects/`).
2. Set `published: true`.
3. `npm run generate` — the page is pre-rendered, linked from /projects and added to both sitemaps.

Entries missing capacity, location or summary stay drafts even if `published: true`. Drafts are
visible only in `npm run dev` (with a DRAFT banner and `noindex`) and are never built for production.
Only publish figures the client has confirmed.

## Hero photo

Edit `heroImage` in `app/data/company.ts`. Use a sharp landscape photo **at least 2400 px wide**
(ideally 3000+ px, a large plant shot in good light with sky). Once the width is ≥ 2400 px, the page
automatically serves 2× sizes for retina screens; below that it never upscales.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000 with hot reload
npm run generate   # static site → .output/public
npm test           # all tests (unit + Nuxt component)
npm run typecheck
```

## Configuration (environment variables)

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `NUXT_PUBLIC_SITE_URL` | Your live domain, e.g. `https://www.suntecsolar.in`. Used for canonical URLs, sitemap and OG images. **Set this to the real domain before going live.** |
| `NUXT_PUBLIC_ENQUIRY_ENDPOINT` | Google Apps Script web app URL (below). |

Both are baked in at `npm run generate` time — set them in your hosting provider's build
environment and redeploy after changing them.

## Enquiry form setup (Google Sheets + email alert) — free, ~5 minutes

1. Sign in to the Google account that should own the enquiries (e.g. `sun.vbss@gmail.com`).
2. Create a Google Sheet named **Suntec Website Enquiries**.
3. **Extensions → Apps Script**, replace the sample code with `google-apps-script/Code.gs`.
4. Edit `ADMIN_EMAILS` at the top for extra recipients (comma-separated). Save.
5. **Deploy → New deployment → Web app** — Execute as: **Me**, Who has access: **Anyone** → Deploy → authorise.
6. Copy the Web app URL (ends with `/exec`) into `NUXT_PUBLIC_ENQUIRY_ENDPOINT` and rebuild.
7. Submit a test enquiry. An **Enquiries** tab appears with the row (plus a **Status** column
   for follow-up tracking) and the admin receives an email; replying goes to the customer.

### How new enquiries show up in the Sheet

- Newest enquiry is inserted at the **top** (row 2), with **Status = New**.
- Rows are coloured by Status — pick from the dropdown as you follow up:
  **New** (orange, bold) → **Contacted** (yellow) → **Site Visit** (blue) → **Quoted** (indigo) → **Won** (green) / **Lost** (grey).
- The **Enquiries tab turns orange** while any enquiry is still New, and clears automatically once none are.
- The alert email's "Open enquiries sheet" link jumps straight to the newest row.

To apply the dropdown and tab colour to rows that existed before this version, open the Apps Script
editor, choose **setup** in the function list and click **Run** once.

> After editing `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
> Free Gmail accounts can send ~100 alert emails/day (Workspace: 1,500).

For instant phone alerts, enable Gmail app notifications, or in the sheet use
**Tools → Notification settings → Edit notifications → "Any changes" → "Right away"**.

## Deploy

**Netlify (recommended):** push this folder to GitHub → "Add new site → Import from Git".
`netlify.toml` already sets the build command and publish folder. Add the two environment
variables under *Site configuration → Environment variables*, then attach your domain.

Any static host also works (Cloudflare Pages, Vercel, GitHub Pages, cPanel): run
`npm run generate` and upload `.output/public`.

## After going live

1. Add the site to **Google Search Console** and verify the domain.
2. Submit `https://<domain>/sitemap_index.xml` (covers both languages).
3. Create / claim the **Google Business Profile** for Suntec (same name, address, phone as the site) —
   this drives "solar company near me" results far more than anything on-page.
4. Validate structured data at https://search.google.com/test/rich-results.
