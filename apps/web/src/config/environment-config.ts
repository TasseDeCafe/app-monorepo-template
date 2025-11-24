import { z } from 'zod'
import { getModeName, isDevelopment, isDevelopmentForMobile, isProduction, isTest } from './environment-utils.ts'
import { environmentConfigSchema } from './environment-config-schema.ts'
import { featureFlagsLocalStorageWrapper } from '../local-storage/feature-flags-local-storage-wrapper.ts'
import { parseHashedEmails } from './environment-config-utils.ts'

type EnvironmentConfig = z.infer<typeof environmentConfigSchema>

const getProductionConfig = (): EnvironmentConfig => ({
  environmentName: 'production',
  apiHost: import.meta.env.VITE_API_HOST,
  frontendUrl: 'https://app.yourbestaccent.com',
  domain: 'yourbestaccent.com',
  landingPageUrl: import.meta.env.VITE_LANDING_PAGE_URL,
  supabaseProjectUrl: import.meta.env.VITE_SUPABASE_PROJECT_URL,
  supabaseProjectKey: import.meta.env.VITE_SUPABASE_PROJECT_KEY,
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      networkDetailAllowUrls: [`${import.meta.env.VITE_API_HOST}/api/v1/*`],
      networkRequestHeaders: ['X-Custom-Header'],
      networkResponseHeaders: ['X-Custom-Header'],
    },
  },
  fullstoryOrganizationId: import.meta.env.VITE_FULLSTORY_ORGANIZATION_ID,
  posthogToken: import.meta.env.VITE_POSTHOG_TOKEN,
  areReduxDevToolsEnabled: true,
  shouldLogLocally: false,
  paginationLimit: 500,
  hashedEmailsOfTestUsers: parseHashedEmails(import.meta.env.VITE_HASHED_EMAILS_OF_TEST_USERS || ''),
  hashedEmailsOfUsersWithEarlyAccessToFeatures: parseHashedEmails(
    import.meta.env.VITE_HASHED_EMAILS_OF_USERS_WITH_EARLY_ACCESS_TO_FEATURES || ''
  ),
  featureFlags: {
    isLifetimePricingEnabled: () => false,
    isPosthogDebugEnabled: () => featureFlagsLocalStorageWrapper.getIsPosthogDebugEnabledFeatureFlag(),
    isCreditCardRequiredForAll: () => true,
    shouldAppBeFreeForEveryone: () => false,
    isConversationExerciseEnabled: () => true,
    isTranslationExerciseEnabled: () => true,
  },
})

const getDevelopmentConfig = (): EnvironmentConfig => ({
  environmentName: 'development',
  apiHost: 'http://localhost:4003',
  frontendUrl: 'http://localhost:5174',
  domain: 'localhost',
  landingPageUrl: 'http://localhost:3000',
  // shown by `supabase start` command
  supabaseProjectUrl: 'http://127.0.0.1:54321',
  // shown by `supabase start` command
  supabaseProjectKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      networkDetailAllowUrls: [`${import.meta.env.VITE_API_HOST}/api/v1/*`],
      networkRequestHeaders: ['X-Custom-Header'],
      networkResponseHeaders: ['X-Custom-Header'],
    },
  },
  // we cannot afford having another fullstory organization id for development
  fullstoryOrganizationId: 'dummyFullstoryOrganizationId',
  posthogToken: import.meta.env.VITE_POSTHOG_TOKEN || '',
  areReduxDevToolsEnabled: true,
  shouldLogLocally: true,
  paginationLimit: 30,
  hashedEmailsOfTestUsers: parseHashedEmails(import.meta.env.VITE_HASHED_EMAILS_OF_TEST_USERS || ''),
  hashedEmailsOfUsersWithEarlyAccessToFeatures: parseHashedEmails(
    import.meta.env.VITE_HASHED_EMAILS_OF_USERS_WITH_EARLY_ACCESS_TO_FEATURES || ''
  ),
  featureFlags: {
    isLifetimePricingEnabled: () => false,
    isPosthogDebugEnabled: () => false,
    isCreditCardRequiredForAll: () => true,
    shouldAppBeFreeForEveryone: () => false,
    isConversationExerciseEnabled: () => true,
    isTranslationExerciseEnabled: () => true,
  },
})

const getDevelopmentForMobileConfig = (): EnvironmentConfig => ({
  ...getDevelopmentConfig(),
  frontendUrl: import.meta.env.VITE_FRONTEND_URL_MOBILE,
  domain: 'yourbestaccent.dev',
  environmentName: 'development-for-mobile',
  apiHost: import.meta.env.VITE_API_HOST,
  landingPageUrl: import.meta.env.VITE_LANDING_PAGE_URL,
  supabaseProjectUrl: import.meta.env.VITE_SUPABASE_PROJECT_URL,
})

const getTestConfig = (): EnvironmentConfig => ({
  environmentName: 'test',
  apiHost: 'no-host-because-it-is-a-test',
  frontendUrl: 'no-frontend-url-because-it-is-a-test',
  domain: 'some-domain',
  landingPageUrl: 'some-landing-page-url',
  supabaseProjectUrl: 'dummy-supabase-project-url',
  supabaseProjectKey: 'dummy-supabase-project-key',
  sentry: {
    dsn: 'dummySentryDsn',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      networkDetailAllowUrls: [],
      networkRequestHeaders: [],
      networkResponseHeaders: [],
    },
  },
  fullstoryOrganizationId: 'dummyFullstoryOrganizationId',
  posthogToken: '',
  areReduxDevToolsEnabled: true,
  shouldLogLocally: true,
  paginationLimit: 30,
  hashedEmailsOfTestUsers: [],
  hashedEmailsOfUsersWithEarlyAccessToFeatures: [],
  featureFlags: {
    isLifetimePricingEnabled: () => false,
    isPosthogDebugEnabled: () => false,
    isCreditCardRequiredForAll: () => true,
    shouldAppBeFreeForEveryone: () => false,
    isConversationExerciseEnabled: () => true,
    isTranslationExerciseEnabled: () => true,
  },
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
