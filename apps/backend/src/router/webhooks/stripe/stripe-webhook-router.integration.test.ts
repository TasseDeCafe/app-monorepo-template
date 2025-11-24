import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { buildApp } from '../../../app'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
} from '../../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../../transport/database/webhook-events/handled-stripe-events-repository'
import { __simulateStripeEvent } from '../../../test/stripe/stripe-test-utils'
import {
  __createStripeChargeRefundedEvent,
  __createStripeSubscriptionCreatedEvent,
  __createStripeSubscriptionDeletedEvent,
} from '../../../test/stripe/test-stripe-events'
import { CustomerioApi, MockCustomerioApi } from '../../../transport/third-party/customerio/customerio-api'
import { CustomerioUser } from '../../../transport/third-party/customerio/types'

describe('webhooks-router', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  describe('simple failures', () => {
    it('should return 400 for invalid signature', async () => {
      const testApp = buildApp({})
      const stripeCustomerId = 'some_stripe_customer_id'
      const event = __simulateStripeEvent(
        testApp,
        __createStripeChargeRefundedEvent({
          stripeCustomerId,
        })
      )
      const payload = JSON.stringify(event)

      const response = await request(testApp)
        .post('/api/v1/payment/stripe-webhook')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', 'invalid_signature')
        .send(payload)

      expect(response.status).toBe(400)
    })

    it('should return 400 for unsupported event type', async () => {
      const testApp = buildApp({})
      const stripeCustomerId = 'some_stripe_customer_id'
      const event = __createStripeChargeRefundedEvent({ stripeCustomerId })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event.type = 'some.unsupported.event.type' as any
      const response = await __simulateStripeEvent(testApp, event)
      expect(response.status).toBe(400)
    })

    //todo google api: remove this test if we get rid of the google spreadsheet api
    // it('should process the same event only once when sent sequentially', async () => {
    //   let googleApiCallCount = 0
    //   const googleApi: GoogleApi = {
    //     ...MockGoogleApi,
    //     insertChargeRefundedGoogleSheets: async () => {
    //       await new Promise((resolve) => setTimeout(resolve, 200))
    //       googleApiCallCount++
    //     },
    //   }
    //   const stripeCustomerId = 'test_customer_id'
    //   const { testApp, stripeCallsCounters } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding(
    //     {
    //       appDependencies: { googleApi },
    //       stripeCustomerId,
    //       stripeSubscriptionId: 'some_subscription_id',
    //       referral: 'tiengos3',
    //     }
    //   )
    //
    //   // Now you can assert on stripe calls if needed
    //   expect(stripeCallsCounters.createCustomerWithMetadataCallCount).toBe(1)
    //   const refundEvent = __createStripeChargeRefundedEvent({
    //     stripeCustomerId,
    //   })
    //
    //   const response1 = await __simulateStripeEvent(testApp, refundEvent)
    //   const response2 = await __simulateStripeEvent(testApp, refundEvent)
    //   expect(response1.status).toBe(200)
    //   expect(response2.status).toBe(200)
    //   expect(googleApiCallCount).toBe(1)
    // })

    //todo google api: remove this test if we get rid of the google spreadsheet api
    // it('should process the same event only once when sent twice in parallel', async () => {
    //   let googleApiCallCount = 0
    //   const googleApi: GoogleApi = {
    //     ...MockGoogleApi,
    //     insertChargeRefundedGoogleSheets: async () => {
    //       await new Promise((resolve) => setTimeout(resolve, 200))
    //       googleApiCallCount++
    //     },
    //   }
    //   const stripeCustomerId = 'test_customer_id'
    //   const { testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
    //     appDependencies: { googleApi },
    //     stripeCustomerId,
    //     stripeSubscriptionId: 'some_subscription_id',
    //     referral: 'tiengos3',
    //   })
    //
    //   const refundEvent = __createStripeChargeRefundedEvent({
    //     stripeCustomerId,
    //   })
    //
    //   const [response1, response2] = await Promise.all([
    //     __simulateStripeEvent(testApp, refundEvent),
    //     __simulateStripeEvent(testApp, refundEvent),
    //   ])
    //   expect(response1.status).toBe(200)
    //   expect(response2.status).toBe(200)
    //   expect(googleApiCallCount).toBe(1)
    // })
  })

  // describe('charge.refunded', () => {
  //todo google api: remove this test if we get rid of the google spreadsheet api
  // it('should not insert a row for a charge refunded without a referral', async () => {
  //   let wasCalled = false
  //   const googleApi: GoogleApi = {
  //     ...MockGoogleApi,
  //     insertChargeRefundedGoogleSheets: async () => {
  //       wasCalled = true
  //     },
  //   }
  //   const stripeCustomerId = 'some_stripe_customer_id'
  //   const stripeSubscriptionId = 'someSubscriptionId'
  //   const { testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
  //     appDependencies: { googleApi },
  //     stripeCustomerId,
  //     stripeSubscriptionId,
  //   })
  //   const response: request.Response = await __simulateStripeEvent(
  //     testApp,
  //     __createStripeChargeRefundedEvent({
  //       stripeCustomerId,
  //       referral: undefined,
  //     })
  //   )
  //   expect(response.status).toBe(200)
  //   expect(wasCalled).toBe(false)
  // })
  // it('should insert a row for a charge refunded with a referral', async () => {
  //   let wasCalled = false
  //   const googleApi: GoogleApi = {
  //     ...MockGoogleApi,
  //     insertChargeRefundedGoogleSheets: async () => {
  //       wasCalled = true
  //     },
  //   }
  //   const stripeCustomerId = 'some_stripe_customer_id'
  //   const stripeSubscriptionId = 'someSubscriptionId'
  //   const { testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
  //     appDependencies: { googleApi },
  //     stripeCustomerId,
  //     stripeSubscriptionId,
  //     referral: 'tiengos3',
  //   })
  //   const response: request.Response = await __simulateStripeEvent(
  //     testApp,
  //     __createStripeChargeRefundedEvent({
  //       stripeCustomerId,
  //     })
  //   )
  //   expect(response.status).toBe(200)
  //   expect(wasCalled).toBe(true)
  // })
  // })
  // describe('invoice.payment_succeeded', () => {
  //todo google api: remove this test if we get rid of the google spreadsheet api
  // it('should insert a row for an invoice payment succeeded with a referral', async () => {
  //   let wasCalled = false
  //   const googleApi: GoogleApi = {
  //     ...MockGoogleApi,
  //     insertInvoicePaymentSucceededGoogleSheets: async () => {
  //       wasCalled = true
  //     },
  //   }
  //   const stripeCustomerId = 'some_stripe_customer_id'
  //   const stripeSubscriptionId = 'someSubscriptionId'
  //   const { testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
  //     appDependencies: { googleApi },
  //     stripeCustomerId,
  //     stripeSubscriptionId,
  //     referral: 'tiengos3',
  //   })
  //   const response: request.Response = await __simulateStripeEvent(
  //     testApp,
  //     __createStripePaymentSucceededEvent({
  //       stripeCustomerId,
  //       referral: 'tiengos3',
  //       stripeSubscriptionId,
  //     })
  //   )
  //   expect(response.status).toBe(200)
  //   expect(wasCalled).toBe(true)
  // })
  // it('should not insert a row for a charge refunded without a referral', async () => {
  //   let wasCalled = false
  //   const googleApi: GoogleApi = {
  //     ...MockGoogleApi,
  //     insertChargeRefundedGoogleSheets: async () => {
  //       wasCalled = true
  //     },
  //   }
  //   const stripeCustomerId = 'some_stripe_customer_id'
  //   const stripeSubscriptionId = 'someSubscriptionId'
  //   const { testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
  //     appDependencies: { googleApi },
  //     stripeCustomerId,
  //     stripeSubscriptionId,
  //   })
  //   const response: request.Response = await __simulateStripeEvent(
  //     testApp,
  //     __createStripePaymentSucceededEvent({
  //       stripeCustomerId,
  //       referral: undefined,
  //       stripeSubscriptionId,
  //     })
  //   )
  //   expect(response.status).toBe(200)
  //   expect(wasCalled).toBe(false)
  // })
  // it('should not insert a row for an invoice payment succeeded with an amount paid of 0', async () => {
  //   let wasCalled = false
  //   const googleApi: GoogleApi = {
  //     ...MockGoogleApi,
  //     insertInvoicePaymentSucceededGoogleSheets: async () => {
  //       wasCalled = true
  //     },
  //   }
  //   const stripeCustomerId = 'some_stripe_customer_id'
  //   const stripeSubscriptionId = 'someSubscriptionId'
  //   const { testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
  //     appDependencies: { googleApi },
  //     stripeCustomerId,
  //     stripeSubscriptionId,
  //   })
  //   const response: request.Response = await __simulateStripeEvent(
  //     testApp,
  //     __createStripePaymentSucceededEvent({
  //       stripeCustomerId,
  //       referral: 'tiengos3',
  //       stripeSubscriptionId,
  //     })
  //   )
  //   expect(response.status).toBe(200)
  //   expect(wasCalled).toBe(true)
  // })
  // })

  describe('customer.subscription.deleted', () => {
    it('should update customerio', async () => {
      let wasCustomerIoCalled = false
      let currentPlan: string | null | undefined = null
      let currentPlanInterval: string | null | undefined = null
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async (userId: string, data: Partial<CustomerioUser>) => {
          currentPlan = data.current_plan
          currentPlanInterval = data.current_plan_interval
          wasCustomerIoCalled = true
          return true
        },
      }
      const stripeCustomerId = 'some_stripe_customer_id'
      const stripeSubscriptionId = 'someSubscriptionId'
      const { id: userId, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: { customerioApi },
        stripeCustomerId,
        stripeSubscriptionId,
      })
      const response: request.Response = await __simulateStripeEvent(
        testApp,
        __createStripeSubscriptionCreatedEvent({
          stripeCustomerId,
          userId,
          subscriptionId: stripeSubscriptionId,
        })
      )
      expect(response.status).toBe(200)
      expect(wasCustomerIoCalled).toBe(true)
      expect(currentPlan).toBe('premium')
      expect(currentPlanInterval).toBe('month')
    })

    //todo google api: remove commented code if we get rid of the google spreadsheet api
    it('should insert a row for a subscription created with a referral, should update customerio', async () => {
      let wasCustomerIoCalled = false
      // let wasGoogleApiCalled = false
      let currentPlan: string | null | undefined = null
      let currentPlanInterval: string | null | undefined = null
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,

        updateCustomer: async (userId: string, data: Partial<CustomerioUser>) => {
          currentPlan = data.current_plan
          currentPlanInterval = data.current_plan_interval
          wasCustomerIoCalled = true
          return true
        },
      }
      // const googleApi: GoogleApi = {
      //   ...MockGoogleApi,
      //   insertCustomerCreateSubscriptionGoogleSheets: async () => {
      //     wasGoogleApiCalled = true
      //   },
      // }
      const stripeCustomerId = 'some_stripe_customer_id'
      const stripeSubscriptionId = 'someSubscriptionId'
      const { id: userId, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: { customerioApi },
        stripeCustomerId,
        stripeSubscriptionId,
      })
      const response: request.Response = await __simulateStripeEvent(
        testApp,
        __createStripeSubscriptionCreatedEvent({
          stripeCustomerId,
          userId,
          subscriptionId: stripeSubscriptionId,
          referral: 'tiengos3',
        })
      )
      expect(response.status).toBe(200)
      // expect(wasGoogleApiCalled).toBe(true)
      expect(wasCustomerIoCalled).toBe(true)
      expect(currentPlan).toBe('premium')
      expect(currentPlanInterval).toBe('month')
    })
  })

  describe('customer.subscription.deleted', () => {
    it('should delete current_plan and current_plan_interval from customerio', async () => {
      let wasCustomerIoCalled = false
      let currentPlan: string | null | undefined = null
      let currentPlanInterval: string | null | undefined = null
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async (userId: string, data: Partial<CustomerioUser>) => {
          currentPlan = data.current_plan
          currentPlanInterval = data.current_plan_interval
          wasCustomerIoCalled = true
          return true
        },
      }
      const stripeCustomerId = 'some_stripe_customer_id'
      const stripeSubscriptionId = 'someSubscriptionId'
      const { id: userId, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: { customerioApi },
        stripeCustomerId,
        stripeSubscriptionId,
      })
      const response: request.Response = await __simulateStripeEvent(
        testApp,
        __createStripeSubscriptionDeletedEvent({
          stripeCustomerId,
          userId,
        })
      )
      expect(response.status).toBe(200)
      expect(wasCustomerIoCalled).toBe(true)
      expect(currentPlan).toBe(null)
      expect(currentPlanInterval).toBe(null)
    })
  })
})
