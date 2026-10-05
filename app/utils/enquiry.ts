// Pure validation for the enquiry form — kept framework-free so it is unit-testable.

export interface EnquiryInput {
  name: string
  phone: string
  email: string
  city: string
  customerType: string
  product: string
  roofType: string
  monthlyBill: string
  ebNumber: string
  message: string
  /** Honeypot — must stay empty for real users. */
  website: string
}

export type EnquiryError = 'name' | 'phone' | 'email'

export function emptyEnquiry(product = ''): EnquiryInput {
  return { name: '', phone: '', email: '', city: '', customerType: '', product, roofType: '', monthlyBill: '', ebNumber: '', message: '', website: '' }
}

const PHONE_RE = /^(\+?91)?[6-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns the first invalid field (messages are localized by the caller), or null when valid. */
export function validateEnquiry(input: EnquiryInput): EnquiryError | null {
  if (input.name.trim().length < 2) return 'name'
  if (!PHONE_RE.test(input.phone.replace(/[\s-]/g, ''))) return 'phone'
  const email = input.email.trim()
  if (email && !EMAIL_RE.test(email)) return 'email'
  return null
}

export function isSpam(input: EnquiryInput): boolean {
  return input.website.trim() !== ''
}
