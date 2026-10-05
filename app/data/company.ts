// Single source of truth for company facts used across pages, header, footer and structured data.

export const company = {
  name: 'Suntec Renewable Systems',
  brand: 'SUNTEC SOLAR',
  foundedSolar: 2012,
  installedCapacity: '2.5+ MWp',
  email: 'sun.vbss@gmail.com',
  altEmail: 'suntec.cbe@gmail.com',
  address: {
    street: '2/26, K R Building, Sathy Main Road, Kovilpalayam',
    locality: 'Coimbatore',
    region: 'Tamil Nadu',
    postalCode: '641107',
    country: 'IN',
  },
  phones: [
    { label: 'N. Balraj', display: '98435 02872', tel: '+919843502872' },
    { label: 'M. Velusamy', display: '82480 33140', tel: '+918248033140' },
  ],
  servicePhones: [
    { display: '98426 98554', tel: '+919842698554' },
    { display: '80725 05379', tel: '+918072505379' },
  ],
  gst: '33AEDFS3056D1ZE',
} as const

export const fullAddress = `${company.address.street}, ${company.address.locality} – ${company.address.postalCode}`

export const clients = [
  'PSG Institutions',
  'Winsome Knit Group',
  'SD Garments',
  'Sirius Machinery',
  'Narayana Group of Institutions (SCL)',
  'Right Hospitals',
  'Tranz India',
  'Gowrish CNC Machinery Group',
  'Jaisakthi Garments',
  'Lotus CNC Machinery',
  'JKS Precision Components',
  'Avinashilingam University',
  'Sri Guru Extractions',
  'Arun Financial Consultants',
  'Sri Chaitanya Edu Institutions',
  'Dhanam Plastics',
  'Sree Dharmasastha School',
]

export const partners = [
  'Waaree Energies',
  'Viridius Energy',
  'Sunit Future',
  'SolarEdge Technologies',
  'Growatt Solar',
  'DEYE',
  'Goldisun',
  'Festa Solar',
  'Avaada Solar',
]

// Option values submitted to the Google Sheet (always English). Labels are translated in app/content/*.
export const enquiryProducts = [
  'On-Grid Solar',
  'Hybrid Solar',
  'Off-Grid Solar',
  'Solar Water Pumping',
  'Solar Water Heater',
  'UPS / Batteries / Stabilizer',
  'PM Surya Ghar (Residential Subsidy)',
  'Not sure – need advice',
] as const

export const customerTypes = [
  'Domestic / Residential',
  'Commercial',
  'Industrial (LT)',
  'Industrial (HT)',
  'Educational Institution',
  'Agricultural',
  'Other',
] as const

export const roofTypes = ['Flat RCC', 'Galvanized (GI) taper sheet', 'Ground', 'Other'] as const

export type EnquiryProduct = (typeof enquiryProducts)[number]
export type CustomerType = (typeof customerTypes)[number]
export type RoofType = (typeof roofTypes)[number]

// Home-page hero. To use a new photo: put a wide (≥ 2400 px), sharp image in public/img/
// and update src/width/height here — the page preloads it and serves responsive WebP automatically.
export const heroImage = { src: '/img/gi-roof-mounting.jpg', width: 1280, height: 590 }
