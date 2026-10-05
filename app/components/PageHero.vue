<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
  crumb: string
  image: string
  /** Optional middle breadcrumb, e.g. Projects on a case-study page. */
  parent?: { label: string; to: string }
}>()

const c = useSiteContent()
const localePath = useLocalePath()
const style = computed(() => ({ '--hero-img': `url('${props.image}')` }))

// BreadcrumbList structured data — shown as the URL trail in Google results.
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: c.value.common.home, item: localePath('/') },
      ...(props.parent ? [{ name: props.parent.label, item: localePath(props.parent.to) }] : []),
      { name: props.crumb },
    ],
  }),
])
</script>

<template>
  <section class="page-hero" :style="style">
    <div class="container">
      <nav class="crumbs" :aria-label="c.common.breadcrumb">
        <NuxtLinkLocale to="/">{{ c.common.home }}</NuxtLinkLocale> /
        <template v-if="parent"><NuxtLinkLocale :to="parent.to">{{ parent.label }}</NuxtLinkLocale> / </template>
        <span aria-current="page">{{ crumb }}</span>
      </nav>
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
  </section>
</template>
