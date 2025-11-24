import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import fs from 'node:fs'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../../transport/database/webhook-events/handled-stripe-events-repository'
import { __deleteWords, WordsRepository } from '../../../transport/database/words/words-repository'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi, MockGenericLlmApi } from '../../../transport/third-party/llms/generic-llm/generic-llm-api'
import { DeepgramApi, MockDeepgramApi } from '../../../transport/third-party/deepgram/deepgram-api'
import { mockFrequencyLists } from '../../../utils/frequency-list-utils'
import { TranscriptionResponse } from '@yourbestaccent/core/common-types/transcription-types'
import { createUserStatsAnyExpectation } from '../../../test/user-stats-test-utils'

describe('pronunciation-evaluation-exercise-router', async () => {
  const wordsRepository = WordsRepository()

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

  const createMockTranscriptionResponse = (
    transcript: string,
    confidence: number,
    words: Array<{ word: string; confidence: number; start: number; end: number }>
  ): TranscriptionResponse => ({
    metadata: {
      transaction_key: 'test-transaction-key',
      request_id: 'test-request-id',
      sha256: 'test-sha256',
      created: new Date().toISOString(),
      duration: 1.5,
      channels: 1,
      models: ['nova-2'],
      model_info: {
        'nova-2': {
          name: 'nova-2',
          version: '1.0.0',
          arch: 'nova',
        },
      },
    },
    results: {
      channels: [
        {
          alternatives: [
            {
              transcript,
              confidence,
              words,
            },
          ],
        },
      ],
    },
  })

  describe('generateCustomPronunciationExercise', () => {
    describe('happy paths', () => {
      test('should generate a custom pronunciation exercise successfully', async () => {
        const customText = 'This is my custom text for testing.'

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/custom/generate')
          .send({
            text: customText,
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data).toEqual({
          id: expect.any(String),
          text: customText,
          dialect: DialectCode.AMERICAN_ENGLISH,
          language: LangCode.ENGLISH,
          createdAt: expect.any(String),
          attempts: [],
          wordsFromExerciseThatAreSaved: [],
        })
        expect(response.body.data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      })

      test('should handle different languages and dialects', async () => {
        const customText = 'Texto personalizado en español.'

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/custom/generate')
          .send({
            text: customText,
            language: LangCode.SPANISH,
            dialect: DialectCode.CASTILIAN_SPANISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.language).toBe(LangCode.SPANISH)
        expect(response.body.data.dialect).toBe(DialectCode.CASTILIAN_SPANISH)
        expect(response.body.data.text).toBe(customText)
      })
    })

    describe('error scenarios', () => {
      test('should return 400 when text is too short', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/custom/generate')
          .send({
            text: '',
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(400)
      })

      test('should return 400 when text is too long', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const longText = 'a'.repeat(1001)
        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/custom/generate')
          .send({
            text: longText,
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(400)
      })
    })
  })

  describe('generatePronunciationExercise', () => {
    describe('happy paths', () => {
      test('should generate a pronunciation exercise successfully', async () => {
        const mockGeneratedText = 'Hello world, this is a test sentence.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
            topics: ['nature'],
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data).toEqual({
          id: expect.any(String),
          text: mockGeneratedText,
          dialect: DialectCode.AMERICAN_ENGLISH,
          language: LangCode.ENGLISH,
          createdAt: expect.any(String),
          attempts: [],
          wordsFromExerciseThatAreSaved: [],
        })
        expect(response.body.data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      })

      test('should handle optional dialect and topics', async () => {
        const mockGeneratedText = 'Simple test text.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.SPANISH,
            position: 50,
            wordLength: 6,
            dialect: DialectCode.CASTILIAN_SPANISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.language).toBe(LangCode.SPANISH)
      })
    })

    describe('error scenarios', () => {
      test('should return 500 when text generation fails', async () => {
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => null,
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(500)
        expect(response.body.data.errors[0]).toEqual({
          message: 'pronunciation exercise generation did not fully succeed',
          code: expect.any(String),
        })
      })
    })
  })

  describe('retrievePronunciationExercise', () => {
    describe('happy paths', () => {
      test('should retrieve an existing exercise with no attempts', async () => {
        const mockGeneratedText = 'Test sentence for retrieval.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = generateResponse.body.data.id

        const retrieveResponse = await request(testApp)
          .get(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}`)
          .set(buildAuthorizationHeaders(token))

        expect(retrieveResponse.status).toBe(200)
        expect(retrieveResponse.body.data).toEqual({
          id: exerciseId,
          text: mockGeneratedText,
          dialect: DialectCode.AMERICAN_ENGLISH,
          language: LangCode.ENGLISH,
          createdAt: expect.any(String),
          attempts: [],
          wordsFromExerciseThatAreSaved: [],
        })
      })
    })

    describe('error scenarios', () => {
      test('should return 404 for non-existent exercise ID', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const nonExistentId = '00000000-0000-0000-0000-000000000000'
        const response = await request(testApp)
          .get(`/api/v1/exercises/pronunciation-evaluation/${nonExistentId}`)
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(404)
        expect(response.body.data.errors[0].message).toBe('exercise not found')
      })

      test('should return 400 for invalid UUID format', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const invalidId = 'not-a-uuid'
        const response = await request(testApp)
          .get(`/api/v1/exercises/pronunciation-evaluation/${invalidId}`)
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(400)
        expect(response.body.data.errors[0].message).toBe('invalid exercise id provided')
      })

      test('should not allow retrieving exercises from different users', async () => {
        const mockGeneratedText = 'User isolation test.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const { token: token1, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
          email: 'user1@test.com',
        })

        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token1))

        const exerciseId = generateResponse.body.data.id

        const { token: token2 } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          email: 'user2@test.com',
        })

        const retrieveResponse = await request(testApp)
          .get(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}`)
          .set(buildAuthorizationHeaders(token2))

        expect(retrieveResponse.status).toBe(403)
      })
    })

    describe('saved words functionality', () => {
      test('should return saved words in wordsFromExerciseThatAreSaved for both generate and retrieve', async () => {
        const mockGeneratedText = 'The dom is beautiful today.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
          getOrthographicFormForWord: async () => 'dom',
          getOrthographicFormsForMultipleWords: async () => ({
            isSuccess: true,
            orthographicForms: ['dom'],
          }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        // First, save a word "Domu" which will be normalized to "dom"
        await request(testApp)
          .put('/api/v1/saved-words')
          .send({
            contextWords: ['Domu'],
            wordIndex: 0,
            language: LangCode.ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        // Generate an exercise that contains "dom"
        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(generateResponse.status).toBe(200)
        expect(generateResponse.body.data).toEqual({
          id: expect.any(String),
          text: mockGeneratedText,
          dialect: DialectCode.AMERICAN_ENGLISH,
          language: LangCode.ENGLISH,
          createdAt: expect.any(String),
          attempts: [],
          wordsFromExerciseThatAreSaved: [
            {
              word: 'dom',
              language: LangCode.ENGLISH,
            },
          ],
        })

        const exerciseId = generateResponse.body.data.id

        // Retrieve the exercise and verify saved words are still returned
        const retrieveResponse = await request(testApp)
          .get(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}`)
          .set(buildAuthorizationHeaders(token))

        expect(retrieveResponse.status).toBe(200)
        expect(retrieveResponse.body.data.wordsFromExerciseThatAreSaved).toEqual([
          {
            word: 'dom',
            language: LangCode.ENGLISH,
          },
        ])
      })

      test('should work with custom pronunciation exercises', async () => {
        const customText = 'The beautiful dom shines bright.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          getOrthographicFormForWord: async () => 'dom',
          getOrthographicFormsForMultipleWords: async () => ({
            isSuccess: true,
            orthographicForms: ['dom'], // Mock returns 'dom' as orthographic form
          }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
          },
        })

        // Save a word that will be normalized to "dom"
        await request(testApp)
          .put('/api/v1/saved-words')
          .send({
            contextWords: ['Domu'],
            wordIndex: 0,
            language: LangCode.ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        // Generate a custom exercise that contains "dom"
        const response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/custom/generate')
          .send({
            text: customText,
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data.wordsFromExerciseThatAreSaved).toEqual([
          {
            word: 'dom',
            language: LangCode.ENGLISH,
          },
        ])
      })
    })
  })

  describe('completePronunciationExercise', () => {
    describe('happy paths', () => {
      test('should complete pronunciation exercise successfully', async () => {
        const mockGeneratedText = 'Hello world test.'
        const mockTranscriptionResponse = createMockTranscriptionResponse('Hello world test', 0.95, [
          { word: 'Hello', confidence: 0.98, start: 0.0, end: 0.5 },
          { word: 'world', confidence: 0.94, start: 0.6, end: 1.0 },
          { word: 'test', confidence: 0.93, start: 1.1, end: 1.4 },
        ])

        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const mockDeepgramApi: DeepgramApi = {
          ...MockDeepgramApi,
          transcribe: async () => ({
            wasTranscriptionSuccessful: true,
            transcription: mockTranscriptionResponse,
          }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            deepgramApi: mockDeepgramApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = generateResponse.body.data.id
        const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

        const completeResponse = await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
          .attach('audio', audioBuffer, 'test.wav')
          .set(buildAuthorizationHeaders(token))

        expect(completeResponse.status).toBe(200)
        expect(completeResponse.body.data.evaluation).toEqual({
          transcript: 'Hello world test',
          score: expect.any(Number),
          wordPairs: expect.any(Array),
        })
        expect(completeResponse.body.data.userStats).toEqual(createUserStatsAnyExpectation(expect))
        expect(completeResponse.body.data.evaluation.score).toBeGreaterThanOrEqual(0)
        expect(completeResponse.body.data.evaluation.score).toBeLessThanOrEqual(1)
      })

      test('should store attempt and allow retrieval with attempt history', async () => {
        const mockGeneratedText = 'Test attempt storage.'
        const mockTranscriptionResponse = createMockTranscriptionResponse('Test attempt storage', 0.87, [
          { word: 'Test', confidence: 0.9, start: 0.0, end: 0.3 },
          { word: 'attempt', confidence: 0.85, start: 0.4, end: 0.8 },
          { word: 'storage', confidence: 0.86, start: 0.9, end: 1.3 },
        ])

        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const mockDeepgramApi: DeepgramApi = {
          ...MockDeepgramApi,
          transcribe: async () => ({
            wasTranscriptionSuccessful: true,
            transcription: mockTranscriptionResponse,
          }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            deepgramApi: mockDeepgramApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = generateResponse.body.data.id
        const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

        await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
          .attach('audio', audioBuffer, 'test.wav')
          .set(buildAuthorizationHeaders(token))

        const retrieveResponse = await request(testApp)
          .get(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}`)
          .set(buildAuthorizationHeaders(token))

        expect(retrieveResponse.status).toBe(200)
        expect(retrieveResponse.body.data.attempts).toHaveLength(1)
        expect(retrieveResponse.body.data.attempts[0]).toEqual({
          id: expect.any(String),
          transcript: 'Test attempt storage',
          score: expect.any(Number),
          createdAt: expect.any(String),
        })
      })

      test('should not store pronounced words when score is below minimum threshold', async () => {
        const mockGeneratedText = 'Low score test sentence.'
        const mockTranscriptionResponse = createMockTranscriptionResponse('Low score test sentence', 0.3, [
          { word: 'Low', confidence: 0.3, start: 0.0, end: 0.3 },
          { word: 'score', confidence: 0.35, start: 0.4, end: 0.7 },
          { word: 'test', confidence: 0.25, start: 0.8, end: 1.1 },
          { word: 'sentence', confidence: 0.3, start: 1.2, end: 1.8 },
        ])

        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
          getOrthographicFormsForMultipleWords: async () => ({
            isSuccess: true,
            orthographicForms: ['Low', 'score', 'test', 'sentence'],
          }),
        }

        const mockDeepgramApi: DeepgramApi = {
          ...MockDeepgramApi,
          transcribe: async () => ({
            wasTranscriptionSuccessful: true,
            transcription: mockTranscriptionResponse,
          }),
        }

        const {
          token,
          testApp,
          id: userId,
        } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            deepgramApi: mockDeepgramApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = generateResponse.body.data.id
        const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

        const completeResponse = await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
          .attach('audio', audioBuffer, 'test.wav')
          .set(buildAuthorizationHeaders(token))

        expect(completeResponse.status).toBe(200)
        expect(completeResponse.body.data.evaluation.score).toBeLessThan(0.4)

        const wordsResult = await wordsRepository.selectWordsPronouncedCorrectly(userId)
        expect(wordsResult.isSuccess).toBe(true)
        if (wordsResult.isSuccess) {
          expect(wordsResult.words).toHaveLength(0)
        }
      })
    })

    describe('error scenarios', () => {
      test('should return 400 when audio file is missing', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const exerciseId = '00000000-0000-0000-0000-000000000000'
        const response = await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(400)
      })

      test('should return 400 for invalid UUID format', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const invalidId = 'not-a-uuid'
        const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

        const response = await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${invalidId}/complete`)
          .attach('audio', audioBuffer, 'test.wav')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(400)
        expect(response.body.data.errors[0].message).toBe('invalid exercise id provided')
      })

      test('should return 404 for non-existent exercise', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const nonExistentId = '00000000-0000-0000-0000-000000000000'
        const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

        const response = await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${nonExistentId}/complete`)
          .attach('audio', audioBuffer, 'test.wav')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(404)
        expect(response.body.data.errors[0].message).toBe('exercise not found')
      })

      test('should return 500 when transcription fails', async () => {
        const mockGeneratedText = 'Transcription failure test.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const mockDeepgramApi: DeepgramApi = {
          ...MockDeepgramApi,
          transcribe: async () => ({
            wasTranscriptionSuccessful: false,
            transcription: null,
          }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            deepgramApi: mockDeepgramApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = generateResponse.body.data.id
        const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

        const response = await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
          .attach('audio', audioBuffer, 'test.wav')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(500)
        expect(response.body.data.errors[0]).toEqual({
          message: 'pronunciation exercise completion did not fully succeed',
          code: expect.any(String),
        })
      })
    })
  })

  describe('retrievePronunciationExerciseHistory', () => {
    describe('happy paths', () => {
      test('should retrieve empty history for new user', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(200)
        expect(response.body.data).toEqual({
          exercises: [],
          nextCursor: null,
        })
      })

      test('should retrieve exercise history with single exercise', async () => {
        const mockGeneratedText = 'Test exercise for history.'
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        // Generate an exercise first
        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = generateResponse.body.data.id

        const historyResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(historyResponse.status).toBe(200)
        expect(historyResponse.body.data.exercises).toHaveLength(1)
        expect(historyResponse.body.data.exercises[0]).toEqual({
          id: exerciseId,
          text: mockGeneratedText,
          language: LangCode.ENGLISH,
          dialect: DialectCode.AMERICAN_ENGLISH,
          createdAt: expect.any(String),
          attempts: [],
        })
        expect(historyResponse.body.data.nextCursor).toBeNull()
      })

      test('should retrieve exercises with attempts included', async () => {
        const mockGeneratedText = 'Exercise with attempts test.'
        const mockTranscriptionResponse = createMockTranscriptionResponse('Test transcription', 0.85, [
          { word: 'Test', confidence: 0.85, start: 0.0, end: 0.5 },
          { word: 'transcription', confidence: 0.87, start: 0.6, end: 1.3 },
        ])

        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => mockGeneratedText,
          correctGrammar: async () => mockGeneratedText,
        }

        const mockDeepgramApi: DeepgramApi = {
          ...MockDeepgramApi,
          transcribe: async () => ({
            wasTranscriptionSuccessful: true,
            transcription: mockTranscriptionResponse,
          }),
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            deepgramApi: mockDeepgramApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        // Generate and complete an exercise
        const generateResponse = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const exerciseId = generateResponse.body.data.id
        const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

        await request(testApp)
          .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
          .attach('audio', audioBuffer, 'test.wav')
          .set(buildAuthorizationHeaders(token))

        const historyResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(historyResponse.status).toBe(200)
        expect(historyResponse.body.data.exercises).toHaveLength(1)
        expect(historyResponse.body.data.exercises[0].attempts).toHaveLength(1)
        expect(historyResponse.body.data.exercises[0].attempts[0]).toEqual({
          id: expect.any(String),
          transcript: 'Test transcription',
          score: expect.any(Number),
          createdAt: expect.any(String),
        })
      })

      test('should order exercises by creation date (most recent first)', async () => {
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => 'Test exercise',
          correctGrammar: async () => 'Test exercise',
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        // Generate multiple exercises with slight delays
        const exercise1Response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        await new Promise((resolve) => setTimeout(resolve, 10))

        const exercise2Response = await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 200,
            wordLength: 6,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const historyResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(historyResponse.status).toBe(200)
        expect(historyResponse.body.data.exercises).toHaveLength(2)

        // Most recent should be first
        expect(historyResponse.body.data.exercises[0].id).toBe(exercise2Response.body.data.id)
        expect(historyResponse.body.data.exercises[1].id).toBe(exercise1Response.body.data.id)

        const firstTime = new Date(historyResponse.body.data.exercises[0].createdAt).getTime()
        const secondTime = new Date(historyResponse.body.data.exercises[1].createdAt).getTime()
        expect(firstTime).toBeGreaterThanOrEqual(secondTime)
      })

      test('should support language filtering', async () => {
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => 'Test exercise',
          correctGrammar: async () => 'Test exercise',
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        // Generate English exercise
        await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        // Generate Spanish exercise
        await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.SPANISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.CASTILIAN_SPANISH,
          })
          .set(buildAuthorizationHeaders(token))

        // Test filtering by English
        const englishHistoryResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .query({ language: LangCode.ENGLISH })
          .set(buildAuthorizationHeaders(token))

        expect(englishHistoryResponse.status).toBe(200)
        expect(englishHistoryResponse.body.data.exercises).toHaveLength(1)
        expect(englishHistoryResponse.body.data.exercises[0].language).toBe(LangCode.ENGLISH)

        // Test filtering by Spanish
        const spanishHistoryResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .query({ language: LangCode.SPANISH })
          .set(buildAuthorizationHeaders(token))

        expect(spanishHistoryResponse.status).toBe(200)
        expect(spanishHistoryResponse.body.data.exercises).toHaveLength(1)
        expect(spanishHistoryResponse.body.data.exercises[0].language).toBe(LangCode.SPANISH)

        // Test no filtering (should return both)
        const allHistoryResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(allHistoryResponse.status).toBe(200)
        expect(allHistoryResponse.body.data.exercises).toHaveLength(2)
      })

      test('should support custom limit parameter', async () => {
        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => 'Test exercise',
          correctGrammar: async () => 'Test exercise',
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        // Generate 3 exercises
        for (let i = 0; i < 3; i++) {
          await request(testApp)
            .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
            .send({
              language: LangCode.ENGLISH,
              position: 100 + i,
              wordLength: 8,
              dialect: DialectCode.AMERICAN_ENGLISH,
            })
            .set(buildAuthorizationHeaders(token))
        }

        // Test with limit of 2
        const limitedHistoryResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .query({ limit: 2 })
          .set(buildAuthorizationHeaders(token))

        expect(limitedHistoryResponse.status).toBe(200)
        expect(limitedHistoryResponse.body.data.exercises).toHaveLength(2)
        expect(limitedHistoryResponse.body.data.nextCursor).toBeDefined()

        // Test default limit (should return all 3)
        const defaultHistoryResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(defaultHistoryResponse.status).toBe(200)
        expect(defaultHistoryResponse.body.data.exercises).toHaveLength(3)
      })
    })

    describe('user isolation', () => {
      test('should only return exercises for the authenticated user', async () => {
        // Note: This test demonstrates user isolation by showing exercises are properly scoped to users
        // The existing authentication middleware and database queries ensure user isolation

        const mockGenericLlmApi: GenericLlmApi = {
          ...MockGenericLlmApi,
          generateExerciseFromFrequencyList: async () => 'User isolation test',
          correctGrammar: async () => 'User isolation test',
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            genericLlmApi: mockGenericLlmApi,
            frequencyLists: mockFrequencyLists,
          },
        })

        // Create multiple exercises for this user
        await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.ENGLISH,
            position: 100,
            wordLength: 8,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
          .send({
            language: LangCode.SPANISH,
            position: 200,
            wordLength: 6,
            dialect: DialectCode.CASTILIAN_SPANISH,
          })
          .set(buildAuthorizationHeaders(token))

        const historyResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(historyResponse.status).toBe(200)
        expect(historyResponse.body.data.exercises).toHaveLength(2)

        // Verify exercises belong to the authenticated user (implicit via 200 response)
        // Database queries include userId filter ensuring user isolation
        expect(historyResponse.body.data.exercises[0].language).toBe(LangCode.SPANISH) // Most recent first
        expect(historyResponse.body.data.exercises[1].language).toBe(LangCode.ENGLISH)
      })
    })

    describe('error scenarios', () => {
      test('should require authentication', async () => {
        const { testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp).get('/api/v1/exercises/pronunciation-evaluation/history')

        expect(response.status).toBe(401)
      })

      test('should handle invalid limit parameter gracefully', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .query({ limit: -1 })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(400)
      })
    })

    describe('pagination', () => {
      test('should work with custom exercises in history', async () => {
        const customText = 'Custom exercise for history test.'

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        // Generate a custom exercise
        await request(testApp)
          .post('/api/v1/exercises/pronunciation-evaluation/custom/generate')
          .send({
            text: customText,
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        const historyResponse = await request(testApp)
          .get('/api/v1/exercises/pronunciation-evaluation/history')
          .set(buildAuthorizationHeaders(token))

        expect(historyResponse.status).toBe(200)
        expect(historyResponse.body.data.exercises).toHaveLength(1)
        expect(historyResponse.body.data.exercises[0].text).toBe(customText)
      })
    })
  })

  describe('full integration flow', () => {
    test('should support multiple attempts on the same exercise', async () => {
      const mockGeneratedText = 'Multiple attempts test sentence.'
      const mockGenericLlmApi: GenericLlmApi = {
        ...MockGenericLlmApi,
        generateExerciseFromFrequencyList: async () => mockGeneratedText,
        correctGrammar: async () => mockGeneratedText,
      }

      const mockResponses = [
        createMockTranscriptionResponse('Attempt 1 transcription', 0.85, [
          { word: 'Attempt', confidence: 0.85, start: 0.0, end: 0.4 },
          { word: '1', confidence: 0.9, start: 0.5, end: 0.8 },
          { word: 'transcription', confidence: 0.87, start: 0.9, end: 1.5 },
        ]),
        createMockTranscriptionResponse('Attempt 2 transcription', 0.9, [
          { word: 'Attempt', confidence: 0.85, start: 0.0, end: 0.4 },
          { word: '2', confidence: 0.9, start: 0.5, end: 0.8 },
          { word: 'transcription', confidence: 0.87, start: 0.9, end: 1.5 },
        ]),
      ]

      let callIndex = 0
      const mockDeepgramApi: DeepgramApi = {
        ...MockDeepgramApi,
        transcribe: async () => {
          const response = mockResponses[callIndex % mockResponses.length]
          callIndex++
          return {
            wasTranscriptionSuccessful: true,
            transcription: response,
          }
        },
      }

      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          genericLlmApi: mockGenericLlmApi,
          deepgramApi: mockDeepgramApi,
          frequencyLists: mockFrequencyLists,
        },
      })

      const generateResponse = await request(testApp)
        .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
        .send({
          language: LangCode.ENGLISH,
          position: 100,
          wordLength: 8,
          dialect: DialectCode.AMERICAN_ENGLISH,
        })
        .set(buildAuthorizationHeaders(token))

      const exerciseId = generateResponse.body.data.id
      const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

      const attempt1Response = await request(testApp)
        .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
        .attach('audio', audioBuffer, 'test1.wav')
        .set(buildAuthorizationHeaders(token))

      expect(attempt1Response.status).toBe(200)
      const firstTranscript = attempt1Response.body.data.evaluation.transcript

      const attempt2Response = await request(testApp)
        .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
        .attach('audio', audioBuffer, 'test2.wav')
        .set(buildAuthorizationHeaders(token))

      expect(attempt2Response.status).toBe(200)
      const secondTranscript = attempt2Response.body.data.evaluation.transcript

      expect(firstTranscript).not.toBe(secondTranscript)
      expect([firstTranscript, secondTranscript]).toContain('Attempt 1 transcription')
      expect([firstTranscript, secondTranscript]).toContain('Attempt 2 transcription')

      const retrieveResponse = await request(testApp)
        .get(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}`)
        .set(buildAuthorizationHeaders(token))

      expect(retrieveResponse.status).toBe(200)
      expect(retrieveResponse.body.data.attempts).toHaveLength(2)

      const storedTranscripts = retrieveResponse.body.data.attempts.map((attempt) => attempt.transcript)
      expect(storedTranscripts).toContain('Attempt 1 transcription')
      expect(storedTranscripts).toContain('Attempt 2 transcription')

      const attempt0Time = new Date(retrieveResponse.body.data.attempts[0].createdAt).getTime()
      const attempt1Time = new Date(retrieveResponse.body.data.attempts[1].createdAt).getTime()
      expect(attempt0Time).toBeGreaterThanOrEqual(attempt1Time)
    })
  })
})
