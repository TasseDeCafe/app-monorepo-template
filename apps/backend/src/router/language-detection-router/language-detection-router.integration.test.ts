import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { buildApp } from '../../app'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createUserRightAfterSignup,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'

describe('language-detection-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  test('translate word when unauthenticated request', async () => {
    const testApp = buildApp({})
    const createResponse = await request(testApp)
      .post('/api/v1/detect-language')
      .send({
        text: 'some text for language detection',
      })
      .set({ Authorization: `Bearer ${'wrong-token'}` })

    expect(createResponse.status).toBe(401)
  })

  test('cannot detect language from empty text', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
    const createResponse = await request(testApp)
      .post('/api/v1/detect-study-language')
      .set(buildAuthorizationHeaders(token))
      .send({
        text: '',
      })

    expect(createResponse.status).toBe(400)
  })

  test('do not detect language when user has no subscription', async () => {
    const { token, testApp } = await __createUserRightAfterSignup({})
    const createResponse = await request(testApp)
      .post('/api/v1/detect-study-language')
      .send({
        text: 'un texto para detectar el idioma',
      })
      .set(buildAuthorizationHeaders(token))

    expect(createResponse.status).toBe(403)
  })

  test('detect language happy path', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
    const createResponse = await request(testApp)
      .post('/api/v1/detect-study-language')
      .send({
        text: 'un texto para detectar el idioma',
      })
      .set(buildAuthorizationHeaders(token))

    expect(createResponse.status).toBe(200)
    expect(createResponse.body.data.studyLanguage).toStrictEqual(LangCode.SPANISH)
    expect(createResponse.body.data.hasDetectedAStudyLanguage).toStrictEqual(true)
  })
})
