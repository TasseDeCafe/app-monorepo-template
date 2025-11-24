import jwt from 'jsonwebtoken'
import { getConfig } from '../config/environment-config'
import { SupabaseClaims } from '../middleware/authentication-middleware/token-authentication-middleware/token-authentication-middleware'
import { getSupabase } from '../transport/database/supabase'
import { Express } from 'express'
import request from 'supertest'
import fs from 'fs'
import { AppDependencies, buildApp } from '../app'
import { MockStripeApi, StripeApi } from '../transport/third-party/stripe/stripe-api'
import {
  NUMBER_OF_DAYS_IN_FREE_TRIAL,
  PlanInterval,
  SUPPORTED_STRIPE_CURRENCY,
} from '@yourbestaccent/core/constants/pricing-constants'
import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND } from '@yourbestaccent/api-client/key-generation/frontend-api-key-constants'
import { generateFrontendApiKey } from '@yourbestaccent/api-client/key-generation/frontend-api-key-generator'
import { __simulateStripeSubscriptionCreatedEvent } from './stripe/stripe-test-utils'
import { DbInterval } from '../transport/database/stripe-subscriptions/stripe-subscriptions-repository'

const id1 = '0330e333-8d3a-4cfd-92c5-f8baf67eb8b5'
const name1 = 'John'
const fullName1 = 'Doe'
const email1 = 'john@gmail.com'
const avatarUrl1 = 'https://www.example.com/john-doe.png'
const supabaseClaims1: SupabaseClaims = {
  sub: id1,
  user_metadata: {
    name: name1,
    full_name: fullName1,
    email: email1,
    avatar_url: avatarUrl1,
  },
}

export const __getSupabaseTokenWithIdAndEmail = (id: string, email: string) => {
  const supabaseClaims: SupabaseClaims = {
    sub: id,
    user_metadata: {
      name: 'John',
      full_name: 'Doe',
      email: email,
      avatar_url: 'https://www.example.com/john-doe.png',
    },
  }
  return jwt.sign(supabaseClaims, getConfig().supabaseJwtSecret, {
    expiresIn: '1h',
  })
}

export const __removeAllAuthUsersFromSupabase = async () => {
  const {
    data: { users },
    error,
  } = await getSupabase().auth.admin.listUsers()
  if (error) {
    console.error(error)
    return
  } else {
    for (const user of users) {
      await getSupabase().auth.signOut()
      await getSupabase().auth.admin.deleteUser(user.id)
    }
  }
}

export type IdAndToken = {
  id: string
  token: string
}

interface StripeCallCounts {
  createCustomerWithMetadataCallCount: number
  listSubscriptionsCallCount: number
  retrieveSubscriptionCallCount: number
}

export type InitialState = {
  id: string
  token: string
  testApp: Express
  stripeCallsCounters: StripeCallCounts
}

export const __createUserInSupabaseAndGetHisIdAndToken = async (email?: string): Promise<IdAndToken> => {
  const userEmail: string = email || supabaseClaims1.user_metadata.email
  const { data, error } = await getSupabase().auth.admin.createUser({
    email: userEmail,
    password: 'password',
    user_metadata: { name: 'Yoda' },
  })
  if (error) {
    throw new Error('Failed to create user in supabase: ' + error.message)
  }
  const id = data?.user?.id || ''
  const supabaseToken = __getSupabaseTokenWithIdAndEmail(id, userEmail)
  return {
    id,
    token: supabaseToken,
  }
}

export const __generateUniqueId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

export const buildAuthorizationHeaderForOpenApi = () => ({
  [NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND]: generateFrontendApiKey(Date.now(), 0),
})

export const buildAuthorizationHeaders = (token: string) => ({
  [NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND]: generateFrontendApiKey(Date.now(), 0),
  Authorization: `Bearer ${token}`,
})

export type CreateOrGetUserParams = {
  testApp: Express
  token: string
  referral: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmTerm?: string | null
  utmContent?: string | null
}

export const __createOrGetUserWithOurApi = async ({
  testApp,
  token,
  referral,
  utmSource = null,
  utmMedium = null,
  utmCampaign = null,
  utmTerm = null,
  utmContent = null,
}: CreateOrGetUserParams): Promise<request.Response> => {
  return await request(testApp)
    .put('/api/v1/users/me')
    .set(buildAuthorizationHeaders(token))
    .send({ referral, utmSource, utmMedium, utmCampaign, utmTerm, utmContent })
}

export const __callCheckoutEndpoint = async (testApp: Express, token: string): Promise<request.Response> => {
  return await request(testApp)
    .post('/api/v1/payment/create-checkout-session')
    .set(buildAuthorizationHeaders(token))
    .send({
      successPathAndHash: 'someCheckoutSessionSuccessPathAndHash',
      cancelPathAndHash: 'someCheckoutSessionCancelPathAndHash',
      planInterval: 'month',
      currency: SUPPORTED_STRIPE_CURRENCY.EUR,
    })
}

