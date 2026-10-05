import type { MaybeRefOrGetter } from 'vue'

interface PageSeo {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Path under /public, e.g. "/img/team.jpg" */
  image?: string
  noindex?: boolean
}

/**
 * Title, description, Open Graph and Twitter tags for a page.
 * Canonical, hreflang alternates, og:locale and <html lang> come from @nuxtjs/i18n (see layouts/default.vue).
 */
export function usePageSeo({ title, description, image = '/img/gi-roof-mounting.jpg', noindex = false }: PageSeo) {
  const { siteUrl } = useRuntimeConfig().public
  const imageUrl = `${String(siteUrl).replace(/\/$/, '')}${image}`

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogImage: imageUrl,
    ogSiteName: 'Suntec Renewable Systems',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: imageUrl,
    robots: noindex ? 'noindex, nofollow' : undefined,
  })
}
