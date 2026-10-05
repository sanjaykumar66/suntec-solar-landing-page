import { describe, expect, it } from 'vitest'
import { caseStudies, formatCapacity, isPublishable, visibleCaseStudies, type CaseStudy } from '../../app/data/projects'

const complete: CaseStudy = {
  slug: 'demo',
  client: 'Demo Client',
  published: true,
  sector: { en: 'Education', ta: 'கல்வி' },
  location: { en: 'Coimbatore', ta: 'கோயம்புத்தூர்' },
  capacityKwp: 250,
  summary: { en: 'Summary', ta: 'சுருக்கம்' },
  photos: [],
}

describe('isPublishable', () => {
  it('requires published flag plus capacity, location and summary', () => {
    expect(isPublishable(complete)).toBe(true)
    expect(isPublishable({ ...complete, published: false })).toBe(false)
    expect(isPublishable({ ...complete, capacityKwp: undefined })).toBe(false)
    expect(isPublishable({ ...complete, location: undefined })).toBe(false)
    expect(isPublishable({ ...complete, summary: undefined })).toBe(false)
  })
})

describe('visibleCaseStudies', () => {
  it('hides drafts in production builds and shows them in dev', () => {
    const drafts = caseStudies.filter((p) => !isPublishable(p)).length
    expect(visibleCaseStudies(true).length).toBe(caseStudies.length)
    expect(visibleCaseStudies(false).length).toBe(caseStudies.length - drafts)
  })

  it('has unique slugs', () => {
    expect(new Set(caseStudies.map((p) => p.slug)).size).toBe(caseStudies.length)
  })
})

describe('formatCapacity', () => {
  it('formats kWp and switches to MWp at 1000 kWp', () => {
    expect(formatCapacity(250)).toBe('250 kWp')
    expect(formatCapacity(1500)).toBe('1.5 MWp')
  })
})
