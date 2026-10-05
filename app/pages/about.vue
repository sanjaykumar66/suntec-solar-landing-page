<script setup lang="ts">
const c = useSiteContent()
const about = computed(() => c.value.about)

usePageSeo({ title: () => about.value.seo.title, description: () => about.value.seo.description, image: '/img/team.jpg' })

// Facts that don't change between languages.
const establishments = computed(() => {
  const e = about.value.establishments
  return [
    {
      name: 'Suntec Renewable Systems',
      copy: e.renewable,
      owner: [e.labels.partners, 'N. Balraj & M. Velusamy'],
      gst: '33AEDFS3056D1ZE',
      address: '26, K.K. Building, Sathy Main Road, Kovilpalayam, Coimbatore – 641107',
      email: 'sun.vbss@gmail.com',
      enquiry: [['98435 02872', '+919843502872'], ['82480 33140', '+918248033140']],
      service: [['98426 98554', '+919842698554'], ['80725 05379', '+918072505379']],
    },
    {
      name: 'Suntec Power Systems',
      copy: e.power,
      owner: [e.labels.proprietor, 'N. Balraj'],
      gst: '33AANPB5681R1Z4',
      address: '24, K.K. Building, Sathy Main Road, Kovilpalayam, Coimbatore – 641107',
      email: 'suntec.cbe@gmail.com',
      enquiry: [['98435 02872', '+919843502872'], ['93620 20872', '+919362020872']],
      service: [['93847 71532', '+919384771532']],
    },
  ]
})
</script>

<template>
  <div>
    <PageHero :title="about.hero.title" :subtitle="about.hero.subtitle" :crumb="about.hero.crumb" image="/img/team.jpg" />

    <section class="section">
      <div class="container split">
        <div class="reveal">
          <span class="eyebrow">{{ about.overview.eyebrow }}</span>
          <h2>{{ about.overview.title }}</h2>
          <p v-for="p in about.overview.paragraphs" :key="p">{{ p }}</p>
        </div>
        <div class="reveal">
          <NuxtImg class="rounded" src="/img/gi-roof-mounting.jpg" :alt="about.overview.imageAlt" width="1280" height="590" format="webp" sizes="sm:100vw md:50vw" loading="lazy" />
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="container grid grid-2">
        <div class="card reveal">
          <div class="icon" aria-hidden="true">🌞</div>
          <h2 class="h3">{{ about.vision.title }}</h2>
          <p>{{ about.vision.text }}</p>
        </div>
        <div class="card reveal">
          <div class="icon" aria-hidden="true">🌍</div>
          <h2 class="h3">{{ about.mission.title }}</h2>
          <p>{{ about.mission.text }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ about.values.eyebrow }}</span>
          <h2>{{ about.values.title }}</h2>
        </div>
        <div class="grid grid-4">
          <div v-for="v in about.values.items" :key="v.title" class="card reveal">
            <div class="icon" aria-hidden="true">{{ v.icon }}</div>
            <h3>{{ v.title }}</h3>
            <p>{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section leaf">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ about.certs.eyebrow }}</span>
          <h2>{{ about.certs.title }}</h2>
        </div>
        <div class="grid grid-3">
          <div v-for="cert in about.certs.items" :key="cert.title" class="card reveal">
            <div class="icon" aria-hidden="true">{{ cert.icon }}</div>
            <h3>{{ cert.title }}</h3>
            <p>{{ cert.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">{{ about.establishments.eyebrow }}</span>
          <h2>{{ about.establishments.title }}</h2>
        </div>
        <div class="grid grid-2">
          <div v-for="e in establishments" :key="e.name" class="establishment reveal">
            <header>
              <h3>{{ e.name }}</h3>
              <small>{{ e.copy.meta }}</small>
            </header>
            <div class="body">
              <dl>
                <dt>{{ e.owner[0] }}</dt><dd>{{ e.owner[1] }}</dd>
                <dt>{{ about.establishments.labels.gst }}</dt><dd>{{ e.gst }}</dd>
                <dt>{{ about.establishments.labels.address }}</dt><dd>{{ e.address }}</dd>
                <dt>{{ about.establishments.labels.email }}</dt><dd><a :href="`mailto:${e.email}`">{{ e.email }}</a></dd>
                <dt>{{ about.establishments.labels.enquiry }}</dt>
                <dd>
                  <template v-for="([d, t], i) in e.enquiry" :key="t"><span v-if="i"> / </span><a :href="`tel:${t}`">{{ d }}</a></template>
                </dd>
                <dt>{{ about.establishments.labels.service }}</dt>
                <dd>
                  <template v-for="([d, t], i) in e.service" :key="t"><span v-if="i"> / </span><a :href="`tel:${t}`">{{ d }}</a></template>
                </dd>
                <dt>{{ about.establishments.labels.activity }}</dt><dd>{{ e.copy.activity }}</dd>
                <dt>{{ about.establishments.labels.teams }}</dt><dd>{{ e.copy.teams }}</dd>
              </dl>
              <ul class="checklist">
                <li v-for="p in e.copy.products" :key="p">{{ p }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CtaBanner :cta="about.cta" />
  </div>
</template>
