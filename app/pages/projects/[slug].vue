<script setup lang="ts">
import { caseStudies, formatCapacity, isPublishable } from '~/data/projects'

const route = useRoute()
const c = useSiteContent()
const locale = useSiteLocale()

const project = caseStudies.find((p) => p.slug === route.params.slug)
// Production only serves complete, published case studies; dev also previews drafts.
if (!project || (!isPublishable(project) && !import.meta.dev)) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const cs = computed(() => c.value.caseStudy)
const capacity = project.capacityKwp != null ? formatCapacity(project.capacityKwp) : ''
const location = computed(() => project.location?.[locale.value] ?? '')

const facts = computed(() =>
  [
    [cs.value.facts.capacity, capacity],
    [cs.value.facts.system, project.systemType ? c.value.products.systems[project.systemType].title : ''],
    [cs.value.facts.mounting, project.mounting ? c.value.products.mounting.items[['giRoof', 'rccRoof', 'ground'].indexOf(project.mounting)]?.title ?? '' : ''],
    [cs.value.facts.location, location.value],
    [cs.value.facts.year, project.year ? String(project.year) : ''],
    [cs.value.facts.sector, project.sector[locale.value]],
  ].filter(([, v]) => v),
)

const vars = computed(() => ({ client: project.client, location: location.value, capacity }))
const heroPhoto = project.photos[0]?.src ?? '/img/gi-roof-mounting.jpg'

usePageSeo({
  title: () => fill(cs.value.seoTitle, vars.value),
  description: () => fill(cs.value.seoDescription, vars.value),
  image: heroPhoto,
  noindex: !isPublishable(project),
})
</script>

<template>
  <div>
    <PageHero
      :title="project.client"
      :subtitle="[capacity, location].filter(Boolean).join(' · ')"
      :crumb="project.client"
      :parent="{ label: cs.crumb, to: '/projects' }"
      :image="heroPhoto"
    />

    <section class="section">
      <div class="container" style="max-width: 980px">
        <p v-if="!isPublishable(project)" class="draft-banner">{{ cs.draft }}</p>

        <dl class="facts">
          <div v-for="[label, value] in facts" :key="label" class="fact">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </div>
        </dl>

        <template v-if="project.summary">
          <h2>{{ cs.overview }}</h2>
          <p>{{ project.summary[locale] }}</p>
        </template>

        <template v-if="project.highlights?.[locale].length">
          <h2>{{ cs.highlights }}</h2>
          <ul class="checklist">
            <li v-for="h in project.highlights[locale]" :key="h">{{ h }}</li>
          </ul>
        </template>

        <template v-if="project.photos.length">
          <h2>{{ cs.gallery }}</h2>
          <div class="gallery">
            <figure v-for="ph in project.photos" :key="ph.src">
              <NuxtImg :src="ph.src" :alt="ph.alt[locale]" :width="ph.width" :height="ph.height" format="webp" sizes="sm:100vw md:50vw" loading="lazy" />
              <figcaption>{{ ph.alt[locale] }}</figcaption>
            </figure>
          </div>
        </template>

        <p style="margin-top: 32px"><NuxtLinkLocale to="/projects">{{ cs.back }}</NuxtLinkLocale></p>
      </div>
    </section>

    <CtaBanner :cta="cs.cta" />
  </div>
</template>
