import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { lingui } from '@lingui/vite-plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/routeTree.gen.ts',
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
        filesToDeleteAfterUpload: ['./**/*.map', '.*/**/public/**/*.map', './dist/**/client/**/*.map'],
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
  server: {
    // Necessary to make sure that app-monorepo-template.dev is allowed
    // when false, only localhost is allowed
    allowedHosts: true,
  },
})
