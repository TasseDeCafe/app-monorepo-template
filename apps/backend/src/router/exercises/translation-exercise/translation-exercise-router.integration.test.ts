import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../../transport/database/webhook-events/handled-stripe-events-repository'
import { LangCode, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { __deleteWords } from '../../../transport/database/words/words-repository'
import { GenericLlmApi, MockGenericLlmApi } from '../../../transport/third-party/llms/generic-llm/generic-llm-api'

describe('translation-exercise-router', async () => {
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

  describe('translation exercises', async () => {
    describe('start translation exercise', () => {
      test('successfully starts translation exercise', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .post('/api/v1/exercises/translation/start')
          .send({
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            motherLanguageSentence: expect.any(String),
            studyLanguageSentence: expect.any(String),
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
            createdAt: expect.any(String),
            userTranslation: null,
            skipped: false,
          })
        )
      })

      test('returns 500 when starting translation exercise fails', async () => {
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateTranslationExercise: async () => ({ isSuccess: false }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
          },
        })

        const response = await request(testApp)
          .post('/api/v1/exercises/translation/start')
          .send({
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(500)
        expect(response.body.data.errors[0].message).toContain('Translation exercise start did not fully succeed')
      })
    })

    describe('retrieve translation exercise', () => {
      test('successfully retrieves translation exercise by ID', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const createResponse = await request(testApp)
          .post('/api/v1/exercises/translation/start')
          .send({
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = createResponse.body.data.id

        const response = await request(testApp)
          .get(`/api/v1/exercises/translation/${exerciseId}`)
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data).toEqual(
          expect.objectContaining({
            id: exerciseId,
            motherLanguageSentence: expect.any(String),
            studyLanguageSentence: expect.any(String),
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
            createdAt: expect.any(String),
            userTranslation: null,
            skipped: false,
          })
        )
      })

      test('returns 404 when exercise not found', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .get('/api/v1/exercises/translation/550e8400-e29b-41d4-a716-446655440000')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(404)
        expect(response.body.data.errors[0].message).toBe('Exercise not found')
      })

      test('returns 400 when exercise ID format is invalid', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .get('/api/v1/exercises/translation/invalid-uuid-format')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(400)
        expect(response.body.data.errors[0].message).toBe('Invalid exercise id provided')
      })
    })

    describe('complete translation exercise', () => {
      test('successfully completes translation exercise', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const getExerciseResponse = await request(testApp)
          .post('/api/v1/exercises/translation/start')
          .send({
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = getExerciseResponse.body.data.id

        const response = await request(testApp)
          .post(`/api/v1/exercises/translation/${exerciseId}/complete`)
          .send({
            userTranslation: 'My translation attempt',
            skipped: false,
            selectedChunks: [
              {
                chunk: ['like', 'go'],
                chunk_position: [2, 5],
                language: 'en',
              },
              {
                chunk: ['gerne', 'spazieren'],
                chunk_position: [3, 7],
                language: 'de',
              },
            ],
            selectedGrammarPatterns: [
              {
                structure: 'like to go',
                concept: 'expressing preference',
                hint: 'gerne + infinitive',
              },
            ],
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.success).toBe(true)
      })

      test('successfully skips translation exercise', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const getExerciseResponse = await request(testApp)
          .post('/api/v1/exercises/translation/start')
          .send({
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = getExerciseResponse.body.data.id

        const response = await request(testApp)
          .post(`/api/v1/exercises/translation/${exerciseId}/complete`)
          .send({
            skipped: true,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.success).toBe(true)
      })

      test('returns 404 when completing non-existent translation exercise', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .post('/api/v1/exercises/translation/550e8400-e29b-41d4-a716-446655440000/complete')
          .send({
            skipped: false,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(404)
        expect(response.body.data.errors[0].message).toBe('Exercise not found')
      })
    })

    describe('retrieve translation exercise history', () => {
      test('successfully retrieves translation exercise history', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const createResponse = await request(testApp)
          .post('/api/v1/exercises/translation/start')
          .send({
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_GERMAN,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = createResponse.body.data.id

        await request(testApp)
          .post(`/api/v1/exercises/translation/${exerciseId}/complete`)
          .send({ skipped: true })
          .set(buildAuthorizationHeaders(token))

        const response = await request(testApp)
          .get('/api/v1/exercises/translation/history')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.exercises).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: exerciseId,
              motherLanguageSentence: expect.any(String),
              studyLanguageSentence: expect.any(String),
              studyLanguage: LangCode.GERMAN,
              motherLanguage: LangCode.ENGLISH,
              dialect: DialectCode.STANDARD_GERMAN,
              createdAt: expect.any(String),
              userTranslation: null,
              skipped: true,
            }),
          ])
        )
        expect(response.body.data.nextCursor).toBeNull()
      })

      test('returns empty history when no completed exercises', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .get('/api/v1/exercises/translation/history')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.exercises).toEqual([])
        expect(response.body.data.nextCursor).toBeNull()
      })
    })

    describe('generate grammar patterns', () => {
      test('successfully generates grammar patterns', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .post('/api/v1/exercises/translation/analyze-grammar-patterns')
          .send({
            motherLanguageSentence: 'I like to go for walks on weekends.',
            studyLanguageSentence: 'Ich gehe gerne am Wochenende spazieren.',
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.grammarPatterns).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              structure: expect.any(String),
              concept: expect.any(String),
              hint: expect.any(String),
            }),
          ])
        )
      })

      test('returns 500 when generating grammar patterns fails', async () => {
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateGrammarPatterns: async () => ({ isSuccess: false }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
          },
        })

        const response = await request(testApp)
          .post('/api/v1/exercises/translation/analyze-grammar-patterns')
          .send({
            motherLanguageSentence: 'I like to go for walks on weekends.',
            studyLanguageSentence: 'Ich gehe gerne am Wochenende spazieren.',
            studyLanguage: LangCode.GERMAN,
            motherLanguage: LangCode.ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(500)
        expect(response.body.data.errors[0].message).toContain('Grammar patterns analysis did not fully succeed')
      })
    })
  })
})
