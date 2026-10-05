import { describe, expect, it } from 'vitest'
import { emptyEnquiry, isSpam, validateEnquiry } from '../../app/utils/enquiry'

const valid = () => ({ ...emptyEnquiry(), name: 'Ravi Kumar', phone: '98435 02872' })

describe('validateEnquiry', () => {
  it('accepts a name and Indian mobile number', () => {
    expect(validateEnquiry(valid())).toBeNull()
  })

  it('accepts +91 prefixed numbers with dashes', () => {
    expect(validateEnquiry({ ...valid(), phone: '+91-82480-33140' })).toBeNull()
  })

  it('rejects a missing name', () => {
    expect(validateEnquiry({ ...valid(), name: ' ' })).toBe('name')
  })

  it('rejects short or landline-style numbers', () => {
    expect(validateEnquiry({ ...valid(), phone: '12345' })).toBe('phone')
    expect(validateEnquiry({ ...valid(), phone: '4222345678' })).toBe('phone')
  })

  it('treats email as optional but validates it when given', () => {
    expect(validateEnquiry({ ...valid(), email: 'ravi@example.com' })).toBeNull()
    expect(validateEnquiry({ ...valid(), email: 'ravi@' })).toBe('email')
  })
})

describe('isSpam', () => {
  it('flags submissions where the hidden honeypot field is filled', () => {
    expect(isSpam({ ...valid(), website: 'http://spam.example' })).toBe(true)
    expect(isSpam(valid())).toBe(false)
  })
})
