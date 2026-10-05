<script setup lang="ts">
import type { EnquiryProduct } from '~/data/company'
import type { SystemType } from '~/data/projects'

const c = useSiteContent()
const products = computed(() => c.value.products)

usePageSeo({ title: () => products.value.seo.title, description: () => products.value.seo.description, image: '/img/ground-mounted.jpg' })

interface SystemMeta {
  key: SystemType
  id: string
  enquiry: EnquiryProduct
  image: { src: string; width: number; height: number; diagram?: boolean }
}

const systemMeta: SystemMeta[] = [
  { key: 'onGrid', id: 'on-grid', enquiry: 'On-Grid Solar', image: { src: '/img/on-grid-diagram.jpg', width: 1080, height: 695, diagram: true } },
  { key: 'hybrid', id: 'hybrid', enquiry: 'Hybrid Solar', image: { src: '/img/hybrid-diagram.jpg', width: 1080, height: 672, diagram: true } },
  { key: 'offGrid', id: 'off-grid', enquiry: 'Off-Grid Solar', image: { src: '/img/rcc-flat-roof.jpg', width: 1600, height: 520 } },
  { key: 'pumping', id: 'pumping', enquiry: 'Solar Water Pumping', image: { src: '/img/ground-mounted.jpg', width: 1280, height: 880 } },
]

const systems = computed(() => systemMeta.map((m) => ({ ...m, copy: products.value.systems[m.key] })))

const mountingImages = [
  { src: '/img/gi-roof-mounting.jpg', width: 1280, height: 590 },
  { src: '/img/rcc-flat-roof.jpg', width: 1600, height: 520 },
  { src: '/img/ground-mounted.jpg', width: 1280, height: 880 },
]

useSchemaOrg(
  systems.value.map((s) =>
    defineService({
      '@id': `#service-${s.id}`,
      name: s.copy.title,
      description: s.copy.intro,
      serviceType: 'Solar power system installation',
      areaServed: 'Tamil Nadu',
    }),
  ),
)
</script>

<template>
  <div>
    <PageHero :title="products.hero.title" :subtitle="products.hero.subtitle" :crumb="products.hero.crumb" image="/img/ground-mounted.jpg" />

    <div class="container">
      <section v-for="(s, i) in systems" :id="s.id" :key="s.id" class="product">
        <div class="split" :class="{ reverse: i % 2 === 1 }">
          <div class="reveal">
            <span class="tag">{{ s.copy.tag }}</span>
            <h2>{{ s.copy.title }}</h2>
            <p>{{ s.copy.intro }}</p>
            <ul class="checklist">
              <li v-for="p in s.copy.points" :key="p">{{ p }}</li>
            </ul>
            <template v-if="s.copy.components">
              <h3>{{ products.componentsTitle }}</h3>
              <ol class="components">
                <li v-for="comp in s.copy.components" :key="comp">{{ comp }}</li>
              </ol>
            </template>
            <NuxtLinkLocale :to="{ path: '/contact', query: { product: s.enquiry } }" class="btn btn-primary">
              {{ s.copy.enquireLabel }}
            </NuxtLinkLocale>
          </div>
          <div class="reveal" :class="{ diagram: s.image.diagram }">
            <NuxtImg
              :class="{ rounded: !s.image.diagram }"
              :src="s.image.src"
              :alt="s.copy.imageAlt"
              :width="s.image.width"
              :height="s.image.height"
              format="webp"
              sizes="sm:100vw md:50vw"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>

    <section class="section soft">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ products.mounting.eyebrow }}</span>
          <h2>{{ products.mounting.title }}</h2>
          <p>{{ products.mounting.text }}</p>
        </div>
        <div class="grid grid-3">
          <article v-for="(m, i) in products.mounting.items" :key="m.title" class="card media reveal">
            <NuxtImg :src="mountingImages[i]!.src" :alt="m.title" :width="mountingImages[i]!.width" :height="mountingImages[i]!.height" format="webp" sizes="sm:100vw md:33vw" loading="lazy" />
            <div class="body">
              <h3>{{ m.title }}</h3>
              <p>{{ m.text }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="power" class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ products.power.eyebrow }}</span>
          <h2>{{ products.power.title }}</h2>
          <p>{{ products.power.text }}</p>
        </div>
        <div class="grid grid-3">
          <div v-for="p in products.power.items" :key="p.title" class="card reveal">
            <div class="icon" aria-hidden="true">{{ p.icon }}</div>
            <h3>{{ p.title }}</h3>
            <p>{{ p.text }}</p>
          </div>
        </div>
        <p style="text-align: center; margin-top: 30px">
          <NuxtLinkLocale :to="{ path: '/contact', query: { product: 'UPS / Batteries / Stabilizer' } }" class="btn btn-primary">
            {{ products.power.cta }}
          </NuxtLinkLocale>
        </p>
      </div>
    </section>

    <section class="section leaf">
      <div class="container split">
        <div class="reveal">
          <span class="eyebrow">{{ products.process.eyebrow }}</span>
          <h2>{{ products.process.title }}</h2>
          <ul class="checklist">
            <li v-for="step in products.process.steps" :key="step.strong"><strong>{{ step.strong }}</strong>{{ step.text }}</li>
          </ul>
          <NuxtLinkLocale to="/contact" class="btn btn-primary">{{ products.process.cta }}</NuxtLinkLocale>
        </div>
        <div class="reveal">
          <NuxtImg class="rounded" src="/img/triangular-approach.jpg" :alt="products.process.imageAlt" width="1079" height="1524" format="webp" sizes="sm:100vw md:50vw" loading="lazy" />
        </div>
      </div>
    </section>
  </div>
</template>
