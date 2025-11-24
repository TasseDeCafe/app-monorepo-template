import { z } from 'zod'
import { getModeName, isDevelopment, isDevelopmentForMobile, isProduction, isTest } from './environment-utils'
import { environmentConfigSchema } from './environment-config-schema'

type EnvironmentConfig = z.infer<typeof environmentConfigSchema>

const getProductionConfig = (): EnvironmentConfig => ({
  environmentName: 'production',
  domain: 'template-app.com',
  frontendUrl: 'https://app.template-app.com',
  landingPageUrl: 'https://www.template-app.com',
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_TOKEN || '',
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    },
  },
  featureFlags: {
    isLifetimePricingEnabled: () => false,
    isCreditCardRequiredForAll: () => true,
    shouldInformAboutIosNativeApp: () => true,
    shouldInformAboutAndroidNativeApp: () => true,
  },
})

const getDevelopmentConfig = (): EnvironmentConfig => ({
  environmentName: 'development',
  domain: 'localhost',
  frontendUrl: 'http://localhost:5174',
  landingPageUrl: 'http://localhost:3000',
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_TOKEN || '',
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    },
  },
  featureFlags: {
    isLifetimePricingEnabled: () => false,
    isCreditCardRequiredForAll: () => true,
    shouldInformAboutIosNativeApp: () => true,
    shouldInformAboutAndroidNativeApp: () => true,
  },
})

const getDevelopmentForMobileConfig = (): EnvironmentConfig => ({
  ...getDevelopmentConfig(),
  domain: 'template-app.dev',
  environmentName: 'development-for-mobile',
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL_MOBILE || '',
  landingPageUrl: process.env.NEXT_PUBLIC_LANDING_PAGE_URL || '',
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_TOKEN || '',
})

const getTestConfig = (): EnvironmentConfig => ({
  environmentName: 'test',
  frontendUrl: 'http://localhost:5173',
  landingPageUrl: 'localhost:3000',
  posthogToken: '',
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    },
  },
  featureFlags: {
    isLifetimePricingEnabled: () => false,
    isCreditCardRequiredForAll: () => true,
    shouldInformAboutIosNativeApp: () => true,
    shouldInformAboutAndroidNativeApp: () => true,
  },
  domain: 'some-domain',
})

let config: EnvironmentConfig | null = null

export const getConfig = (): EnvironmentConfig => {
  if (!config) {
    if (isProduction()) {
      config = getProductionConfig()
    } else if (isDevelopment()) {
      config = getDevelopmentConfig()
    } else if (isDevelopmentForMobile()) {
      config = getDevelopmentForMobileConfig()
    } else if (isTest()) {
      config = getTestConfig()
    } else {
      throw Error(`There is no config for environment: ${getModeName()}`)
    }
  }
  return config
}
