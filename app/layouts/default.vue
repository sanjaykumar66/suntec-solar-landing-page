<script setup lang="ts">
// <html lang>, canonical, hreflang alternates (en-IN / ta-IN / x-default) and og:locale.
const i18nHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: { lang: i18nHead.value.htmlAttrs?.lang },
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
}))
</script>

<template>
  <div>
    <SiteHeader />
    <main>
      <slot />
    </main>
    <SiteFooter />
    <WhatsAppButton />
  </div>
</template>
