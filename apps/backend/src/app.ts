import express, { Express, Request } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'

import { HealthCheckRouter } from './router/health-check-router/health-check-router'
import { SentryDebugRouter } from './router/sentry-debug-router/sentry-debug-router'
import { getConfig } from './config/environment-config'
import { tokenAuthenticationMiddleware } from './middleware/authentication-middleware/token-authentication-middleware/token-authentication-middleware'
import { requestContextMiddleware } from './middleware/request-context-middleware'
import { slowDownMiddleware } from './middleware/slow-down-middleware'
import { createRateLimitMiddleware } from './middleware/rate-limiting-middleware'
import { ContactEmailRouter } from './router/contact-email-router/contact-email-router'
import { PronunciationEvaluationExerciseRouter } from './router/exercises/pronunciation-evaluation/pronunciation-evaluation-exercise-router'
import { StressExerciseRouter } from './router/exercises/stress-exercise/stress-exercise-router'
import { TranslationExerciseRouter } from './router/exercises/translation-exercise/translation-exercise-router'
import { TransliterationRouter } from './router/transliteration-router/transliteration-router'
import { LanguageDetectionRouter } from './router/language-detection-router/language-detection-router'
import { WordsRouter } from './router/words-router/words-router'
import { LeaderboardRouter } from './router/leaderboard-router/leaderboard-router'
import { WordsRepository } from './transport/database/words/words-repository'
import { CheckoutRouter } from './router/billing-router/checkout-router'
import { stripeWebhookRouter } from './router/webhooks/stripe/stripe-webhook-router'
import { subscriptionMiddleware } from './middleware/subscription-middleware'
import { BillingRouter } from './router/billing-router/billing-router'
import { ElevenlabsApi, MockElevenlabsApi } from './transport/third-party/elevenlabs/elevenlabs-api'
import { MockOpenaiApi, OpenaiApi } from './transport/third-party/llms/openai/openai-api'
import { MockResendApi, ResendApi } from './transport/third-party/resend/resend-api'
import { DeepgramApi, MockDeepgramApi } from './transport/third-party/deepgram/deepgram-api'
import { removalsRouter } from './router/removals-router/removals-router'
import { GoogleApi, MockGoogleApi } from './transport/third-party/google/google-api'
import { MockStripeApi, StripeApi } from './transport/third-party/stripe/stripe-api'
import { FrequencyLists, mockFrequencyLists } from './utils/frequency-list-utils'
import { authenticationRouter } from './router/authentication-router/authentication-router'
import { SavedWordsRouter } from './router/saved-words/saved-words-router'
import { StressExerciseService } from './service/stress-exercise-service/stress-exercise-service'
import { SavedWordsRepository } from './transport/database/saved-words/saved-words-repository'
import { BillingService } from './service/get-subscription-account-data-service/billing-service'
import { PortalSessionRouter } from './router/billing-router/portal-session-router'
import { buildAuthUsersRepository } from './transport/database/auth-users/auth-users-repository'
import { AudioTranscriptionRouter } from './router/audio-transcription-router/audio-transcription-router'
import { frontendAuthenticationMiddleware } from './middleware/authentication-middleware/frontend-authentication-middleware/frontend-authentication-middleware'
import { CustomerioApi, MockCustomerioApi } from './transport/third-party/customerio/customerio-api'
import { AudioGenerationService } from './service/audio-generation-service/audio-generation-service'
import { AudioGenerationRouter } from './router/audio-generation-router/audio-generation-router'
import { TranslationRouter } from './router/translation-router/translation-router'
import { UserMarketingPreferencesRouter } from './router/users/user-marketing-preferences-router/user-marketing-preferences-router'
import { MessagesRepository } from './transport/database/messages/messages-repository-interface'
import { GrammarCorrectionRouter } from './router/grammar-correction-router/grammar-correction-router'
import { PronunciationEvaluationExerciseRepository } from './transport/database/pronunciation-exercises/pronunciation-evaluation-exercise-repository'
import { PronunciationEvaluationExerciseService } from './service/exercises/pronunciation-evaluation-exercise-service/pronunciation-evaluation-exercise-service'
import { GenericLlmApi, MockGenericLlmApi } from './transport/third-party/llms/generic-llm/generic-llm-api'
import { MockRevenuecatApi, RevenuecatApi } from './transport/third-party/revenuecat/revenuecat-api'
import { revenuecatWebhookRouter } from './router/webhooks/revenuecat/revenuecat-webhook-router'
import { buildHandledRevenuecatEventsRepository } from './transport/database/webhook-events/handled-revenuecat-events-repository'
import { IpaTranscriptionService } from './service/ipa-transcription-service-interface'
import { UserRouter } from './router/users/user-router/user-router'
import { MessagesService } from './service/messages-service/messages-service'
import {
  StripeSubscriptionsRepository,
  StripeSubscriptionsRepositoryInterface,
} from './transport/database/stripe-subscriptions/stripe-subscriptions-repository'
import { StripeService } from './service/stripe-service/stripe-service'
import { AccessCacheServiceInterface } from './service/long-running/subscription-cache-service/access-cache-service'
import { MockAccessCacheService } from './service/long-running/subscription-cache-service/mock-access-cache-service'
import { UsersRepository, UsersRepositoryInterface } from './transport/database/users/users-repository'
import { XpRepository } from './transport/database/xp/xp-repository'
import { UserStatsService } from './service/user-stats/user-stats-service'
import { StripeWebhookService } from './service/stripe-webhook-service/stripe-webhook-service'
import {
  RevenuecatSubscriptionsRepository,
  RevenuecatSubscriptionsRepositoryInterface,
} from './transport/database/revenuecat-subscriptions/revenuecat-subscriptions-repository'
import { LANGUAGE_DETECTION_ROUTE } from '@yourbestaccent/api-client/orpc-contracts/language-detection-contract'
import { configRouter } from './router/config-router/config-router'
import { RevenuecatService } from './service/revenuecat-service/revenuecat-service'
import { TranslationExerciseService } from './service/translation-exercise-service/translation-exercise-service'
import { TranslationExercisesRepository } from './transport/database/translation-exercises/translation-exercises-repository'
import { orpcRelativePaths } from './router/orpc/orpc-paths'
import { AudioRouter } from './router/audio-router/audio-router'
import { IpaTranscriptionRouter } from './router/ipa-transcription-router/ipa-transcription-router'
import { MessagesRouter } from './router/messages-router/messages-router'
import { UserSettingsRouter } from './router/users/user-settings-router/user-settings-router'
import { CartesiaApi, MockCartesiaApi } from './transport/third-party/cartesia/cartesia-api'

