<script setup lang="ts">
import { company, fullAddress } from '~/data/company'

const c = useSiteContent()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/img/logo.jpg" :alt="c.common.logoAlt" width="66" height="60" loading="lazy">
          <p>{{ c.footer.blurb }}</p>
        </div>
        <div>
          <h2 class="footer-title">{{ c.footer.quickLinks }}</h2>
          <ul>
            <li><NuxtLinkLocale to="/about">{{ c.footer.links.about }}</NuxtLinkLocale></li>
            <li><NuxtLinkLocale to="/products">{{ c.footer.links.products }}</NuxtLinkLocale></li>
            <li><NuxtLinkLocale to="/projects">{{ c.footer.links.projects }}</NuxtLinkLocale></li>
            <li><NuxtLinkLocale to="/contact">{{ c.footer.links.contact }}</NuxtLinkLocale></li>
          </ul>
        </div>
        <div>
          <h2 class="footer-title">{{ c.footer.solutions }}</h2>
          <ul>
            <li><NuxtLinkLocale :to="{ path: '/products', hash: '#on-grid' }">{{ c.footer.solutionLinks.onGrid }}</NuxtLinkLocale></li>
            <li><NuxtLinkLocale :to="{ path: '/products', hash: '#hybrid' }">{{ c.footer.solutionLinks.hybrid }}</NuxtLinkLocale></li>
            <li><NuxtLinkLocale :to="{ path: '/products', hash: '#off-grid' }">{{ c.footer.solutionLinks.offGrid }}</NuxtLinkLocale></li>
            <li><NuxtLinkLocale :to="{ path: '/products', hash: '#pumping' }">{{ c.footer.solutionLinks.pumping }}</NuxtLinkLocale></li>
            <li><NuxtLinkLocale :to="{ path: '/products', hash: '#power' }">{{ c.footer.solutionLinks.power }}</NuxtLinkLocale></li>
          </ul>
        </div>
        <address>
          <h2 class="footer-title">{{ c.footer.reachUs }}</h2>
          <ul>
            <li>{{ fullAddress }}</li>
            <li v-for="p in company.phones" :key="p.tel">
              <a :href="`tel:${p.tel}`">{{ p.label }} – {{ p.display }}</a>
            </li>
            <li><a :href="`mailto:${company.email}`">{{ company.email }}</a></li>
          </ul>
        </address>
      </div>
      <div class="footer-bottom">
        <span>© {{ year }} {{ company.name }}. {{ c.footer.rights }}</span>
        <span>GST: {{ company.gst }} · {{ c.footer.registrations }}</span>
      </div>
    </div>
  </footer>
</template>
