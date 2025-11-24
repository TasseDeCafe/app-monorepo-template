import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { lingui } from '@lingui/vite-plugin'

export default defineConfig({
  // We don't use a vitest.config.ts here because we have tests that import from
  // @lingui/core/macro and adding this config is recommended by Lingui
  // This might require some further configuration if we add more tests
  // Vite can actually configure vitest from this file.
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
  ],
})