export type AppDependencies = {
  stripeSubscriptionsRepository?: StripeSubscriptionsRepositoryInterface
  revenuecatSubscriptionsRepository?: RevenuecatSubscriptionsRepositoryInterface
  usersRepository?: UsersRepositoryInterface
  accessCache?: AccessCacheServiceInterface
  usersWithFreeAccess?: string[]
  elevenlabsApi?: ElevenlabsApi
  openaiApi?: OpenaiApi
  cartesiaApi?: CartesiaApi
  deepgramApi?: DeepgramApi
  resendApi?: ResendApi
  googleApi?: GoogleApi
  stripeApi?: StripeApi
  customerioApi?: CustomerioApi
  frequencyLists?: FrequencyLists
  genericLlmApi?: GenericLlmApi
  revenuecatApi?: RevenuecatApi
}

export const buildApp = ({
  stripeSubscriptionsRepository = StripeSubscriptionsRepository(),
  revenuecatSubscriptionsRepository = RevenuecatSubscriptionsRepository(),
  usersRepository = UsersRepository(),
  accessCache = MockAccessCacheService(
    StripeSubscriptionsRepository(),
    RevenuecatSubscriptionsRepository(),
    UsersRepository()
  ),
  usersWithFreeAccess = ['user.with.free.access@email.com'],
  elevenlabsApi = MockElevenlabsApi,
  openaiApi = MockOpenaiApi,
  cartesiaApi = MockCartesiaApi,
  deepgramApi = MockDeepgramApi,
  resendApi = MockResendApi,
  googleApi = MockGoogleApi,
  stripeApi = MockStripeApi,
  customerioApi = MockCustomerioApi,
  frequencyLists = mockFrequencyLists,
  genericLlmApi = MockGenericLlmApi,
  revenuecatApi = MockRevenuecatApi,
}: AppDependencies): Express => {
  const app: Express = express()

  app.use(requestContextMiddleware)

  const API_V1 = '/api/v1'
  const API_V1_OPEN = '/api/v1/open'
  const CHOOSE_NICKNAME_ROUTE = '/users/me/nickname'

  // cloudflare tunnel acts as a reverse proxy, so we need to trust the first proxy
  // in production, cloudflare also proxies the requests.
  app.set('trust proxy', 1)

  if (getConfig().shouldLogRequests) {
    app.use(morgan(':date[iso] :method :url :status :response-time ms'))
  }

  const authUsersRepository = buildAuthUsersRepository()

  const stripeService = StripeService(stripeApi, usersRepository)
  const revenuecatService = RevenuecatService(accessCache, revenuecatSubscriptionsRepository, revenuecatApi)

  const stripeWebhookService = StripeWebhookService(
    googleApi,
    stripeApi,
    customerioApi,
    stripeSubscriptionsRepository,
    accessCache,
    usersRepository
  )

  // Stripe webhooks route - should be before the json parser
  // https://docs.stripe.com/webhooks/quickstart
  // this has to match the webhooks in the dashboard: https://dashboard.stripe.com/webhooks
  app.post(
    `${API_V1}/payment/stripe-webhook`,
    express.raw({ type: 'application/json' }),
    stripeWebhookRouter(stripeWebhookService)
  )

  const bodySizeLimit = '4mb' // if you need to change this value, also change it in nginx.
  const jsonParser = express.json({ limit: bodySizeLimit })
  const urlencodedParser = express.urlencoded({ limit: bodySizeLimit })

  const shouldSkipBodyParsingForOrpc = (path: string) =>
    orpcRelativePaths.some((route) => path === `${API_V1}${route}` || path.startsWith(`${API_V1}${route}/`))

  app.use((req, res, next) => {
    if (shouldSkipBodyParsingForOrpc(req.path)) {
      next()
      return
    }

    jsonParser(req, res, next)
  })

  app.use((req, res, next) => {
    if (shouldSkipBodyParsingForOrpc(req.path)) {
      next()
      return
    }

    urlencodedParser(req, res, next)
  })

  const handledRevenuecatEventsRepository = buildHandledRevenuecatEventsRepository()

  // The RevenueCat webhook router doesn't need to be defined before the JSON parser
  app.post(
    `${API_V1}/payment/revenuecat-webhook`,
    revenuecatWebhookRouter(handledRevenuecatEventsRepository, authUsersRepository, revenuecatService)
  )

  app.use(helmet())

  app.use(
    cors({
      origin: getConfig().allowedCorsOrigins,
      credentials: true,
    })
  )

  if (getConfig().shouldRateLimit) {
    // we don't want to rate limit some routes because it's
    // used potentially hundreds of times in less than a minute
    // when the user types in the custom exercise of chooses a nickname
    const rateLimitOptions = {
      skip: (req: Request) =>
        req.path === `${API_V1}${LANGUAGE_DETECTION_ROUTE}` || req.path === `${API_V1}${CHOOSE_NICKNAME_ROUTE}`,
    }
    app.use(createRateLimitMiddleware(30, 2, rateLimitOptions))
    app.use(createRateLimitMiddleware(50, 10, rateLimitOptions))
    app.use(createRateLimitMiddleware(500, 200, rateLimitOptions))
  }

  if (getConfig().shouldSlowDownApiRoutes) {
    app.use(slowDownMiddleware)
  }

  const savedWordsRepository = SavedWordsRepository()
  const wordsRepository = WordsRepository()
  const translationExercisesRepository = TranslationExercisesRepository()
  const pronunciationExerciseRepository = PronunciationEvaluationExerciseRepository()
  const xpRepository = XpRepository()
  const userStatsService = UserStatsService(xpRepository)
  const stressExerciseService = StressExerciseService(genericLlmApi, frequencyLists)
  const translationExercisesService = TranslationExerciseService(
    genericLlmApi,
    translationExercisesRepository,
    frequencyLists
  )
  const pronunciationExerciseService = PronunciationEvaluationExerciseService(
    pronunciationExerciseRepository,
    genericLlmApi,
    frequencyLists,
    savedWordsRepository,
    deepgramApi,
    wordsRepository,
    userStatsService
  )
  const billingService = BillingService(
    usersRepository,
    stripeSubscriptionsRepository,
    revenuecatSubscriptionsRepository,
    revenuecatService
  )

  const transliterationRouter = TransliterationRouter()
  const translationRouter = TranslationRouter(genericLlmApi)
  const audioTranscriptionRouter = AudioTranscriptionRouter(deepgramApi)
  const audioGenerationService = AudioGenerationService(elevenlabsApi, openaiApi, cartesiaApi)
  const ipaTranscriptionService = IpaTranscriptionService(genericLlmApi)

  const ipaTranscriptionRouter = IpaTranscriptionRouter(ipaTranscriptionService)

  app.use(API_V1_OPEN, ipaTranscriptionRouter)

  app.use(API_V1, configRouter())
  app.use(API_V1, HealthCheckRouter())
  app.use(API_V1, SentryDebugRouter())

  app.use(frontendAuthenticationMiddleware)

  // Apply IP-based rate limiting specifically to authentication routes
  // This is done at the app level to avoid affecting other /api/v1 routes
  if (getConfig().shouldRateLimit) {
    const authRateLimitOptions = {
      skip: (req: Request) => !req.path.startsWith(`${API_V1}/authentication`),
    }
    const tenMinutes = 10 * 60
    const oneDay = 24 * 60 * 60

    app.use(createRateLimitMiddleware(30, oneDay, authRateLimitOptions))
    app.use(createRateLimitMiddleware(10, tenMinutes, authRateLimitOptions))
  }

  app.use(API_V1, authenticationRouter())
  app.use(API_V1, ContactEmailRouter(resendApi))

  app.use(tokenAuthenticationMiddleware)
  app.use(
    API_V1,
    removalsRouter(
      authUsersRepository,
      usersRepository,
      elevenlabsApi,
      customerioApi,
      stripeApi,
      stripeSubscriptionsRepository
    )
  )
  app.use(API_V1, UserRouter(customerioApi, elevenlabsApi, usersRepository, userStatsService, wordsRepository))
  app.use(API_V1, UserMarketingPreferencesRouter(customerioApi))
  app.use(API_V1, UserSettingsRouter(usersRepository))
  app.use(API_V1, ipaTranscriptionRouter)

  app.use(API_V1, BillingRouter(billingService, usersWithFreeAccess))
  app.use(API_V1, PortalSessionRouter(usersRepository, stripeApi))
  app.use(API_V1, CheckoutRouter(stripeService))

  const subscriptionMiddlewareInstance = subscriptionMiddleware(accessCache, usersWithFreeAccess)
  app.use(subscriptionMiddlewareInstance)

  app.use(API_V1, AudioRouter())
  app.use(API_V1, AudioGenerationRouter(usersRepository, audioGenerationService))
  app.use(API_V1, audioTranscriptionRouter)
  app.use(API_V1, translationRouter)
  app.use(API_V1, WordsRouter(genericLlmApi, wordsRepository))
  app.use(API_V1, LeaderboardRouter(userStatsService))
  app.use(API_V1, SavedWordsRouter(savedWordsRepository, genericLlmApi))
  app.use(API_V1, transliterationRouter)
  app.use(API_V1, PronunciationEvaluationExerciseRouter(pronunciationExerciseService))
  app.use(API_V1, StressExerciseRouter(stressExerciseService))
  app.use(API_V1, TranslationExerciseRouter(translationExercisesService))
  app.use(API_V1, LanguageDetectionRouter())

  const messagesRepository = MessagesRepository()
  const messagesService = MessagesService(messagesRepository, genericLlmApi)
  app.use(API_V1, MessagesRouter(messagesService, messagesRepository))

  const grammarCorrectionRouter = GrammarCorrectionRouter(genericLlmApi)
  app.use(API_V1, grammarCorrectionRouter)

  accessCache.initialize()

  return app
}
