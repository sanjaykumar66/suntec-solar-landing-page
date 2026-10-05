<script setup lang="ts">
import { company } from '~/data/company'

const c = useSiteContent()

const nav = computed(() => [
  { to: '/', label: c.value.nav.home },
  { to: '/about', label: c.value.nav.about },
  { to: '/products', label: c.value.nav.products },
  { to: '/projects', label: c.value.nav.projects },
])

const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <div class="topbar">
    <div class="container">
      <div class="topbar-tagline">
        <span class="hide-sm">☀ {{ c.topbar.tagline }}</span>
        <span class="show-sm">☀ {{ c.topbar.taglineShort }}</span>
      </div>
      <div class="topbar-contact">
        <span><a :href="`tel:${company.phones[0].tel}`">📞 {{ company.phones[0].display }}</a></span>
        <span class="hide-sm"><a :href="`mailto:${company.email}`">✉ {{ company.email }}</a></span>
        <LanguageMenu />
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="container">
      <NuxtLinkLocale class="brand" to="/" :aria-label="`${company.name} — ${c.nav.home}`">
        <img src="/img/logo.jpg" :alt="c.common.logoAlt" width="57" height="52">
        <span class="brand-text"><strong>SUNTEC</strong><small>Renewable Systems</small></span>
      </NuxtLinkLocale>
      <button
        class="nav-toggle"
        :aria-label="open ? c.common.menuClose : c.common.menuOpen"
        :aria-expanded="open"
        aria-controls="site-nav"
        @click="open = !open"
      >
        <span /><span /><span />
      </button>
      <nav id="site-nav" class="nav" :class="{ open }" aria-label="Main">
        <ul>
          <li v-for="item in nav" :key="item.to">
            <NuxtLinkLocale :to="item.to" exact-active-class="active">{{ item.label }}</NuxtLinkLocale>
          </li>
          <li><NuxtLinkLocale to="/contact" class="btn btn-primary">{{ c.nav.quote }}</NuxtLinkLocale></li>
        </ul>
      </nav>
    </div>
  </header>
</template>
