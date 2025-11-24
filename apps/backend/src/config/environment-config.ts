import {
  getEnvironmentName,
  isDevelopment,
  isDevelopmentForMobile,
  isDevelopmentWithoutThirdParties,
  isDevelopmentWithoutThirdPartiesForMobile,
  isProduction,
  isTest,
} from '../utils/environment-utils'
import { parseEmails } from './environment-config-utils'
import { EnvironmentConfig } from './environment-config-schema'

const productionConfig: EnvironmentConfig = {
  environmentName: 'production',
  port: 4004,
  frontendUrl: 'https://app.template-app.com',
  shouldLogRequests: false,
  allowedCorsOrigins: [
    'https://template-app.com',
    'https://www.template-app.com',
    'https://app.template-app.com',
    /https:\/\/.*-template-organization\.vercel\.app(\/.*)?/, // Vercel Preview URLs
  ],
  resendApiKey: process.env.RESEND_API_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripeMonthlyPriceInEurId: process.env.STRIPE_MONTHLY_PRICE_IN_EUR_ID || '',
  stripeYearlyPriceInEurId: process.env.STRIPE_YEARLY_PRICE_IN_EUR_ID || '',
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      tracePropagationTargets: ['https://app.template-app.com', 'https://api.template-app.com'],
    },
  },
  // shown by `supabase start` command
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  supabaseConnectionString: process.env.SUPABASE_CONNECTION_STRING || '',
  supabaseUrl: process.env.SUPABASE_PROJECT_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  revenuecatApiKey: process.env.REVENUECAT_API_KEY || '',
  revenuecatProjectId: process.env.REVENUECAT_PROJECT_ID || '',
  revenuecatWebhookAuthHeader: process.env.REVENUECAT_WEBHOOK_AUTH_HEADER || '',
  posthogApiKey: process.env.POSTHOG_API_KEY || '',
  shouldRateLimit: true,
  shouldMockThirdParties: false,
  shouldSlowDownApiRoutes: false,
  usersWithFreeAccess: parseEmails(process.env.USERS_WITH_FREE_ACCESS || '').validEmails,
  emailsOfTestUsers: parseEmails(process.env.EMAILS_OF_TEST_USERS || '').validEmails,
  featureFlags: {
    isCreditCardRequiredForAll: () => true,
    shouldAppBeFreeForEveryone: () => false,
  },
}

const developmentConfig: EnvironmentConfig = {
  environmentName: 'development',
  port: 4003,
  frontendUrl: 'http://localhost:5174',
  shouldLogRequests: true,
  allowedCorsOrigins: [
    'http://localhost:5174',
    'http://localhost:4173', // "yarn preview" origin
  ],
  resendApiKey: process.env.RESEND_API_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripeMonthlyPriceInEurId: process.env.STRIPE_MONTHLY_PRICE_IN_EUR_ID || '',
  stripeYearlyPriceInEurId: process.env.STRIPE_YEARLY_PRICE_IN_EUR_ID || '',
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      profilesSampleRate: 0,
      tracePropagationTargets: ['http://localhost:5174', 'http://localhost:4003'],
    },
  },
  supabaseJwtSecret: 'super-secret-jwt-token-with-at-least-32-characters-long',
  supabaseConnectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  // shown by `yarn db:dev` command
  supabaseUrl: 'http://127.0.0.1:54321',
  // shown by `yarn db:dev` command
  supabaseServiceRoleKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  revenuecatApiKey: process.env.REVENUECAT_API_KEY || '',
  revenuecatProjectId: process.env.REVENUECAT_PROJECT_ID || '',
  revenuecatWebhookAuthHeader: process.env.REVENUECAT_WEBHOOK_AUTH_HEADER || '',
  posthogApiKey: process.env.POSTHOG_API_KEY || '',
  shouldRateLimit: true,
  shouldMockThirdParties: false,
  shouldSlowDownApiRoutes: false,
  usersWithFreeAccess: parseEmails(process.env.USERS_WITH_FREE_ACCESS || '').validEmails,
  emailsOfTestUsers: parseEmails(process.env.EMAILS_OF_TEST_USERS || '').validEmails,
  featureFlags: {
    isCreditCardRequiredForAll: () => true,
    shouldAppBeFreeForEveryone: () => false,
  },
}

