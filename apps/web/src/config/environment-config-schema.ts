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
  frontendUrl: z.url(),
  domain: z.string(),
  landingPageUrl: z.url(),
  supabaseProjectUrl: z.url(),
  supabaseProjectKey: z.string().min(1),
  sentry: z.object({
    dsn: z.string().min(1),
    options: sentryOptionsSchema,
  }),
  fullstoryOrganizationId: z.string().min(1),
  posthogToken: z.string(),
  areReduxDevToolsEnabled: z.boolean(),
  shouldLogLocally: z.boolean(),
  paginationLimit: z.number().min(1).max(1000),
  hashedEmailsOfTestUsers: z.array(z.string().min(1)),
  // it was used for the first time when testing the conversation
  hashedEmailsOfUsersWithEarlyAccessToFeatures: z.array(z.string().min(1)),
  featureFlags: z.object({
    isLifetimePricingEnabled: z.function({
      input: [z.string().optional()],
      output: z.boolean(),
    }),
    isPosthogDebugEnabled: z.function({
      input: [],
      output: z.boolean(),
    }),
    // means that all users have to introduce a credit card to get a free trial
    // more about this flag here: https://www.notion.so/grammarians/Try-to-make-the-app-closed-for-everyone-164168e7b01a802abc1ce87221ab704b
    // the below two flags should never be set to true at the same time, as it doesn't make sense
    isCreditCardRequiredForAll: z.function({
      input: [],
      output: z.boolean(),
    }),
    shouldAppBeFreeForEveryone: z.function({
      input: [],
      output: z.boolean(),
    }),
    isConversationExerciseEnabled: z.function({
      input: [z.string().optional()],
      output: z.boolean(),
    }),
    isTranslationExerciseEnabled: z.function({
      input: [z.string().optional()],
      output: z.boolean(),
    }),
  }),
})
