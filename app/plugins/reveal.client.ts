// Fades `.reveal` elements in as they scroll into view.
// Content is fully visible without JS (and to crawlers); the animation only applies once this runs.
export default defineNuxtPlugin((nuxtApp) => {
  if (!('IntersectionObserver' in window)) return
  document.documentElement.classList.add('js-reveal')

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12 },
  )

  const observe = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
  nuxtApp.hook('app:mounted', observe)
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(observe)
  })
})
