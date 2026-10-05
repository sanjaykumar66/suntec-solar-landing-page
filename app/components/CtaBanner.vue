<script setup lang="ts">
import type { Cta } from '~/content/types'

defineProps<{ cta: Cta }>()
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="cta reveal">
        <div>
          <h2>{{ cta.title }}</h2>
          <p>{{ cta.text }}</p>
        </div>
        <NuxtLinkLocale to="/contact" class="btn btn-primary">{{ cta.label }}</NuxtLinkLocale>
      </div>
    </div>
  </section>
</template>
