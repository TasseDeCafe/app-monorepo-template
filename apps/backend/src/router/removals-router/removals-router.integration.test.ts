import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createOrGetUserWithOurApi,
  __createUserInSupabaseAndGetHisIdAndToken,
  __removeAllAuthUsersFromSupabase,
  __updateElevenLabsVoiceIdWithOurApi,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { buildApp } from '../../app'
import { ElevenlabsApi, MockElevenlabsApi } from '../../transport/third-party/elevenlabs/elevenlabs-api'
import { __getAllAuthUsers } from '../../transport/database/auth-users/auth-users-repository'
import {
  __DbRemoval,
  __deleteRemovals,
  __selectAllRemovals,
} from '../../transport/database/removals/removals-repository'
import { __getAllUsers, DbUser } from '../../transport/database/users/users-repository'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'
import { MockCustomerioApi } from '../../transport/third-party/customerio/customerio-api'
import { MockStripeApi } from '../../transport/third-party/stripe/stripe-api'
import { __simulateStripeEvent } from '../../test/stripe/stripe-test-utils'
import { __createStripeSubscriptionDeletedEvent } from '../../test/stripe/test-stripe-events'

describe('removals-router', () => {
  const testApp = buildApp({})

  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
    await __deleteRemovals()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
    await __deleteRemovals()
  })

  test('when user is unauthenticated', async () => {
    const removalResponse = await request(testApp)
      .post('/api/v1/removals')
      .send({ type: 'account' })
      .set({ Authorization: `Bearer wrong-token` })

    expect(removalResponse.status).toBe(401)
  })

  test('when asking for a wrong type of removal', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const createResponse = await request(testApp)
      .post('/api/v1/removals')
      .send({ type: 'wrong type' })
      .set(buildAuthorizationHeaders(token))

    expect(createResponse.status).toBe(400)
  })

  test('when user does not exist', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const removalResponse = await request(testApp)
      .post('/api/v1/removals')
      .send({ type: 'account' })
      .set(buildAuthorizationHeaders(token))

    expect(removalResponse.status).toBe(404)
    expect(removalResponse.body.data.errors[0].message).toBe('User not found')
  })

  describe('removing a voice', () => {
    test('when user has no elevenlabsVoiceId elevenlabs api should not be called', async () => {
      const elevenLabsApi: ElevenlabsApi = {
        ...MockElevenlabsApi,
        deleteVoice: async () => {
          throw new Error('deleteVoice should not be called')
        },
      }
      const testApp = buildApp({ elevenlabsApi: elevenLabsApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken('some@email.com')
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      const removalResponse = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'voice' })
        .set(buildAuthorizationHeaders(token))
      const authUsers = await __getAllAuthUsers()
      const removals: __DbRemoval[] = await __selectAllRemovals()
      expect(removalResponse.status).toBe(404)
      expect(authUsers).toHaveLength(1)
      expect(removals).toHaveLength(0)
    })

    test('when elevenlabs delete call fails the removal should be marked as failed', async () => {
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => {
              return false
            },
          },
        },
      })
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      await __updateElevenLabsVoiceIdWithOurApi(testApp, token)
      const removalResponse = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'voice' })
        .set(buildAuthorizationHeaders(token))
      const authUsers = await __getAllAuthUsers()
      const users: DbUser[] = await __getAllUsers()
      const removals: __DbRemoval[] = await __selectAllRemovals()
      expect(removalResponse.status).toBe(500)
      expect(authUsers).toHaveLength(1)
      expect(users).toHaveLength(1)
      expect(removals).toHaveLength(1)
      expect(removals[0].type).toBe('voice')
      expect(removals[0].was_successful).toBe(false)
      expect(removals[0].email).toBe('some@email.com')
      expect(removals[0].elevenlabs_voice_id).toBe('1234')
    })

    test('happy path', async () => {
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => {
              return true
            },
          },
        },
        email: 'some@email.com',
      })

      const removalResponse = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'voice' })
        .set(buildAuthorizationHeaders(token))
      const authUsers = await __getAllAuthUsers()
      const users = await __getAllUsers()
      const removals: __DbRemoval[] = await __selectAllRemovals()
      expect(removalResponse.status).toBe(200)
      expect(users).toHaveLength(1)
      expect(users[0].elevenlabs_voice_id).toBe(null)
      expect(authUsers).toHaveLength(1)
      expect(removals).toHaveLength(1)
      expect(removals[0].type).toBe('voice')
      expect(removals[0].was_successful).toBe(true)
      expect(removals[0].email).toBe('some@email.com')
      expect(removals[0].elevenlabs_voice_id).toBe('1234')
    })

    test('should update customer when voice is removed', async () => {
      let updateCustomerWasCalled = false
      const customerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async () => {
          updateCustomerWasCalled = true
          return true
        },
      }
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => true,
          },
          customerioApi,
        },
        email: 'some@email.com',
      })

      await request(testApp).post('/api/v1/removals').send({ type: 'voice' }).set(buildAuthorizationHeaders(token))

      expect(updateCustomerWasCalled).toBe(true)
    })

    test('should still succeed if customerio update fails', async () => {
      const customerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async () => false,
      }
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => true,
          },
          customerioApi,
        },
        email: 'some@email.com',
      })

      const response = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'voice' })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
    })
  })

  describe('removing an account', () => {
    test('happy path when user has NO elevenlabsVoiceId', async () => {
      const elevenLabsApi: ElevenlabsApi = {
        ...MockElevenlabsApi,
        cloneVoice: async () => ({
          status: 'success',
          voice: {
            voice_id: '1234',
          },
        }),
        deleteVoice: async () => {
          throw new Error('deleteVoice should not be called')
        },
      }
      const testApp = buildApp({ elevenlabsApi: elevenLabsApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken('some@email.com')
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      const removalResponse = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'account' })
        .set(buildAuthorizationHeaders(token))
      const authUsers = await __getAllAuthUsers()
      const removals: __DbRemoval[] = await __selectAllRemovals()
      expect(removalResponse.status).toBe(200)
      expect(authUsers).toHaveLength(0)
      expect(removals).toHaveLength(1)
      expect(removals[0].type).toBe('account')
      expect(removals[0].was_successful).toBe(true)
      expect(removals[0].email).toBe('some@email.com')
      expect(removals[0].elevenlabs_voice_id).toBe(null)
    })

    test('happy path when user has elevenlabsVoiceId', async () => {
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => {
              return true
            },
          },
        },
        email: 'some@email.com',
      })
      const removalResponse = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'account' })
        .set(buildAuthorizationHeaders(token))
      const authUsers = await __getAllAuthUsers()
      const removals: __DbRemoval[] = await __selectAllRemovals()
      expect(removalResponse.status).toBe(200)
      expect(authUsers).toHaveLength(0)
      expect(removals).toHaveLength(1)
      expect(removals[0].type).toBe('account')
      expect(removals[0].was_successful).toBe(true)
      expect(removals[0].email).toBe('some@email.com')
      expect(removals[0].elevenlabs_voice_id).toBe('1234')
    })

    test('when elevenlabs delete call fails the removal should be marked as failed', async () => {
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => {
              return false
            },
          },
        },
        email: 'some@email.com',
      })
      const removalResponse = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'account' })
        .set(buildAuthorizationHeaders(token))
      const authUsers = await __getAllAuthUsers()
      const removals: __DbRemoval[] = await __selectAllRemovals()
      expect(removalResponse.status).toBe(500)
      expect(authUsers).toHaveLength(1)
      expect(removals).toHaveLength(1)
      expect(removals[0].type).toBe('account')
      expect(removals[0].was_successful).toBe(false)
      expect(removals[0].email).toBe('some@email.com')
      expect(removals[0].elevenlabs_voice_id).toBe('1234')
    })

    test('should destroy customer when account is removed', async () => {
      let destroyCustomerWasCalled = false
      const customerioApi = {
        ...MockCustomerioApi,
        destroyCustomer: async () => {
          destroyCustomerWasCalled = true
          return true
        },
      }
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => true,
          },
          customerioApi,
        },
        email: 'some@email.com',
      })

      await request(testApp).post('/api/v1/removals').send({ type: 'account' }).set(buildAuthorizationHeaders(token))

      expect(destroyCustomerWasCalled).toBe(true)
    })

    test('should not destroy customer when voice is removed', async () => {
      let destroyCustomerWasCalled = false
      const customerioApi = {
        ...MockCustomerioApi,
        destroyCustomer: async () => {
          destroyCustomerWasCalled = true
          return true
        },
      }
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => true,
          },
          customerioApi,
        },
        email: 'some@email.com',
      })

      await request(testApp).post('/api/v1/removals').send({ type: 'voice' }).set(buildAuthorizationHeaders(token))

      expect(destroyCustomerWasCalled).toBe(false)
    })

    test('should fail if customerio destroy fails', async () => {
      const customerioApi = {
        ...MockCustomerioApi,
        destroyCustomer: async () => false,
      }
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: {
            ...MockElevenlabsApi,
            cloneVoice: async () => ({
              status: 'success',
              voice: {
                voice_id: '1234',
              },
            }),
            deleteVoice: async () => true,
          },
          customerioApi,
        },
        email: 'some@email.com',
      })

      const response = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'account' })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(500)
      expect(response.body.data.errors[0].message).toBe('account removal did not fully succeed')
      expect(response.body.data.errors[0].code).toBe('2060')
    })

    test('should cancel active subscription when account is removed', async () => {
      let cancelSubscriptionWasCalled = false
      const stripeApi = {
        ...MockStripeApi,
        cancelSubscription: async () => {
          cancelSubscriptionWasCalled = true
          return true
        },
      }
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: MockElevenlabsApi,
          stripeApi,
        },
        email: 'some@email.com',
      })

      const response = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'account' })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      expect(cancelSubscriptionWasCalled).toBe(true)
    })

    test('should not try to sync the stripe subscription if the user removed his account', async () => {
      let cancelSubscriptionWasCalled = false
      const stripeApi = {
        ...MockStripeApi,
        cancelSubscription: async () => {
          cancelSubscriptionWasCalled = true
          return true
        },
      }
      const stripeCustomerId = 'some_stripe_customer_id'
      const {
        testApp,
        token,
        stripeCallsCounters,
        id: userId,
      } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        stripeCustomerId,
        appDependencies: {
          elevenlabsApi: MockElevenlabsApi,
          stripeApi,
        },
        email: 'some@email.com',
      })

      const response = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'account' })
        .set(buildAuthorizationHeaders(token))

      await __simulateStripeEvent(testApp, __createStripeSubscriptionDeletedEvent({ stripeCustomerId, userId }))

      expect(response.status).toBe(200)
      expect(stripeCallsCounters.retrieveSubscriptionCallCount).toBe(1)
      expect(cancelSubscriptionWasCalled).toBe(true)
    })

    test('should fail account removal if subscription cancellation fails', async () => {
      const stripeApi = {
        ...MockStripeApi,
        cancelSubscription: async () => false,
      }
      const { testApp, token } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: MockElevenlabsApi,
          stripeApi,
        },
        email: 'some@email.com',
      })

      const response = await request(testApp)
        .post('/api/v1/removals')
        .send({ type: 'account' })
        .set(buildAuthorizationHeaders(token))

      const authUsers = await __getAllAuthUsers()
      const removals: __DbRemoval[] = await __selectAllRemovals()

      expect(response.status).toBe(500)
      expect(response.body.data.errors[0].code).toBe('2040')
      expect(authUsers).toHaveLength(1) // User should still exist
      expect(removals[0].was_successful).toBe(false)
    })
  })
})