export const __updateMotherLanguageWithOurApi = async (
  testApp: Express,
  token: string,
  motherLanguage?: LangCode
): Promise<request.Response> => {
  return await request(testApp)
    .patch('/api/v1/users/me/mother_language')
    .set(buildAuthorizationHeaders(token))
    .send({ motherLanguage: motherLanguage || LangCode.ENGLISH })
}

export const __updateStudyLanguageWithOurApi = async (
  testApp: Express,
  token: string,
  studyLanguage?: SupportedStudyLanguage
): Promise<request.Response> => {
  return await request(testApp)
    .patch('/api/v1/users/me/study_language')
    .set(buildAuthorizationHeaders(token))
    .send({ studyLanguage: studyLanguage || LangCode.POLISH })
}

export const __updateElevenLabsVoiceIdWithOurApi = async (testApp: Express, token: string) => {
  const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')
  await request(testApp)
    .patch(`/api/v1/users/me`)
    .field({ langCode: LangCode.ENGLISH })
    .set(buildAuthorizationHeaders(token))
    .attach('audio', audioBuffer, {
      filename: 'some name to make upload work',
    })
}

export const __createCheckoutSessionWithOurApi = async (
  testApp: Express,
  token: string,
  successPathAndHash: string = 'some_return_path_and_hash',
  cancelPathAndHash: string = 'some_cancel_path_and_hash',
  planInterval: PlanInterval = 'month',
  currency: SUPPORTED_STRIPE_CURRENCY = SUPPORTED_STRIPE_CURRENCY.EUR
): Promise<request.Response> => {
  return await request(testApp)
    .post('/api/v1/payment/create-checkout-session')
    .set(buildAuthorizationHeaders(token))
    .send({
      successPathAndHash: successPathAndHash,
      cancelPathAndHash: cancelPathAndHash,
      planInterval: planInterval,
      currency,
    })
}

export const __createUserRightAfterSignup = async ({
  appDependencies = {},
}: { appDependencies?: AppDependencies } = {}): Promise<InitialState> => {
  const email: string = 'some@email.com'
  const { token, id: userId } = await __createUserInSupabaseAndGetHisIdAndToken(email)

  const testApp = buildApp(appDependencies)

  await __createOrGetUserWithOurApi({
    testApp,
    token,
    referral: null,
  })

  return {
    token,
    id: userId,
    testApp,
    stripeCallsCounters: {
      createCustomerWithMetadataCallCount: 0,
      listSubscriptionsCallCount: 0,
      retrieveSubscriptionCallCount: 0,
    },
  }
}

