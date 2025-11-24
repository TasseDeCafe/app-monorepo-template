import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { buildApp } from '../../app'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createUserRightAfterSignup,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'

describe('transliteration-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  test('when unauthenticated request', async () => {
    const testApp = buildApp({})
    const createResponse = await request(testApp)
      .post('/api/v1/transliteration/transliterate')
      .set({ Authorization: `Bearer wrong-token` })
      .send({
        text: 'some text to transliterate',
        language: LangCode.ENGLISH,
      })

    expect(createResponse.status).toBe(401)
  })

  test('when user has no subscription', async () => {
    const { token, testApp } = await __createUserRightAfterSignup({})
    const createResponse = await request(testApp)
      .post('/api/v1/transliteration/transliterate')
      .set(buildAuthorizationHeaders(token))
      .send({
        text: 'some text to transliterate',
        language: LangCode.ENGLISH,
      })
    expect(createResponse.status).toBe(403)
  })

  test('cannot transliterate a non existent language', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
    const createResponse = await request(testApp)
      .post('/api/v1/transliteration/transliterate')
      .set(buildAuthorizationHeaders(token))
      .send({
        text: 'some text to transliterate',
        language: LangCode.SPANISH,
      })

    expect(createResponse.status).toBe(400)
  })

  test('transliterate Russian happy path', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
    const createResponse = await request(testApp)
      .post('/api/v1/transliteration/transliterate')
      .set(buildAuthorizationHeaders(token))
      .send({
        text: 'Привет, мир',
        language: LangCode.RUSSIAN,
      })

    expect(createResponse.status).toBe(200)
    expect(createResponse.body).toStrictEqual({
      data: {
        transliteration: 'Privet, mir',
      },
    })
  })

  test('transliterate Ukrainian happy path', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
    const createResponse = await request(testApp)
      .post('/api/v1/transliteration/transliterate')
      .set(buildAuthorizationHeaders(token))
      .send({
        text: 'Дякую тобі друже',
        language: LangCode.UKRAINIAN,
      })

    expect(createResponse.status).toBe(200)
    expect(createResponse.body).toStrictEqual({
      data: {
        transliteration: 'Diakuiu tobi druzhe',
      },
    })
  })
})
