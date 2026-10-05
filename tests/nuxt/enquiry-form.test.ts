// Mounts the real EnquiryForm inside Nuxt (i18n, router, runtime config) and checks what a visitor
// sees and what gets sent to the Google Apps Script endpoint. `fetch` is stubbed — nothing leaves the test.
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EnquiryForm from '~/components/EnquiryForm.vue'

const ENDPOINT = 'https://script.example.test/exec'

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>

function respond(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))
}

async function mountForm(route = '/contact') {
  return mountSuspended(EnquiryForm, { route })
}

async function fill(w: Wrapper, values: Record<string, string>) {
  for (const [id, value] of Object.entries(values)) await w.find(`#${id}`).setValue(value)
}

async function submit(w: Wrapper) {
  await w.find('form').trigger('submit')
  await flushPromises()
}

const status = (w: Wrapper) => w.find('[role="status"]')
const sentBody = (fetchMock: ReturnType<typeof vi.fn>) => fetchMock.mock.calls[0]![1].body as URLSearchParams
const valid = { name: 'Ravi Kumar', phone: '98435 02872' }

let fetchMock: ReturnType<typeof vi.fn>
let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  fetchMock = vi.fn(() => respond({ result: 'success' }))
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  consoleError.mockRestore()
  useRuntimeConfig().public.enquiryEndpoint = ENDPOINT
})

describe('EnquiryForm — rendering', () => {
  it('shows English labels and submits English option values', async () => {
    const w = await mountForm()
    expect(w.find('label[for="name"]').text()).toContain('Full name')
    const option = w.find('#product option[value="Hybrid Solar"]')
    expect(option.text()).toBe('Hybrid Solar')
    expect(w.find('button[type="submit"]').text()).toBe('Submit Enquiry')
  })

  it('pre-selects the product from ?product=', async () => {
    const w = await mountForm('/contact?product=Solar+Water+Pumping')
    await flushPromises()
    expect((w.find('#product').element as HTMLSelectElement).value).toBe('Solar Water Pumping')
  })

  it('ignores an unknown ?product= value', async () => {
    const w = await mountForm('/contact?product=Nuclear+Reactor')
    await flushPromises()
    expect((w.find('#product').element as HTMLSelectElement).value).toBe('')
  })

  it('keeps the spam trap field hidden from people', async () => {
    const w = await mountForm()
    expect(w.find('.hp').attributes('aria-hidden')).toBe('true')
    expect(w.find('#website').attributes('tabindex')).toBe('-1')
  })
})

