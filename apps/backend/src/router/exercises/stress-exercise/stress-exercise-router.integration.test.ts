import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../../transport/database/webhook-events/handled-stripe-events-repository'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi, MockGenericLlmApi } from '../../../transport/third-party/llms/generic-llm/generic-llm-api'
import { __deleteWords } from '../../../transport/database/words/words-repository'
import { mockExercises } from '../../../transport/third-party/llms/generic-llm/generate-stress-exercises/mock-generate-stress-exercise'

describe('stress-exercise-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
    await __deleteWords()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
    await __deleteWords()
  })

  describe('stress exercises', async () => {
    describe('happy paths', () => {
      test('successfully generates stress exercises', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .post('/api/v1/exercises/stress/generate')
          .send({
            position: 0,
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.exercises).toEqual(mockExercises)
      })

      test('returns 500 when stress exercise generation fails', async () => {
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateStressExercises: async () => null,
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
          },
        })

        const response = await request(testApp)
          .post('/api/v1/exercises/stress/generate')
          .send({
            position: 0,
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(500)
        expect(response.body.data.errors[0].message).toContain('Failed to generate stress exercises')
      })
    })
  })
})
