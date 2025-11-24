import { z } from 'zod'

export const googleServiceAccountCredentialsSchema = z.object({
  type: z.literal('service_account'),
  project_id: z.string().min(1),
  private_key_id: z.string().min(1),
  private_key: z.string().min(1),
  client_email: z.email(),
  client_id: z.string().min(1),
  auth_uri: z.url(),
  token_uri: z.url(),
  auth_provider_x509_cert_url: z.url(),
  client_x509_cert_url: z.url(),
  universe_domain: z.string().min(1),
})

export const validateGoogleServiceAccountCredentials = (val: string): boolean => {
  try {
    googleServiceAccountCredentialsSchema.parse(JSON.parse(val))
    return true
  } catch {
    return false
  }
}

const sentrySampleRate = z.number().min(0).max(1)

const sentryOptionsSchema = z.object({
  maxValueLength: z.number().int().positive(),
  tracesSampleRate: sentrySampleRate,
  profilesSampleRate: sentrySampleRate,
  tracePropagationTargets: z.array(z.url()),
})

export const environmentConfigSchema = z.object({
  environmentName: z.string(),
  port: z.number().min(1).max(65535),
  frontendUrl: z.url(),
  allowedCorsOrigins: z.array(z.union([z.string(), z.instanceof(RegExp)])).min(1),
  // https://elevenlabs.io/app/settings/api-keys
  elevenlabsApiKey: z.string().min(1),
  // https://platform.openai.com/settings/organization/api-keys
  openaiApiKey: z.string().min(1),
  // https://console.anthropic.com/settings/keys
  anthropicApiKey: z.string().min(1),
  // https://console.deepgram.com/project/0c20564d-ad27-4c95-8412-b78ba83b9154/keys
  deepgramApiKey: z.string().min(1),
  // https://resend.com/api-keys
  resendApiKey: z.string().min(1),
  stripeSecretKey: z.string().min(1),
  stripeWebhookSecret: z.string().min(1),
  stripeMonthlyPriceInEurId: z.string().min(1),
  stripeYearlyPriceInEurId: z.string().min(1),
  stripeMonthlyPriceInPlnId: z.string().min(1),
  stripeYearlyPriceInPlnId: z.string().min(1),
  supabaseJwtSecret: z.string().min(1),
  supabaseConnectionString: z.string().min(1),
  // https://console.cloud.google.com/apis/credentials?project=yourbestaccent
  googleVertexAiServiceAccountCredentials: z.string().refine(validateGoogleServiceAccountCredentials),
  googleServiceAccountCredentials: z.string().refine(validateGoogleServiceAccountCredentials),
  googleAffiliateSpreadsheetId: z.string().min(1),
  // https://fly.customer.io/settings/api_credentials
  customerioSiteId: z.string().min(1),
  customerioApiKey: z.string().min(1),
  customerioAppApiKey: z.string().min(1),
  // https://app.revenuecat.com/projects/da60432b/api-keys
  revenuecatApiKey: z.string().min(1),
  // https://app.revenuecat.com/projects/da60432b/settings
  revenuecatProjectId: z.string().min(1),
  // https://app.revenuecat.com/projects/da60432b/integrations/webhooks
  revenuecatWebhookAuthHeader: z.string().min(1),
  posthogApiKey: z.string().min(1),
  googleAiStudioApiKey: z.string().min(1),
  cartesiaApiKey: z.string().min(1),
  shouldLogRequests: z.boolean(),
  personalElevenlabsVoiceId: z.string(),
  // We capture all errors, in development and in production
  sentry: z.object({
    dsn: z.string().min(1),
    options: sentryOptionsSchema,
  }),
  supabaseUrl: z.string(),
  supabaseServiceRoleKey: z.string(),
  shouldRateLimit: z.boolean(),
  shouldMockThirdParties: z.boolean(),
  shouldSlowDownApiRoutes: z.boolean(),
  shouldSkipVoiceCloningChecks: z.boolean(),
  shouldHaveSecretFrontendHeader: z.boolean(),
  usersWithFreeAccess: z.array(z.email()),
  // test users are currently the users of Kamil, Sébastien and the freelancers who work with us
  // https://www.notion.so/grammarians/our-emails-116168e7b01a805e9244e2441444c34d
  emailsOfTestUsers: z.array(z.email()),
  featureFlags: z.object({
    // the below two flags should never be set to true at the same time, as it doesn't make sense
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

export type EnvironmentConfig = z.infer<typeof environmentConfigSchema>
