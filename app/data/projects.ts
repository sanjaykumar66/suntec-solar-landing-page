// Case studies — one page per installation at /projects/<slug> (and /ta/projects/<slug>).
//
// Only entries with `published: true` AND the required facts (capacity, location, summary)
// are linked, pre-rendered and added to the sitemap. Drafts are visible in `npm run dev` only,
// so incomplete pages never go live. Never publish figures you haven't confirmed with the client.

export type SystemType = 'onGrid' | 'hybrid' | 'offGrid' | 'pumping'
export type MountingType = 'giRoof' | 'rccRoof' | 'ground'

export interface Localized<T = string> {
  en: T
  ta: T
}

export interface ProjectPhoto {
  /** Path under /public, e.g. "/img/projects/psg-roof.jpg" */
  src: string
  width: number
  height: number
  alt: Localized
}

export interface CaseStudy {
  slug: string
  client: string
  published: boolean
  sector: Localized
  location?: Localized
  capacityKwp?: number
  systemType?: SystemType
  mounting?: MountingType
  year?: number
  summary?: Localized
  highlights?: Localized<string[]>
  photos: ProjectPhoto[]
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'psg-institutions',
    client: 'PSG Institutions',
    published: false,
    sector: { en: 'Education', ta: 'கல்வி' },
    photos: [],
  },
  {
    slug: 'avinashilingam-university',
    client: 'Avinashilingam University',
    published: false,
    sector: { en: 'Education', ta: 'கல்வி' },
    photos: [],
  },
  {
    slug: 'winsome-knit-group',
    client: 'Winsome Knit Group',
    published: false,
    sector: { en: 'Textiles', ta: 'ஜவுளி' },
    photos: [],
  },
  {
    slug: 'right-hospitals',
    client: 'Right Hospitals',
    published: false,
    sector: { en: 'Healthcare', ta: 'மருத்துவம்' },
    photos: [],
  },
  {
    slug: 'sri-chaitanya-edu-institutions',
    client: 'Sri Chaitanya Edu Institutions',
    published: false,
    sector: { en: 'Education', ta: 'கல்வி' },
    photos: [],
  },
  {
    slug: 'gowrish-cnc-machinery',
    client: 'Gowrish CNC Machinery Group',
    published: false,
    sector: { en: 'Manufacturing', ta: 'உற்பத்தி' },
    photos: [],
  },
]

/** A case study is only publishable when its key facts are filled in. */
export function isPublishable(p: CaseStudy): boolean {
  return p.published && p.capacityKwp != null && p.location != null && p.summary != null
}

/** Case studies visible in this build: publishable ones, plus drafts when `includeDrafts` (dev). */
export function visibleCaseStudies(includeDrafts: boolean): CaseStudy[] {
  return caseStudies.filter((p) => isPublishable(p) || includeDrafts)
}

export function formatCapacity(kwp: number): string {
  return kwp >= 1000 ? `${(kwp / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} MWp` : `${kwp.toLocaleString('en-IN')} kWp`
}
