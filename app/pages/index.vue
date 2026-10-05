<script setup lang="ts">
import { clients, company, heroImage } from '~/data/company'

const c = useSiteContent()
const home = computed(() => c.value.home)

usePageSeo({ title: () => home.value.seo.title, description: () => home.value.seo.description, image: heroImage.src })

useSchemaOrg([
  defineWebPage({ '@type': 'FAQPage' }),
  ...home.value.faq.items.map((f) => defineQuestion({ name: f.q, acceptedAnswer: f.a })),
])

const statValues = [String(company.foundedSolar), company.installedCapacity]
const solutionLinks = ['on-grid', 'hybrid', 'pumping']
const solutionImages = [
  { src: '/img/gi-roof-mounting.jpg', width: 1280, height: 590 },
  { src: '/img/rcc-flat-roof.jpg', width: 1600, height: 520 },
  { src: '/img/ground-mounted.jpg', width: 1280, height: 880 },
]
</script>

<template>
  <div>
    <section class="hero">
      <!-- Real <img> (not a CSS background) so the browser can discover, preload and size it: better LCP. -->
      <NuxtImg
        class="hero-bg"
        :src="heroImage.src"
        :width="heroImage.width"
        :height="heroImage.height"
        :alt="home.heroImageAlt"
        format="webp"
        sizes="sm:100vw md:100vw lg:100vw xl:100vw"
        :densities="heroImage.width >= 2400 ? 'x1 x2' : 'x1'"
        preload
        fetchpriority="high"
      />
      <div class="container">
        <div class="badges">
          <span v-for="b in home.badges" :key="b" class="badge">{{ b }}</span>
        </div>
        <h1>{{ home.heroTitle }} <em>{{ home.heroTitleHighlight }}</em></h1>
        <p class="lead">{{ home.heroLead }}</p>
        <div class="actions">
          <NuxtLinkLocale to="/contact" class="btn btn-primary">{{ home.heroCta }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/products" class="btn btn-outline">{{ home.heroCtaSecondary }}</NuxtLinkLocale>
        </div>
      </div>
    </section>

    <section class="stats" aria-label="Key facts">
      <div class="container">
        <div class="stats-grid">
          <div v-for="(s, i) in home.stats" :key="s.label" class="stat">
            <strong>{{ s.value ?? statValues[i] }}</strong><span>{{ s.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div class="reveal">
          <span class="eyebrow">{{ home.who.eyebrow }}</span>
          <h2>{{ home.who.title }}</h2>
          <p>{{ home.who.text }}</p>
          <ul class="checklist">
            <li v-for="p in home.who.points" :key="p">{{ p }}</li>
          </ul>
          <NuxtLinkLocale to="/about" class="btn btn-outline dark">{{ home.who.cta }}</NuxtLinkLocale>
        </div>
        <div class="reveal">
          <NuxtImg class="rounded" src="/img/team.jpg" :alt="home.who.imageAlt" width="1280" height="590" format="webp" sizes="sm:100vw md:50vw" loading="lazy" />
        </div>
      </div>
    </section>

    <section class="section leaf">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ home.why.eyebrow }}</span>
          <h2>{{ home.why.title }}</h2>
        </div>
        <div class="grid grid-5">
          <div v-for="(item, i) in home.why.items" :key="item" class="why reveal">
            <div class="num">{{ String(i + 1).padStart(2, '0') }}</div>
            <h3>{{ item }}</h3>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ home.solutions.eyebrow }}</span>
          <h2>{{ home.solutions.title }}</h2>
          <p>{{ home.solutions.text }}</p>
        </div>
        <div class="grid grid-3">
          <article v-for="(card, i) in home.solutions.cards" :key="card.title" class="card media reveal">
            <NuxtImg :src="solutionImages[i]!.src" :alt="card.imageAlt" :width="solutionImages[i]!.width" :height="solutionImages[i]!.height" format="webp" sizes="sm:100vw md:33vw" loading="lazy" />
            <div class="body">
              <h3>{{ card.title }}</h3>
              <p>{{ card.text }}</p>
              <NuxtLinkLocale class="more" :to="{ path: '/products', hash: `#${solutionLinks[i]}` }">{{ card.link }}</NuxtLinkLocale>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="container split reverse">
        <div class="reveal">
          <span class="eyebrow">{{ home.triangle.eyebrow }}</span>
          <h2>{{ home.triangle.title }}</h2>
          <p>{{ home.triangle.text }}</p>
          <div class="triangle">
            <div v-for="p in home.triangle.params" :key="p">{{ p }}</div>
          </div>
          <p style="margin-top: 22px">{{ home.triangle.note }}</p>
          <NuxtLinkLocale to="/contact" class="btn btn-primary">{{ home.triangle.cta }}</NuxtLinkLocale>
        </div>
        <div class="reveal">
          <NuxtImg class="rounded" src="/img/solaredge-inverter.jpg" :alt="home.triangle.imageAlt" width="1200" height="900" format="webp" sizes="sm:100vw md:50vw" loading="lazy" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ home.clients.eyebrow }}</span>
          <h2>{{ home.clients.title }}</h2>
        </div>
        <ul class="chips reveal" role="list">
          <li v-for="cl in clients.slice(0, 12)" :key="cl" class="chip">{{ cl }}</li>
        </ul>
        <p style="text-align: center; margin-top: 24px"><NuxtLinkLocale to="/projects">{{ home.clients.all }}</NuxtLinkLocale></p>
      </div>
    </section>

    <section class="section soft">
      <div class="container" style="max-width: 860px">
        <div class="section-head reveal">
          <span class="eyebrow">{{ home.faq.eyebrow }}</span>
          <h2>{{ home.faq.title }}</h2>
        </div>
        <div class="faq">
          <details v-for="f in home.faq.items" :key="f.q" class="reveal">
            <summary>{{ f.q }}</summary>
            <p>{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <CtaBanner :cta="home.cta" />
  </div>
</template>
