import { z } from 'zod'

const sentrySampleRate = z.number().min(0).max(1)

const sentryOptionsSchema = z.object({
  maxValueLength: z.number().int().positive(),
  tracesSampleRate: sentrySampleRate,
  replaysSessionSampleRate: sentrySampleRate,
  replaysOnErrorSampleRate: sentrySampleRate,
})

export const environmentConfigSchema = z.object({
  environmentName: z.string(),
  domain: z.string(),
  webUrl: z.url(),
  landingPageUrl: z.url(),
  posthogToken: z.string(),
  sentry: z.object({
    dsn: z.string().min(1),
    options: sentryOptionsSchema,
  }),
  featureFlags: z.object({
    isLifetimePricingEnabled: z.function({
      input: [],
      output: z.boolean(),
    }),
    isCreditCardRequiredForAll: z.function({
      input: [],
      output: z.boolean(),
    }),
    shouldInformAboutIosNativeApp: z.function({
      input: [],
      output: z.boolean(),
    }),
    shouldInformAboutAndroidNativeApp: z.function({
      input: [],
      output: z.boolean(),
    }),
  }),
})
