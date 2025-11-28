import { z } from 'zod'

const sentrySampleRate = z.number().min(0).max(1)

const sentryOptionsSchema = z.object({
  // See https://docs.sentry.io/platforms/react-native/enriching-events/screenshots/
  attachScreenshot: z.boolean(),
  tracesSampleRate: sentrySampleRate,
  profilesSampleRate: sentrySampleRate,
  maxValueLength: z.number().int().positive(),
  enableNativeFramesTracking: z.boolean(),
  replaysSessionSampleRate: sentrySampleRate.optional(),
  replaysOnErrorSampleRate: sentrySampleRate.optional(),
})

export const environmentConfigSchema = z.object({
  environmentName: z.string(),
  webUrl: z.url(),
  apiHost: z.url(),
  supabaseProjectUrl: z.url(),
  supabaseProjectKey: z.string().min(1),
  googleClientId: z.string().min(1),
  googleIosClientId: z.string().min(1),
  revenueCatAppleApiKey: z.string().min(1),
  revenueCatGoogleApiKey: z.string().min(1),
  shouldLogLocally: z.boolean(),
  shouldSkipRevenueCatPaywall: z.boolean(),
  sentry: z.object({
    dsn: z.string().min(1),
    options: sentryOptionsSchema,
  }),
  shouldCheckForEasUpdates: z.boolean(),
  hashedEmailsOfTestUsers: z.array(z.string().min(1)),
  posthogToken: z.string().min(1),
  posthogHost: z.string().min(1),
})

const processEnvSchema = z.object({
  EXPO_PUBLIC_API_HOST_TUNNEL: z.string(),
  EXPO_PUBLIC_WEB_URL_TUNNEL: z.string(),
  EXPO_PUBLIC_SUPABASE_PROJECT_URL_TUNNEL: z.string(),
  EXPO_PUBLIC_SUPABASE_PROJECT_KEY: z.string(),
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string(),
  EXPO_PUBLIC_APP_ENV: z.string(),
  EXPO_PUBLIC_SENTRY_DSN: z.string(),
  EXPO_PUBLIC_REVENUE_CAT_APPLE_API_KEY: z.string(),
  EXPO_PUBLIC_REVENUE_CAT_GOOGLE_API_KEY: z.string(),
  EXPO_PUBLIC_HASHED_EMAILS_OF_TEST_USERS: z.string(),
  EXPO_PUBLIC_POSTHOG_TOKEN: z.string(),
})

export const env = processEnvSchema.parse({
  EXPO_PUBLIC_API_HOST_TUNNEL: process.env.EXPO_PUBLIC_API_HOST_TUNNEL,
  EXPO_PUBLIC_WEB_URL_TUNNEL: process.env.EXPO_PUBLIC_WEB_URL_TUNNEL,
  EXPO_PUBLIC_SUPABASE_PROJECT_URL_TUNNEL: process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL_TUNNEL,
  EXPO_PUBLIC_SUPABASE_PROJECT_KEY: process.env.EXPO_PUBLIC_SUPABASE_PROJECT_KEY,
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  EXPO_PUBLIC_REVENUE_CAT_APPLE_API_KEY: process.env.EXPO_PUBLIC_REVENUE_CAT_APPLE_API_KEY,
  EXPO_PUBLIC_REVENUE_CAT_GOOGLE_API_KEY: process.env.EXPO_PUBLIC_REVENUE_CAT_GOOGLE_API_KEY,
  EXPO_PUBLIC_HASHED_EMAILS_OF_TEST_USERS: process.env.EXPO_PUBLIC_HASHED_EMAILS_OF_TEST_USERS,
  EXPO_PUBLIC_POSTHOG_TOKEN: process.env.EXPO_PUBLIC_POSTHOG_TOKEN,
})
