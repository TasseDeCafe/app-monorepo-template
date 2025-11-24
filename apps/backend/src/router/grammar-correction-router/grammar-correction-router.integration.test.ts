import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi, MockGenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'

describe('Grammar correction router', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  describe('POST /api/v1/grammar/correct-and-explain', () => {
    it('should return corrected text', async () => {
      const mockGenericLlmApi: GenericLlmApi = {
        ...MockGenericLlmApi,
        correctGrammarAndExplainMistakes: async (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          text: string,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          motherLanguage: LangCode,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          language: LangCode,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          dialect: DialectCode
        ) => {
          return {
            correction: 'Corrected text',
            explanation: 'una explicación',
          }
        },
      }
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          genericLlmApi: mockGenericLlmApi,
        },
      })
      const response = await request(testApp)
        .post('/api/v1/grammar/correct-and-explain')
        .send({
          text: 'Text with grammar mistakes',
          motherLanguage: 'es',
          language: 'en',
          dialect: 'en-US',
        })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      expect(response.body.data.correction).toBe('Corrected text')
      expect(response.body.data.explanation).toBe('una explicación')
    })

    it('should handle errors', async () => {
      const mockGenericLlmApi: GenericLlmApi = {
        ...MockGenericLlmApi,
        correctGrammarAndExplainMistakes: async (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          text: string,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          motherLanguage: LangCode,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          language: LangCode,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          dialect: DialectCode
        ) => {
          return {
            correction: null,
            explanation: null,
          }
        },
      }
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          genericLlmApi: mockGenericLlmApi,
        },
      })
      const response = await request(testApp)
        .post('/api/v1/grammar/correct-and-explain')
        .send({
          text: 'Text with grammar mistakes',
          motherLanguage: 'es',
          language: 'en',
          dialect: 'en-US',
        })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(500)
      expect(response.body.data.errors[0].message).toBe('Failed to correct grammar')
    })
  })
})
