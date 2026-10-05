import en from '~/content/en'
import ta from '~/content/ta'
import type { SiteContent } from '~/content/types'

const content: Record<string, SiteContent> = { en, ta }

export type SiteLocale = 'en' | 'ta'

/** Copy for the active locale (falls back to English). */
export function useSiteContent() {
  const { locale } = useI18n()
  return computed(() => content[locale.value] ?? en)
}

export function useSiteLocale() {
  const { locale } = useI18n()
  return computed(() => (locale.value === 'ta' ? 'ta' : 'en') as SiteLocale)
}

/** Replace `{key}` placeholders in a template string. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`)
}
