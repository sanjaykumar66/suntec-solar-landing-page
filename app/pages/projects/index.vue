<script setup lang="ts">
import { clients, partners } from '~/data/company'
import { formatCapacity, isPublishable, visibleCaseStudies } from '~/data/projects'

const c = useSiteContent()
const locale = useSiteLocale()
const projects = computed(() => c.value.projects)

usePageSeo({ title: () => projects.value.seo.title, description: () => projects.value.seo.description, image: '/img/gi-roof-mounting.jpg' })

// Drafts appear only in `npm run dev`, so incomplete case studies never reach production.
const caseStudies = visibleCaseStudies(import.meta.dev)

const galleryImages = [
  { src: '/img/gi-roof-mounting.jpg', w: 1280, h: 590, wide: true },
  { src: '/img/solaredge-inverter.jpg', w: 1200, h: 900 },
  { src: '/img/rcc-flat-roof.jpg', w: 1600, h: 520 },
  { src: '/img/ground-mounted.jpg', w: 1280, h: 880 },
  { src: '/img/team.jpg', w: 1280, h: 590 },
]
</script>

<template>
  <div>
    <PageHero :title="projects.hero.title" :subtitle="projects.hero.subtitle" :crumb="projects.hero.crumb" image="/img/gi-roof-mounting.jpg" />

    <section v-if="caseStudies.length" class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ projects.featured.eyebrow }}</span>
          <h2>{{ projects.featured.title }}</h2>
        </div>
        <div class="grid grid-3">
          <article v-for="p in caseStudies" :key="p.slug" class="card media case-card reveal">
            <NuxtImg
              v-if="p.photos[0]"
              :src="p.photos[0].src"
              :alt="p.photos[0].alt[locale]"
              :width="p.photos[0].width"
              :height="p.photos[0].height"
              format="webp"
              sizes="sm:100vw md:33vw"
              loading="lazy"
            />
            <div v-else class="placeholder" aria-hidden="true">☀️</div>
            <div class="body">
              <div class="meta">
                <span v-if="!isPublishable(p)">DRAFT · </span>
                {{ p.sector[locale] }}<template v-if="p.capacityKwp"> · {{ formatCapacity(p.capacityKwp) }}</template>
              </div>
              <h3>{{ p.client }}</h3>
              <p v-if="p.location">{{ p.location[locale] }}</p>
              <NuxtLinkLocale class="more" :to="`/projects/${p.slug}`">{{ projects.featured.view }}</NuxtLinkLocale>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section" :class="{ soft: caseStudies.length }">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ projects.gallery.eyebrow }}</span>
          <h2>{{ projects.gallery.title }}</h2>
        </div>
        <div class="gallery">
          <figure v-for="(g, i) in galleryImages" :key="g.src + i" class="reveal" :class="{ wide: g.wide }">
            <NuxtImg :src="g.src" :alt="projects.gallery.captions[i]" :width="g.w" :height="g.h" format="webp" sizes="sm:100vw md:50vw" loading="lazy" />
            <figcaption>{{ projects.gallery.captions[i] }}</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="section" :class="{ soft: !caseStudies.length }">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ projects.clients.eyebrow }}</span>
          <h2>{{ projects.clients.title }}</h2>
        </div>
        <ul class="chips reveal" role="list">
          <li v-for="cl in clients" :key="cl" class="chip">{{ cl }}</li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ projects.partners.eyebrow }}</span>
          <h2>{{ projects.partners.title }}</h2>
        </div>
        <ul class="chips reveal" role="list">
          <li v-for="p in partners" :key="p" class="chip partner">{{ p }}</li>
        </ul>
      </div>
    </section>

    <section class="section leaf">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ projects.industries.eyebrow }}</span>
          <h2>{{ projects.industries.title }}</h2>
        </div>
        <div class="grid grid-5">
          <div v-for="ind in projects.industries.items" :key="ind.name" class="card reveal">
            <div class="icon" aria-hidden="true">{{ ind.icon }}</div>
            <h3>{{ ind.name }}</h3>
          </div>
        </div>
      </div>
    </section>

    <CtaBanner :cta="projects.cta" />
  </div>
</template>
