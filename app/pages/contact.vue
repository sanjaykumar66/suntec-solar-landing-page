<script setup lang="ts">
import { company, fullAddress } from '~/data/company'

const c = useSiteContent()
const contact = computed(() => c.value.contact)

usePageSeo({ title: () => contact.value.seo.title, description: () => contact.value.seo.description, image: '/img/rcc-flat-roof.jpg' })

useSchemaOrg([defineWebPage({ '@type': 'ContactPage' })])

const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent('Kovilpalayam, Sathy Main Road, Coimbatore 641107')}&z=14&output=embed`
</script>

<template>
  <div>
    <PageHero :title="contact.hero.title" :subtitle="contact.hero.subtitle" :crumb="contact.hero.crumb" image="/img/rcc-flat-roof.jpg" />

    <section class="section soft">
      <div class="container contact-wrap">
        <div class="form-card">
          <div class="req-box">
            <h2 class="h3">{{ contact.checklist.title }}</h2>
            <ul>
              <li v-for="item in contact.checklist.items" :key="item">{{ item }}</li>
            </ul>
          </div>
          <EnquiryForm />
        </div>

        <aside :aria-label="contact.info.title">
          <div class="info-card">
            <h2 class="h3">{{ contact.info.title }}</h2>
            <div class="info-item">
              <div class="ic" aria-hidden="true">📍</div>
              <div><small>{{ contact.info.office }}</small>{{ fullAddress }}</div>
            </div>
            <div class="info-item">
              <div class="ic" aria-hidden="true">📞</div>
              <div>
                <small>{{ contact.info.sales }}</small>
                <template v-for="p in company.phones" :key="p.tel">
                  <a :href="`tel:${p.tel}`">{{ p.label }} – {{ p.display }}</a><br>
                </template>
              </div>
            </div>
            <div class="info-item">
              <div class="ic" aria-hidden="true">🛠️</div>
              <div>
                <small>{{ contact.info.service }}</small>
                <template v-for="(p, i) in company.servicePhones" :key="p.tel">
                  <span v-if="i"> / </span><a :href="`tel:${p.tel}`">{{ p.display }}</a>
                </template>
              </div>
            </div>
            <div class="info-item" style="margin-bottom: 0">
              <div class="ic" aria-hidden="true">✉️</div>
              <div>
                <small>{{ contact.info.email }}</small>
                <a :href="`mailto:${company.email}`">{{ company.email }}</a><br>
                <a :href="`mailto:${company.altEmail}`">{{ company.altEmail }}</a>
              </div>
            </div>
          </div>
          <iframe class="map" :title="contact.mapTitle" loading="lazy" referrerpolicy="no-referrer-when-downgrade" :src="mapSrc" />
        </aside>
      </div>
    </section>
  </div>
</template>
