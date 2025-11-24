import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import {
  __createOrGetUserWithOurApi,
  __createUserInSupabaseAndGetHisIdAndToken,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../../test/test-utils'
import { buildApp } from '../../../app'
import { __deleteAllHandledStripeEvents } from '../../../transport/database/webhook-events/handled-stripe-events-repository'
import { Express } from 'express'
import { CustomerioApi, MockCustomerioApi } from '../../../transport/third-party/customerio/customerio-api'

const getMarketingPreferences = async (
  app: Express,
  token: string
): Promise<{ status: number; data: { shouldReceiveMarketingEmails: boolean } }> => {
  const response = await request(app)
    .get('/api/v1/users/me/marketing-preferences')
    .set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
  }
}

const updateMarketingPreferences = async (
  app: Express,
  token: string,
  shouldReceiveMarketingEmails: boolean
): Promise<{ status: number; data: { shouldReceiveMarketingEmails: boolean } }> => {
  const response = await request(app)
    .patch('/api/v1/users/me/marketing-preferences')
    .set(buildAuthorizationHeaders(token))
    .send({ shouldReceiveMarketingEmails })
  return {
    status: response.status,
    data: response.body.data,
  }
}

describe('users-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  describe('get marketing preferences', () => {
    it('should successfully get marketing preferences', async () => {
      let getCustomerAttributesWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        getCustomerData: async () => {
          getCustomerAttributesWasCalled = true
          return {
            wasSuccessful: true,
            data: {
              attributes: {},
              unsubscribed: false,
            },
          }
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const { status, data } = await getMarketingPreferences(testApp, token)

      expect(status).toBe(200)
      expect(data.shouldReceiveMarketingEmails).toBe(true)
      expect(getCustomerAttributesWasCalled).toBe(true)
    })

    it('should successfully get marketing preferences even if customer.io returns an error', async () => {
      let getCustomerAttributesWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        getCustomerData: async () => {
          getCustomerAttributesWasCalled = true
          return { wasSuccessful: false }
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const { status, data } = await getMarketingPreferences(testApp, token)

      expect(status).toBe(200)
      expect(data.shouldReceiveMarketingEmails).toBe(false)
      expect(getCustomerAttributesWasCalled).toBe(true)
    })
  })

  describe('update marketing preferences', () => {
    it('should successfully update marketing preferences', async () => {
      let toggleSubscribeWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        toggleSubscribeToMarketingEmails: async () => {
          toggleSubscribeWasCalled = true
          return true
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const { status, data } = await updateMarketingPreferences(testApp, token, true)

      expect(status).toBe(200)
      expect(data.shouldReceiveMarketingEmails).toBe(true)
      expect(toggleSubscribeWasCalled).toBe(true)
    })

    it('should return 500 when customer.io update fails', async () => {
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        toggleSubscribeToMarketingEmails: async () => false,
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const response = await request(testApp)
        .patch('/api/v1/users/me/marketing-preferences')
        .set(buildAuthorizationHeaders(token))
        .send({ shouldReceiveMarketingEmails: true })

      expect(response.status).toBe(500)
      expect(response.body.data.errors[0].message).toBe('Failed to update shouldReceiveMarketingEmails')
    })
  })
})