describe('EnquiryForm — validation', () => {
  beforeEach(() => vi.stubGlobal('fetch', fetchMock))

  it('requires a name', async () => {
    const w = await mountForm()
    await fill(w, { phone: valid.phone })
    await submit(w)
    expect(status(w).text()).toBe('Please enter your name.')
    expect(status(w).classes()).toContain('err')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['', '12345', '4222345678', '98435 0287'])('rejects mobile number %j', async (phone) => {
    const w = await mountForm()
    await fill(w, { name: valid.name, phone })
    await submit(w)
    expect(status(w).text()).toBe('Please enter a valid 10-digit mobile number.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['98435 02872', '+91 98435 02872', '+91-82480-33140', '9843502872'])('accepts mobile number %j', async (phone) => {
    const w = await mountForm()
    await fill(w, { name: valid.name, phone })
    await submit(w)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('validates email only when one is entered', async () => {
    const w = await mountForm()
    await fill(w, { ...valid, email: 'ravi@' })
    await submit(w)
    expect(status(w).text()).toBe('Please enter a valid email address.')
    expect(fetchMock).not.toHaveBeenCalled()

    await fill(w, { email: '' })
    await submit(w)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('clears the error once the visitor fixes it and resubmits', async () => {
    const w = await mountForm()
    await fill(w, { name: valid.name, phone: '123' })
    await submit(w)
    expect(status(w).classes()).toContain('err')

    await fill(w, { phone: valid.phone })
    await submit(w)
    expect(status(w).classes()).toContain('ok')
  })
})

describe('EnquiryForm — submission', () => {
  beforeEach(() => vi.stubGlobal('fetch', fetchMock))

  it('posts every field to the endpoint as a URL-encoded form', async () => {
    const w = await mountForm('/contact?product=On-Grid+Solar')
    await flushPromises()
    await fill(w, {
      ...valid,
      email: 'ravi@example.com',
      city: 'Coimbatore',
      customerType: 'Commercial',
      roofType: 'Flat RCC',
      monthlyBill: '8000',
      ebNumber: '04-123-456',
      message: 'Need 10 kW',
    })
    await submit(w)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(ENDPOINT)
    expect(init.method).toBe('POST')
    // URLSearchParams body = "simple" CORS request, which Apps Script accepts without a preflight.
    expect(init.body).toBeInstanceOf(URLSearchParams)

    const body = sentBody(fetchMock)
    expect(Object.fromEntries(body)).toMatchObject({
      name: 'Ravi Kumar',
      phone: '98435 02872',
      email: 'ravi@example.com',
      city: 'Coimbatore',
      customerType: 'Commercial',
      product: 'On-Grid Solar',
      roofType: 'Flat RCC',
      monthlyBill: '8000',
      ebNumber: '04-123-456',
      message: 'Need 10 kW',
      language: 'en',
      website: '',
    })
    expect(body.get('page')).toContain('/contact')
  })

  it('shows a thank-you message and clears the form on success', async () => {
    const w = await mountForm()
    await fill(w, { ...valid, message: 'Hello' })
    await submit(w)

    expect(status(w).classes()).toEqual(expect.arrayContaining(['show', 'ok']))
    expect(status(w).text()).toContain('Thank you!')
    expect((w.find('#name').element as HTMLInputElement).value).toBe('')
    expect((w.find('#message').element as HTMLTextAreaElement).value).toBe('')
  })

  it('disables the button and shows "Sending…" while the request is in flight', async () => {
    let release!: () => void
    fetchMock.mockImplementationOnce(() => new Promise<Response>((r) => (release = () => r(new Response('{"result":"success"}')))))
    const w = await mountForm()
    await fill(w, valid)
    await w.find('form').trigger('submit')

    const button = w.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toBe('Sending…')

    release()
    await flushPromises()
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.text()).toBe('Submit Enquiry')
  })

  it('shows a fallback phone number when the script reports an error, and keeps the input', async () => {
    fetchMock.mockImplementationOnce(() => respond({ result: 'error', error: 'Server error' }))
    const w = await mountForm()
    await fill(w, valid)
    await submit(w)

    expect(status(w).classes()).toContain('err')
    expect(status(w).text()).toBe("Sorry, we couldn't send your enquiry. Please call us on 98435 02872 or email sun.vbss@gmail.com.")
    expect((w.find('#name').element as HTMLInputElement).value).toBe('Ravi Kumar')
    expect(consoleError).toHaveBeenCalled()
  })

  it('treats an HTTP error status as a failure', async () => {
    fetchMock.mockImplementationOnce(() => respond({ result: 'success' }, 500))
    const w = await mountForm()
    await fill(w, valid)
    await submit(w)
    expect(status(w).text()).toContain("couldn't send your enquiry")
  })

  it('handles a network failure without crashing', async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
    const w = await mountForm()
    await fill(w, valid)
    await submit(w)
    expect(status(w).text()).toContain("couldn't send your enquiry")
    expect(w.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('handles a non-JSON response (e.g. a Google sign-in page) as a failure', async () => {
    fetchMock.mockImplementationOnce(() => Promise.resolve(new Response('<!doctype html><title>Sign in</title>', { status: 200 })))
    const w = await mountForm()
    await fill(w, valid)
    await submit(w)
    expect(status(w).text()).toContain("couldn't send your enquiry")
  })

  it('silently drops submissions where the spam trap is filled', async () => {
    const w = await mountForm()
    await fill(w, { ...valid, website: 'http://spam.example' })
    await submit(w)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(status(w).text()).toBe('')
  })

  it('tells the visitor to call when no endpoint is configured', async () => {
    useRuntimeConfig().public.enquiryEndpoint = ''
    const w = await mountForm()
    await fill(w, valid)
    await submit(w)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(status(w).text()).toBe('Online enquiries are not configured yet. Please call us on 98435 02872 or email sun.vbss@gmail.com.')
  })
})

describe('EnquiryForm — Tamil', () => {
  beforeEach(() => vi.stubGlobal('fetch', fetchMock))

  async function mountTamil(route = '/ta/contact') {
    await useNuxtApp().$i18n.setLocale('ta')
    return mountForm(route)
  }

  afterEach(async () => {
    await useNuxtApp().$i18n.setLocale('en')
  })

  it('shows Tamil labels and option text', async () => {
    const w = await mountTamil()
    expect(w.find('label[for="name"]').text()).toContain('முழுப் பெயர்')
    expect(w.find('#product option[value="Hybrid Solar"]').text()).toBe('ஹைப்ரிட் சோலார்')
    expect(w.find('button[type="submit"]').text()).toBe('விசாரணையைச் சமர்ப்பிக்கவும்')
  })

  it('shows validation errors in Tamil', async () => {
    const w = await mountTamil()
    await fill(w, { name: valid.name, phone: '123' })
    await submit(w)
    expect(status(w).text()).toBe('சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.')
  })

  it('submits English option values with language "ta" so the Sheet stays consistent', async () => {
    const w = await mountTamil('/ta/contact?product=Hybrid+Solar')
    await flushPromises()
    await fill(w, { ...valid, customerType: 'Domestic / Residential', roofType: 'Ground' })
    await submit(w)

    const body = sentBody(fetchMock)
    expect(body.get('product')).toBe('Hybrid Solar')
    expect(body.get('customerType')).toBe('Domestic / Residential')
    expect(body.get('roofType')).toBe('Ground')
    expect(body.get('language')).toBe('ta')
    expect(status(w).text()).toContain('நன்றி!')
  })

  it('shows the Tamil fallback message on failure', async () => {
    fetchMock.mockImplementationOnce(() => respond({ result: 'error' }))
    const w = await mountTamil()
    await fill(w, valid)
    await submit(w)
    expect(status(w).text()).toBe('மன்னிக்கவும், உங்கள் விசாரணையை அனுப்ப முடியவில்லை. தயவுசெய்து 98435 02872 என்ற எண்ணில் அழைக்கவும் அல்லது sun.vbss@gmail.com க்கு மின்னஞ்சல் அனுப்பவும்.')
  })
})
