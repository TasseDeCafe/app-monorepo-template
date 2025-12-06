import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { lingui } from '@lingui/vite-plugin'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler', 'macros'],
      },
    }),
    lingui(),
    tsconfigPaths(),
    sentryVitePlugin({
      org: 'template-organization',
      project: 'web',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.RAILWAY_GIT_COMMIT_SHA,
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ['**/*.js.map'],
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  server: {
    // Necessary to make sure that template-app.dev is allowed
    // when false, only localhost is allowed
    allowedHosts: true,
  },
})