const developmentForMobileConfig: EnvironmentConfig = {
  ...developmentConfig,
  port: 4002,
  frontendUrl: process.env.FRONTEND_URL_MOBILE || '',
  allowedCorsOrigins: [process.env.FRONTEND_URL_MOBILE || ''],
  supabaseConnectionString: 'postgresql://postgres:postgres@127.0.0.1:34322/postgres',
  // shown by `yarn db:dev:mobile` command
  supabaseUrl: 'http://127.0.0.1:34321',
  // shown by `yarn db:dev:mobile` command
  supabaseServiceRoleKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
}

const developmentWithoutThirdPartiesConfig: EnvironmentConfig = {
  ...developmentConfig,
  sentry: {
    dsn: 'dummySentryDsn',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 1.0,
      profilesSampleRate: 0,
      tracePropagationTargets: [],
    },
  },
  shouldMockThirdParties: true,
  shouldSlowDownApiRoutes: false,
}

const developmentWithoutThirdPartiesForMobileConfig: EnvironmentConfig = {
  ...developmentWithoutThirdPartiesConfig,
  frontendUrl: process.env.FRONTEND_URL_MOBILE || '',
  allowedCorsOrigins: [process.env.FRONTEND_URL_MOBILE || ''],
  supabaseConnectionString: 'postgresql://postgres:postgres@127.0.0.1:34322/postgres',
}

const testConfig: EnvironmentConfig = {
  environmentName: 'test',
  port: 1,
  frontendUrl: 'some-frontend-url',
  shouldLogRequests: false,
  allowedCorsOrigins: ['some-frontend-url'],
  resendApiKey: 'dummyResendApiKey',
  stripeSecretKey: 'dummyStripeSecretKey',
  stripeWebhookSecret: 'dummyStripeWebhookSecret',
  stripeMonthlyPriceInEurId: 'dummyStripeMonthlyPriceInEurId',
  stripeYearlyPriceInEurId: 'dummyStripeYearlyPriceInEurId',
  sentry: {
    // we can't pass 'dummySentryDsn' here, sentry doesn't accept that
    // this was necessary for GRAM-1788
    dsn: '',
    options: {
      maxValueLength: 8192,
      tracesSampleRate: 0,
      profilesSampleRate: 0,
      tracePropagationTargets: [],
    },
  },
  supabaseJwtSecret: 'dummySupabaseJwtSecret',
  supabaseConnectionString: 'postgresql://postgres:postgres@127.0.0.1:64322/postgres',
  // shown by `yarn db:test` command
  supabaseUrl: 'http://127.0.0.1:64321',
  // shown by `yarn db:test` command
  supabaseServiceRoleKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  revenuecatApiKey: 'dummyRevenuecatApiKey',
  revenuecatProjectId: 'dummyRevenuecatProjectId',
  revenuecatWebhookAuthHeader: 'dummyRevenuecatWebhookAuthHeader',
  posthogApiKey: 'dummyPosthogApiKey',
  shouldRateLimit: false,
  shouldMockThirdParties: true,
  shouldSlowDownApiRoutes: false,
  usersWithFreeAccess: [],
  emailsOfTestUsers: [],
  featureFlags: {
    isCreditCardRequiredForAll: () => true,
    shouldAppBeFreeForEveryone: () => false,
  },
}

let environmentConfig: EnvironmentConfig
export const getConfig = (): EnvironmentConfig => {
  if (!environmentConfig) {
    if (isProduction()) {
      environmentConfig = productionConfig
    } else if (isDevelopment()) {
      environmentConfig = developmentConfig
    } else if (isDevelopmentForMobile()) {
      environmentConfig = developmentForMobileConfig
    } else if (isDevelopmentWithoutThirdParties()) {
      environmentConfig = developmentWithoutThirdPartiesConfig
    } else if (isDevelopmentWithoutThirdPartiesForMobile()) {
      environmentConfig = developmentWithoutThirdPartiesForMobileConfig
    } else if (isTest()) {
      environmentConfig = testConfig
    } else {
      throw Error(`There is no config for environment: ${getEnvironmentName()}`)
    }
  }
  return environmentConfig
}
