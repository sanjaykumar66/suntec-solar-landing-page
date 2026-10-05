<script setup lang="ts">
import { company, customerTypes, enquiryProducts, roofTypes } from '~/data/company'
import { emptyEnquiry, isSpam, validateEnquiry } from '~/utils/enquiry'

const route = useRoute()
const c = useSiteContent()
const locale = useSiteLocale()
const f = computed(() => c.value.form)
const { enquiryEndpoint } = useRuntimeConfig().public

const presetProduct = () => {
  const p = route.query.product
  return typeof p === 'string' && (enquiryProducts as readonly string[]).includes(p) ? p : ''
}

// Prefill from ?product= after mount so the prerendered HTML and hydration match.
const form = reactive(emptyEnquiry())
onMounted(() => (form.product = presetProduct()))
watch(() => route.query.product, () => (form.product = presetProduct()))

const sending = ref(false)
const status = ref<{ kind: 'ok' | 'err' | 'info'; message: string } | null>(null)

// Google Apps Script can take 10–20 s to wake up after being idle ("cold start").
/** After this long, reassure the visitor that the enquiry is still being sent. */
const SLOW_NOTICE_MS = 4_000
/** Give up after this long and show the call-us fallback instead of spinning forever. */
const TIMEOUT_MS = 45_000

const fallback = computed(() => fill(f.value.fallback, { phone: company.phones[0].display, email: company.email }))

async function submit() {
  if (isSpam(form)) return

  const problem = validateEnquiry(form)
  if (problem) {
    status.value = { kind: 'err', message: f.value.errors[problem] }
    return
  }

  if (!enquiryEndpoint) {
    console.error('Enquiry endpoint missing: set NUXT_PUBLIC_ENQUIRY_ENDPOINT and rebuild.')
    status.value = { kind: 'err', message: `${f.value.notConfigured} ${fallback.value}` }
    return
  }

  sending.value = true
  status.value = null
  const controller = new AbortController()
  const slowTimer = setTimeout(() => (status.value = { kind: 'info', message: f.value.slow }), SLOW_NOTICE_MS)
  const abortTimer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    // URL-encoded body keeps this a "simple" CORS request (no preflight), which Apps Script accepts.
    // Option values are always English so the Sheet stays consistent; `language` records the page locale.
    const body = new URLSearchParams({ ...form, language: locale.value, page: window.location.href })
    const res = await fetch(enquiryEndpoint, { method: 'POST', body, signal: controller.signal })
    const data: unknown = await res.json()
    const result = (data as { result?: string; error?: string }) ?? {}
    if (!res.ok || result.result !== 'success') throw new Error(result.error || `HTTP ${res.status}`)

    Object.assign(form, emptyEnquiry())
    status.value = { kind: 'ok', message: f.value.success }
  } catch (err) {
    console.error('Enquiry submission failed:', err)
    status.value = { kind: 'err', message: `${f.value.failed} ${fallback.value}` }
  } finally {
    clearTimeout(slowTimer)
    clearTimeout(abortTimer)
    sending.value = false
  }
}
</script>

<template>
  <form novalidate @submit.prevent="submit">
    <div class="form-grid">
      <div>
        <label for="name">{{ f.name }} <span class="req">*</span></label>
        <input id="name" v-model="form.name" name="name" autocomplete="name" required maxlength="100">
      </div>
      <div>
        <label for="phone">{{ f.phone }} <span class="req">*</span></label>
        <input id="phone" v-model="form.phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="15" :placeholder="f.phonePlaceholder">
      </div>
      <div>
        <label for="email">{{ f.email }}</label>
        <input id="email" v-model="form.email" name="email" type="email" autocomplete="email" maxlength="120">
      </div>
      <div>
        <label for="city">{{ f.city }}</label>
        <input id="city" v-model="form.city" name="city" autocomplete="address-level2" maxlength="100">
      </div>
      <div>
        <label for="customerType">{{ f.customerType }}</label>
        <select id="customerType" v-model="form.customerType" name="customerType">
          <option value="">{{ f.select }}</option>
          <option v-for="t in customerTypes" :key="t" :value="t">{{ f.options.customerTypes[t] }}</option>
        </select>
      </div>
      <div>
        <label for="product">{{ f.product }}</label>
        <select id="product" v-model="form.product" name="product">
          <option value="">{{ f.select }}</option>
          <option v-for="p in enquiryProducts" :key="p" :value="p">{{ f.options.products[p] }}</option>
        </select>
      </div>
      <div>
        <label for="roofType">{{ f.roofType }}</label>
        <select id="roofType" v-model="form.roofType" name="roofType">
          <option value="">{{ f.select }}</option>
          <option v-for="r in roofTypes" :key="r" :value="r">{{ f.options.roofTypes[r] }}</option>
        </select>
      </div>
      <div>
        <label for="monthlyBill">{{ f.monthlyBill }}</label>
        <input id="monthlyBill" v-model="form.monthlyBill" name="monthlyBill" inputmode="numeric" maxlength="12" :placeholder="f.monthlyBillPlaceholder">
      </div>
      <div class="full">
        <label for="ebNumber">{{ f.ebNumber }}</label>
        <input id="ebNumber" v-model="form.ebNumber" name="ebNumber" maxlength="30" aria-describedby="eb-hint">
        <div id="eb-hint" class="hint">{{ f.ebHint }}</div>
      </div>
      <div class="full">
        <label for="message">{{ f.message }}</label>
        <textarea id="message" v-model="form.message" name="message" maxlength="2000" :placeholder="f.messagePlaceholder" />
      </div>
      <div class="hp" aria-hidden="true">
        <label for="website">Leave this empty</label>
        <input id="website" v-model="form.website" name="website" tabindex="-1" autocomplete="off">
      </div>
      <div class="full">
        <button type="submit" class="btn btn-primary" :disabled="sending">{{ sending ? f.sending : f.submit }}</button>
      </div>
    </div>
    <div class="form-status" :class="status ? ['show', status.kind] : []" role="status" aria-live="polite">
      {{ status?.message }}
    </div>
  </form>
</template>
