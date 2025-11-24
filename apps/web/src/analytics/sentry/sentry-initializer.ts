import * as Sentry from '@sentry/react'
import { getConfig } from '@/config/environment-config.ts'

const getSentryEnvironment = (configEnvironment: string): string => {
  switch (configEnvironment) {
    case 'development':
    case 'development-for-mobile':
      return 'development'
    default:
      return configEnvironment
  }
}

export const initializeSentry = () => {
  const config = getConfig()

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: getSentryEnvironment(config.environmentName),
    ...config.sentry.options,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        networkDetailAllowUrls: config.sentry.options.networkDetailAllowUrls,
        networkRequestHeaders: config.sentry.options.networkRequestHeaders,
        networkResponseHeaders: config.sentry.options.networkResponseHeaders,
      }),
    ],
  })
}

export const identifyUserWithSentry = (userId: string) => {
  Sentry.setUser({ id: userId })
}

export const clearSentryUser = () => {
  Sentry.setUser(null)
}
