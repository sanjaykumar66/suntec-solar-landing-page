import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      // Pure logic (validation, content parity, Apps Script backend) — fast, plain Node.
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      // Vue components mounted inside a real Nuxt app (i18n, router, runtime config).
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
              overrides: {
                runtimeConfig: { public: { enquiryEndpoint: 'https://script.example.test/exec' } },
              },
            },
          },
        },
      }),
    ],
  },
})
