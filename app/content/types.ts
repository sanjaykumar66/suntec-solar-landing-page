// Shape of all translatable copy. Every locale file must satisfy this type,
// so a missing Tamil (or English) string fails `npm run typecheck`.

import type { CustomerType, EnquiryProduct, RoofType } from '~/data/company'

export interface Seo {
  title: string
  description: string
}

export interface IconCard {
  icon: string
  title: string
  text: string
}

export interface Faq {
  q: string
  a: string
}

export interface Cta {
  title: string
  text: string
  label: string
}

export interface SolarSystemCopy {
  tag: string
  title: string
  intro: string
  points: string[]
  components?: string[]
  imageAlt: string
  enquireLabel: string
}

export interface SiteContent {
  common: {
    home: string
    breadcrumb: string
    menuOpen: string
    menuClose: string
    learnMore: string
    whatsappText: string
    whatsappLabel: string
    logoAlt: string
  }
  nav: { home: string; about: string; products: string; projects: string; quote: string }
  topbar: { tagline: string; taglineShort: string }
  footer: {
    blurb: string
    quickLinks: string
    solutions: string
    reachUs: string
    links: { about: string; products: string; projects: string; contact: string }
    solutionLinks: { onGrid: string; hybrid: string; offGrid: string; pumping: string; power: string }
    rights: string
    registrations: string
  }

  home: {
    seo: Seo
    badges: string[]
    heroTitle: string
    heroTitleHighlight: string
    heroLead: string
    heroImageAlt: string
    heroCta: string
    heroCtaSecondary: string
    stats: { value?: string; label: string }[]
    who: { eyebrow: string; title: string; text: string; points: string[]; cta: string; imageAlt: string }
    why: { eyebrow: string; title: string; items: string[] }
    solutions: { eyebrow: string; title: string; text: string; cards: { title: string; text: string; link: string; imageAlt: string }[] }
    triangle: { eyebrow: string; title: string; text: string; params: string[]; note: string; cta: string; imageAlt: string }
    clients: { eyebrow: string; title: string; all: string }
    faq: { eyebrow: string; title: string; items: Faq[] }
    cta: Cta
  }

  about: {
    seo: Seo
    hero: { title: string; subtitle: string; crumb: string }
    overview: { eyebrow: string; title: string; paragraphs: string[]; imageAlt: string }
    vision: { title: string; text: string }
    mission: { title: string; text: string }
    values: { eyebrow: string; title: string; items: IconCard[] }
    certs: { eyebrow: string; title: string; items: IconCard[] }
    establishments: {
      eyebrow: string
      title: string
      labels: { partners: string; proprietor: string; gst: string; address: string; email: string; enquiry: string; service: string; activity: string; teams: string }
      renewable: { meta: string; activity: string; teams: string; products: string[] }
      power: { meta: string; activity: string; teams: string; products: string[] }
    }
    cta: Cta
  }

  products: {
    seo: Seo
    hero: { title: string; subtitle: string; crumb: string }
    componentsTitle: string
    systems: { onGrid: SolarSystemCopy; hybrid: SolarSystemCopy; offGrid: SolarSystemCopy; pumping: SolarSystemCopy }
    mounting: { eyebrow: string; title: string; text: string; items: { title: string; text: string }[] }
    power: { eyebrow: string; title: string; text: string; items: IconCard[]; cta: string }
    process: { eyebrow: string; title: string; steps: { strong: string; text: string }[]; cta: string; imageAlt: string }
  }

  projects: {
    seo: Seo
    hero: { title: string; subtitle: string; crumb: string }
    featured: { eyebrow: string; title: string; view: string }
    gallery: { eyebrow: string; title: string; captions: string[] }
    clients: { eyebrow: string; title: string }
    partners: { eyebrow: string; title: string }
    industries: { eyebrow: string; title: string; items: { icon: string; name: string }[] }
    cta: Cta
  }

  caseStudy: {
    seoTitle: string // "{client}" and "{location}" are replaced
    seoDescription: string
    crumb: string
    facts: { capacity: string; system: string; mounting: string; location: string; year: string; sector: string }
    overview: string
    highlights: string
    gallery: string
    draft: string
    back: string
    cta: Cta
  }

  contact: {
    seo: Seo
    hero: { title: string; subtitle: string; crumb: string }
    checklist: { title: string; items: string[] }
    info: { title: string; office: string; sales: string; service: string; email: string }
    mapTitle: string
  }

  form: {
    name: string
    phone: string
    phonePlaceholder: string
    email: string
    city: string
    customerType: string
    product: string
    roofType: string
    monthlyBill: string
    monthlyBillPlaceholder: string
    ebNumber: string
    ebHint: string
    message: string
    messagePlaceholder: string
    select: string
    submit: string
    sending: string
    slow: string
    success: string
    notConfigured: string
    failed: string
    fallback: string // "{phone}" and "{email}" are replaced
    errors: { name: string; phone: string; email: string }
    options: {
      customerTypes: Record<CustomerType, string>
      products: Record<EnquiryProduct, string>
      roofTypes: Record<RoofType, string>
    }
  }

  error: { notFound: string; notFoundText: string; generic: string; genericText: string; back: string }
}