export type InitialStateWithNUsers = {
  users: {
    id: string
    token: string
  }[]
  testApp: Express
}
export const __createNUsersWithInitialStateIntroducingCreditCardAfterOnboarding = async (
  numberOfUsers: number
): Promise<InitialStateWithNUsers> => {
  const idAndTokens = await Promise.all(
    Array.from({ length: numberOfUsers }, (_, index) =>
      __createUserInSupabaseAndGetHisIdAndToken(`user${index + 1}@email.com`)
    )
  )

  const stripeCustomerIds = Object.fromEntries(idAndTokens.map((user, index) => [user.id, `cus_test_id${index + 1}`]))
  const customerToSubscriptionId = Object.fromEntries(
    Object.values(stripeCustomerIds).map((customerId, index) => [customerId, `sub_trial_subscription_id_${index + 1}`])
  )

  const partialStripeMock: Partial<StripeApi> = {
    createCustomerWithMetadata: async (userId: string) => {
      return stripeCustomerIds[userId]
    },
    listAllSubscriptions: async (customerId: string) => {
      const subscriptionId = customerToSubscriptionId[customerId]
      return subscriptionId
        ? [
            {
              id: subscriptionId,
              status: 'trialing',
              trial_end: Math.floor(Date.now() / 1000) + 3600 * 24 * NUMBER_OF_DAYS_IN_FREE_TRIAL,
              created: Math.floor(Date.now() / 1000),
            },
          ]
        : []
    },
    retrieveSubscription: async (subscriptionId: string) => {
      // Extract user ID from subscription ID format "sub_trial_subscription_id_userIndex"
      const userIndex = parseInt(subscriptionId.split('_').pop() || '1') - 1
      const userId = idAndTokens[userIndex]?.id

      return {
        id: subscriptionId,
        status: 'trialing',
        current_period_end: Math.floor(Date.now() / 1000) + 3600 * 24 * NUMBER_OF_DAYS_IN_FREE_TRIAL,
        cancel_at_period_end: true,
        trial_end: Math.floor(Date.now() / 1000) + 3600 * 24 * NUMBER_OF_DAYS_IN_FREE_TRIAL,
        items: {
          data: [
            {
              price: {
                product: 'free_trial_product_id',
              },
              plan: {
                interval: 'month' as DbInterval,
                interval_count: 1,
                amount: 1900,
                currency: 'eur',
              },
            },
          ],
        },
        metadata: {
          user_id: userId,
        },
      }
    },
  }

  const stripeApi = {
    ...MockStripeApi,
    ...partialStripeMock,
  }

  const testApp = buildApp({ stripeApi })

  await Promise.all(
    idAndTokens.map(async (idAndToken: IdAndToken) => {
      // todo stripe v2: try to use a method that already exists for the below calls
      await __createOrGetUserWithOurApi({
        testApp,
        token: idAndToken.token,
        referral: null,
      })
      await __callCheckoutEndpoint(testApp, idAndToken.token)
      await __simulateStripeSubscriptionCreatedEvent({
        testApp,
        stripeCustomerId: stripeCustomerIds[idAndToken.id],
        userId: idAndToken.id,
      })
      await __updateMotherLanguageWithOurApi(testApp, idAndToken.token)
      await __updateStudyLanguageWithOurApi(testApp, idAndToken.token)
      await __updateElevenLabsVoiceIdWithOurApi(testApp, idAndToken.token)
    })
  )

  return {
    users: idAndTokens.map((user) => ({
      id: user.id,
      token: user.token,
    })),
    testApp,
  }
}
export const __createDefaultInitialStateAfterIntroducingCreditCardAndOnboardingWithoutVoiceId = async ({
  appDependencies = {},
  email = 'some@email.com',
  stripeCustomerId = 'cus_Rv3go1W4a0TUav_some@email.com',
  stripeSubscriptionId = 'sub_someSubscriptionId',
  referral = null,
}: {
  appDependencies?: AppDependencies
  email?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  referral?: string | null
}) => {
  const { token, id: userId } = await __createUserInSupabaseAndGetHisIdAndToken(email)
  const stripeCallsCounters: StripeCallCounts = {
    createCustomerWithMetadataCallCount: 0,
    listSubscriptionsCallCount: 0,
    retrieveSubscriptionCallCount: 0,
  }

  const partialStripeMock: Partial<StripeApi> = {
    // used by the checkout endpoint
    createCustomerWithMetadata: async () => {
      stripeCallsCounters.createCustomerWithMetadataCallCount++
      return stripeCustomerId
    },
    // used by subscription sync
    listAllSubscriptions: async () => {
      stripeCallsCounters.listSubscriptionsCallCount++
      return [
        {
          id: 'sub_1R1DZQLbp4V2G8e2tQpITnDk',
          status: 'trialing',
          trial_end: 1679798400,
          created: 1679798400,
        },
      ]
    },
    retrieveSubscription: async () => {
      stripeCallsCounters.retrieveSubscriptionCallCount++
      return {
        id: stripeSubscriptionId,
        status: 'trialing',
        current_period_end: Math.floor(Date.now() / 1000) + 3600 * 24 * NUMBER_OF_DAYS_IN_FREE_TRIAL,
        cancel_at_period_end: true,
        trial_end: Math.floor(Date.now() / 1000) + 3600 * 24 * NUMBER_OF_DAYS_IN_FREE_TRIAL,
        items: {
          data: [
            {
              price: {
                product: 'free_trial_product_id',
              },
              plan: {
                interval: 'month' as DbInterval,
                interval_count: 1,
                amount: 1900,
                currency: 'eur',
              },
            },
          ],
        },
        metadata: {
          user_id: userId,
        },
      }
    },
  }

  const mergedAppDependencies = {
    ...appDependencies,
    stripeApi: {
      ...MockStripeApi,
      ...(appDependencies.stripeApi ?? {}),
      ...partialStripeMock,
    },
  }

  const testApp = buildApp(mergedAppDependencies)
  await __createOrGetUserWithOurApi({
    testApp,
    token,
    referral,
  })
  // before this call, our user still does not have a stripe customer id
  await __callCheckoutEndpoint(testApp, token)
  await __simulateStripeSubscriptionCreatedEvent({ testApp, stripeCustomerId, userId })
  await __updateMotherLanguageWithOurApi(testApp, token)
  await __updateStudyLanguageWithOurApi(testApp, token)
  return { token, id: userId, testApp, stripeCallsCounters }
}
export const __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding = async ({
  appDependencies = {},
  email,
  stripeCustomerId,
  stripeSubscriptionId,
  referral = null,
}: {
  appDependencies?: AppDependencies
  email?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  referral?: string | null
}): Promise<InitialState> => {
  const {
    token,
    id: userId,
    testApp,
    stripeCallsCounters,
  } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboardingWithoutVoiceId({
    appDependencies,
    email,
    stripeCustomerId,
    stripeSubscriptionId,
    referral,
  })
  await __updateElevenLabsVoiceIdWithOurApi(testApp, token)
  return { token, id: userId, testApp, stripeCallsCounters }
}

// todo revenuecat
// add:
// create default initial state before introducing payment details
// create default initial state after introducing revenuecat payment details
