<script setup lang="ts">
// Globe dropdown for switching language. Both links are always in the HTML (v-show, not v-if)
// so crawlers can follow them; the menu only toggles visibility.
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const current = computed(() => locales.value.find((l) => l.code === locale.value))
const shortLabel = computed(() => (locale.value === 'ta' ? 'த' : 'EN'))

function close() {
  open.value = false
}

function onDocumentClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    close()
    root.value?.querySelector('button')?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
watch(() => route.fullPath, close)
</script>

<template>
  <div ref="root" class="lang-menu">
    <button
      type="button"
      class="lang-trigger"
      aria-haspopup="true"
      :aria-expanded="open"
      aria-controls="lang-options"
      :aria-label="`Language: ${current?.name ?? locale}`"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="globe">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M2.5 12h19M12 2.5c2.6 2.7 4 6 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-6-4-9.5s1.4-6.8 4-9.5z" />
      </svg>
      <span class="lang-current">{{ shortLabel }}</span>
      <span class="hide-sm lang-name">{{ current?.name }}</span>
      <svg viewBox="0 0 12 12" aria-hidden="true" class="caret" :class="{ up: open }"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
    </button>
    <ul v-show="open" id="lang-options" class="lang-options">
      <li v-for="l in locales" :key="l.code">
        <NuxtLink
          :to="switchLocalePath(l.code)"
          :hreflang="l.language"
          :lang="l.code"
          :aria-current="l.code === locale ? 'true' : undefined"
          :class="{ current: l.code === locale }"
        >
          <span>{{ l.name }}</span>
          <span v-if="l.code === locale" class="tick" aria-hidden="true">✓</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
