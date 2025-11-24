import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'

describe('audio-transcription-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  test('cannot transcribe if audio is missing', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
    const updateResponse = await request(testApp)
      .post(`/api/v1/transcribe-audio`)
      .send({ langCode: 'en' })
      .set(buildAuthorizationHeaders(token))

    expect(updateResponse.status).toBe(400)
    expect(updateResponse.body.data.issues).toBeDefined()
    expect(updateResponse.body.data.issues.length).toBeGreaterThan(0)
    expect(updateResponse.body.data.issues[0].path).toContain('audio')
  })
})
