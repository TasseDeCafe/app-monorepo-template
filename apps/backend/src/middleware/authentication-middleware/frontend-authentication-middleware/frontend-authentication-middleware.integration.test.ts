import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
} from '../../../test/test-utils'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { __deleteAllHandledStripeEvents } from '../../../transport/database/webhook-events/handled-stripe-events-repository'
import { NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND } from '@yourbestaccent/api-client/key-generation/frontend-api-key-constants'

describe('frontend-authentication-middleware', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  test('when frontend-key is incorrect', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
    const createResponse = await request(testApp)
      .post('/api/v1/translate-text')
      .set({
        [NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND]: 'wrong-frontend-key',
        Authorization: `Bearer ${token}`,
      })
      .send({
        text: 'translate',
        sourceLanguage: LangCode.ENGLISH,
        targetLanguage: LangCode.SPANISH,
      })

    expect(createResponse.status).toBe(401)
  })
})
