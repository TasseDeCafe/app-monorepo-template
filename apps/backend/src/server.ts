import './transport/third-party/sentry/sentry-initializer'
import * as Sentry from '@sentry/node'
import { getConfig } from './config/environment-config'
import { buildApp } from './app'
import { getEnvironmentName } from './utils/environment-utils'
import { RealElevenlabsApi } from './transport/third-party/elevenlabs/elevenlabs-api'
import { RealOpenaiApi } from './transport/third-party/llms/openai/openai-api'
import { RealDeepgramApi } from './transport/third-party/deepgram/deepgram-api'
import { RealResendApi } from './transport/third-party/resend/resend-api'
import { RealGoogleApi } from './transport/third-party/google/google-api'
import { RealStripeApi } from './transport/third-party/stripe/stripe-api'
import { validateConfig } from './config/environment-config-validator'
import { frequencyLists } from './utils/frequency-list-utils'
import { RealCustomerioApi } from './transport/third-party/customerio/customerio-api'
import { RealGenericLlmApi } from './transport/third-party/llms/generic-llm/generic-llm-api'
import { RealRevenuecatApi } from './transport/third-party/revenuecat/revenuecat-api'
import { AccessCacheService } from './service/long-running/subscription-cache-service/access-cache-service'
import { StripeSubscriptionsRepository } from './transport/database/stripe-subscriptions/stripe-subscriptions-repository'
import { RevenuecatSubscriptionsRepository } from './transport/database/revenuecat-subscriptions/revenuecat-subscriptions-repository'
import { UsersRepository } from './transport/database/users/users-repository'
import { posthogClient, registerPosthogShutdownHandlers } from './transport/third-party/posthog/posthog-client'
import { setupExpressErrorHandler } from 'posthog-node'
import { RealCartesiaApi } from './transport/third-party/cartesia/cartesia-api'

console.log('The server is starting')

validateConfig(getConfig())

const startServer = async () => {
  try {
    const stripeSubscriptionsRepository = StripeSubscriptionsRepository()
    const revenueCatSubscriptionsRepository = RevenuecatSubscriptionsRepository()
    const usersRepository = UsersRepository()
    const accessCache = AccessCacheService(
      stripeSubscriptionsRepository,
      revenueCatSubscriptionsRepository,
      usersRepository
    )

    const expressApp = getConfig().shouldMockThirdParties
      ? buildApp({})
      : buildApp({
          stripeSubscriptionsRepository,
          revenuecatSubscriptionsRepository: revenueCatSubscriptionsRepository,
          accessCache,
          usersWithFreeAccess: getConfig().usersWithFreeAccess,
          elevenlabsApi: RealElevenlabsApi,
          openaiApi: RealOpenaiApi,
          cartesiaApi: RealCartesiaApi,
          deepgramApi: RealDeepgramApi,
          resendApi: RealResendApi,
          googleApi: RealGoogleApi,
          stripeApi: RealStripeApi,
          customerioApi: RealCustomerioApi,
          frequencyLists,
          genericLlmApi: RealGenericLlmApi,
          revenuecatApi: RealRevenuecatApi,
        })

    Sentry.setupExpressErrorHandler(expressApp)
    setupExpressErrorHandler(posthogClient, expressApp)

    const port = getConfig().port

    registerPosthogShutdownHandlers()

    expressApp.listen(port, () => {
      console.log(`Server started in environment: ${getEnvironmentName()}`)
      console.log(`Try it on http://localhost:${port}/api/v1/database-health-check`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer().then()
