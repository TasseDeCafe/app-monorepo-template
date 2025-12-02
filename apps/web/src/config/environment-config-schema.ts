import { z } from 'zod'

const sentrySampleRate = z.number().min(0).max(1)

const sentryOptionsSchema = z.object({
  maxValueLength: z.number().int().positive(),
  tracesSampleRate: sentrySampleRate,
  replaysSessionSampleRate: sentrySampleRate,
  replaysOnErrorSampleRate: sentrySampleRate,
  // Those parameters allow for logging request and response bodies
  networkDetailAllowUrls: z.array(z.string()),
  networkRequestHeaders: z.array(z.string()),
  networkResponseHeaders: z.array(z.string()),
})

export const environmentConfigSchema = z.object({
  environmentName: z.string(),
  apiHost: z.url(),
  webUrl: z.url(),
  domain: z.string(),
  landingPageUrl: z.url(),
  supabaseProjectUrl: z.url(),
  supabasePublishableKey: z.string().min(1),
  sentry: z.object({
    dsn: z.string().min(1),
    options: sentryOptionsSchema,
  }),
  posthogToken: z.string().min(1),
  shouldLogLocally: z.boolean(),
  hashedEmailsOfTestUsers: z.array(z.string().min(1)),
  featureFlags: z.object({
    // means that all users have to introduce a credit card to get a free trial
    // the two flags should never be set to true at the same time, as it doesn't make sense
    isCreditCardRequiredForAll: z.function({
      input: [],
      output: z.boolean(),
    }),
    shouldAppBeFreeForEveryone: z.function({
      input: [],
      output: z.boolean(),
    }),
  }),
})
