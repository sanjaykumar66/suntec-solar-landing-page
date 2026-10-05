<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const c = useSiteContent()
const localePath = useLocalePath()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => `${notFound.value ? c.value.error.notFound : c.value.error.generic} | Suntec Solar`,
  robots: 'noindex',
})
</script>

<template>
  <NuxtLayout>
    <section class="section">
      <div class="container" style="text-align: center; max-width: 640px">
        <span class="eyebrow">{{ error.statusCode }}</span>
        <h1>{{ notFound ? c.error.notFound : c.error.generic }}</h1>
        <p>{{ notFound ? c.error.notFoundText : c.error.genericText }}</p>
        <button class="btn btn-primary" @click="clearError({ redirect: localePath('/') })">{{ c.error.back }}</button>
      </div>
    </section>
  </NuxtLayout>
</template>
