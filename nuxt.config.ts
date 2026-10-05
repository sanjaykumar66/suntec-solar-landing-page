// https://nuxt.com/docs/api/configuration/nuxt-config
import { company } from './app/data/company'
import { visibleCaseStudies } from './app/data/projects'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://www.suntecsolar.in'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/i18n', '@nuxt/image', '@nuxtjs/sitemap', '@nuxtjs/robots', 'nuxt-schema-org'],

  css: ['~/assets/css/main.css'],

  // Shared by sitemap, robots, schema.org and canonical URLs.
  site: {
    url: siteUrl,
    name: 'Suntec Renewable Systems',
    description:
      'MNRE enlisted solar EPC company in Coimbatore — on-grid, hybrid, off-grid solar and solar water pumping from 1 kWp to MW scale.',
    defaultLocale: 'en-IN',
  },

  // English at /, Tamil at /ta/… — each page gets hreflang alternates, canonical and og:locale.
  i18n: {
    locales: [
      { code: 'en', language: 'en-IN', name: 'English' },
      { code: 'ta', language: 'ta-IN', name: 'தமிழ்' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    baseUrl: siteUrl,
    // Never auto-redirect by browser language: crawlers must see the same page for a URL.
    detectBrowserLanguage: false,
  },

  runtimeConfig: {
    public: {
      siteUrl,
      // Google Apps Script web app URL — set NUXT_PUBLIC_ENQUIRY_ENDPOINT before `npm run generate`.
      enquiryEndpoint: '',
      whatsappNumber: '919843502872',
    },
  },

  app: {
    head: {
      titleTemplate: '%s',
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/favicon.jpg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&family=Open+Sans:wght@400;600&family=Poppins:wght@500;600;700&display=swap',
        },
      ],
      meta: [
        { name: 'theme-color', content: '#f28c28' },
        { name: 'geo.region', content: 'IN-TN' },
        { name: 'geo.placename', content: 'Coimbatore' },
      ],
    },
  },

  image: {
    format: ['webp'],
    quality: 78,
  },

  // Site-wide structured data: Google uses this for the business knowledge panel / local results.
  schemaOrg: {
    identity: {
      '@type': 'ElectricalContractor',
      name: company.name,
      alternateName: company.brand,
      description:
        'MNRE enlisted solar EPC company and PM Surya Ghar registered vendor supplying on-grid, hybrid, off-grid solar and solar water pumping systems.',
      logo: '/img/logo.jpg',
      image: ['/img/gi-roof-mounting.jpg', '/img/team.jpg'],
      email: company.email,
      telephone: company.phones[0].tel,
      taxID: company.gst,
      foundingDate: String(company.foundedSolar),
      address: {
        streetAddress: company.address.street,
        addressLocality: company.address.locality,
        addressRegion: company.address.region,
        postalCode: company.address.postalCode,
        addressCountry: company.address.country,
      },
      contactPoint: company.phones.map((p) => ({
        telephone: p.tel,
        contactType: 'sales',
        areaServed: 'IN',
        availableLanguage: ['English', 'Tamil'],
      })),
      areaServed: { '@type': 'State', name: 'Tamil Nadu' },
      priceRange: '₹₹',
    },
  },

  sitemap: {
    xslColumns: [{ label: 'URL', width: '65%' }, { label: 'Last Modified', select: 'sitemap:lastmod', width: '35%' }],
  },

  // Fully static output (`npm run generate`) — host on Netlify, Cloudflare Pages, GitHub Pages, etc.
  nitro: {
    prerender: {
      crawlLinks: true,
      // Case-study pages are also listed explicitly in case nothing links to one yet.
      routes: [
        '/',
        '/ta',
        '/sitemap_index.xml',
        '/robots.txt',
        ...visibleCaseStudies(false).flatMap((p) => [`/projects/${p.slug}`, `/ta/projects/${p.slug}`]),
      ],
    },
  },
})
