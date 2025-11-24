import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'
import { __deleteWords } from '../../transport/database/words/words-repository'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi, MockGenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import { DeepgramApi } from '../../transport/third-party/deepgram/deepgram-api'
import { mockFrequencyLists } from '../../utils/frequency-list-utils'
import { TranscriptionResponse } from '@yourbestaccent/core/common-types/transcription-types'
import { __getDateOnlyString } from '../../test/date-test-utils'
import { createDefaultSettings } from '../../transport/database/users/users-repositoru.utils'
import { createUserStatsAnyExpectation } from '../../test/user-stats-test-utils'
import fs from 'node:fs'

type PronunciationScenario = {
  text: string
  language: LangCode
  dialect: DialectCode
  words: Array<{
    text: string
    confidence: number
  }>
}

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

const setupTestAppWithScenarioMocks = async (scenarios: PronunciationScenario[]) => {
  let activeScenario: PronunciationScenario = scenarios[0]

  const genericLlmApi: GenericLlmApi = {
    ...MockGenericLlmApi,
    generateExerciseFromFrequencyList: async () => activeScenario.text,
    correctGrammar: async () => activeScenario.text,
  }

  const deepgramApi: DeepgramApi = {
    transcribe: async () => {
      const transcript = activeScenario.words.map((word) => word.text).join(' ')
      const words = activeScenario.words.map((word, index) => ({
        word: word.text,
        confidence: word.confidence,
        start: index,
        end: index + 0.5,
      }))

      return {
        wasTranscriptionSuccessful: true,
        transcription: createMockTranscriptionResponse(transcript, 0.95, words),
      }
    },
  }

  const initialState = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
    appDependencies: {
      genericLlmApi,
      deepgramApi,
      frequencyLists: mockFrequencyLists,
    },
  })

  const setActiveScenario = (scenario: PronunciationScenario) => {
    activeScenario = scenario
  }

  return { ...initialState, setActiveScenario }
}

const completeScenario = async ({
  scenario,
  testApp,
  token,
  setActiveScenario,
}: {
  scenario: PronunciationScenario
  testApp: Express
  token: string
  setActiveScenario: (scenario: PronunciationScenario) => void
}) => {
  setActiveScenario(scenario)

  const generateResponse = await request(testApp)
    .post('/api/v1/exercises/pronunciation-evaluation/standard/generate')
    .send({
      language: scenario.language,
      dialect: scenario.dialect,
      position: 100,
      wordLength: Math.max(4, scenario.text.length),
    })
    .set(buildAuthorizationHeaders(token))

  expect(generateResponse.status).toBe(200)

  const exerciseId = generateResponse.body.data.id
  const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')

  const completeResponse = await request(testApp)
    .post(`/api/v1/exercises/pronunciation-evaluation/${exerciseId}/complete`)
    .attach('audio', audioBuffer, 'test.wav')
    .set(buildAuthorizationHeaders(token))

  expect(completeResponse.status).toBe(200)
}

describe('words-router', async () => {
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

  test('returns 400 when limit query param is invalid', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

    const response = await request(testApp)
      .get('/api/v1/words/learned-words?limit=not-a-number')
      .set(buildAuthorizationHeaders(token))

    expect(response.status).toBe(400)
  })

  test('returns an empty list when user has no learned words', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

    const response = await request(testApp).get('/api/v1/words/learned-words').set(buildAuthorizationHeaders(token))

    expect(response.status).toBe(200)
    expect(response.body.data.userPronunciations).toEqual([])
    expect(response.body.data.nextCursor).toBeNull()
  })

  test('returns learned words after completing a pronunciation exercise', async () => {
    const englishScenario: PronunciationScenario = {
      text: 'hello world',
      language: LangCode.ENGLISH,
      dialect: DialectCode.AMERICAN_ENGLISH,
      words: [
        { text: 'hello', confidence: 0.95 },
        { text: 'world', confidence: 0.96 },
      ],
    }

    const { token, testApp, setActiveScenario } = await setupTestAppWithScenarioMocks([englishScenario])

    await completeScenario({ scenario: englishScenario, testApp, token, setActiveScenario })

    const response = await request(testApp).get('/api/v1/words/learned-words').set(buildAuthorizationHeaders(token))

    expect(response.status).toBe(200)
    expect(response.body.data.userPronunciations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          word: 'hello',
          language: 'en',
          dateOfFirstTimePronouncedCorrectly: expect.any(String),
        }),
        expect.objectContaining({
          word: 'world',
          language: 'en',
          dateOfFirstTimePronouncedCorrectly: expect.any(String),
        }),
      ])
    )
    expect(response.body.data.userPronunciations).toHaveLength(2)
  })

  test('filters learned words by language', async () => {
    const englishScenario: PronunciationScenario = {
      text: 'good morning',
      language: LangCode.ENGLISH,
      dialect: DialectCode.AMERICAN_ENGLISH,
      words: [
        { text: 'good', confidence: 0.94 },
        { text: 'morning', confidence: 0.94 },
      ],
    }

    const frenchScenario: PronunciationScenario = {
      text: 'bonjour monde',
      language: LangCode.FRENCH,
      dialect: DialectCode.PARISIAN_FRENCH,
      words: [
        { text: 'bonjour', confidence: 0.93 },
        { text: 'monde', confidence: 0.95 },
      ],
    }

    const { token, testApp, setActiveScenario } = await setupTestAppWithScenarioMocks([englishScenario, frenchScenario])

    await completeScenario({ scenario: englishScenario, testApp, token, setActiveScenario })
    await completeScenario({ scenario: frenchScenario, testApp, token, setActiveScenario })

    const response = await request(testApp)
      .get('/api/v1/words/learned-words?language=fr')
      .set(buildAuthorizationHeaders(token))

    expect(response.status).toBe(200)
    expect(response.body.data.userPronunciations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          word: 'bonjour',
          language: 'fr',
          dateOfFirstTimePronouncedCorrectly: expect.any(String),
        }),
        expect.objectContaining({
          word: 'monde',
          language: 'fr',
          dateOfFirstTimePronouncedCorrectly: expect.any(String),
        }),
      ])
    )
    expect(response.body.data.userPronunciations).toHaveLength(2)
  })

  test('user profile includes counters and daily progress after exercises', async () => {
    const englishScenario: PronunciationScenario = {
      text: 'brave hero',
      language: LangCode.ENGLISH,
      dialect: DialectCode.AMERICAN_ENGLISH,
      words: [
        { text: 'brave', confidence: 0.97 },
        { text: 'hero', confidence: 0.97 },
      ],
    }

    const { token, testApp, setActiveScenario } = await setupTestAppWithScenarioMocks([englishScenario])

    await completeScenario({ scenario: englishScenario, testApp, token, setActiveScenario })

    const response = await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token)).send({})

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      data: {
        hasVoice: true,
        learnedWordsByDay: [
          {
            date: __getDateOnlyString(new Date()),
            learnedWordsCount: 2,
          },
        ],
        counters: [
          {
            language: 'en',
            neverPronouncedCorrectlyWordCount: 0,
            wordsPronouncedCorrectlyCount: 2,
          },
        ],
        stats: createUserStatsAnyExpectation(expect),
        settings: createDefaultSettings(),
        referral: null,
        studyLanguage: 'pl',
        studyDialect: null,
        dailyStudyMinutes: null,
        topics: [],
        motherLanguage: 'en',
        nickname: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
      },
    })
  })

  test('leaderboard includes users with learned words', async () => {
    const englishScenario: PronunciationScenario = {
      text: 'hello team',
      language: LangCode.ENGLISH,
      dialect: DialectCode.AMERICAN_ENGLISH,
      words: [
        { text: 'hello', confidence: 0.94 },
        { text: 'team', confidence: 0.95 },
      ],
    }

    const { token, testApp, setActiveScenario } = await setupTestAppWithScenarioMocks([englishScenario])

    await completeScenario({ scenario: englishScenario, testApp, token, setActiveScenario })

    const response = await request(testApp).get('/api/v1/words/leaderboard').set(buildAuthorizationHeaders(token))

    expect(response.status).toBe(200)
    expect(response.body.data.learnedWords.allTime).toEqual([
      {
        nickname: null,
        numberOfLearnedWords: 2,
      },
    ])
    expect(response.body.data.learnedWords.weekly).toEqual([
      {
        nickname: null,
        numberOfLearnedWords: 2,
      },
    ])
    expect(response.body.data.learnedWords.byLanguage).toEqual({
      en: {
        allTime: [
          {
            nickname: null,
            numberOfLearnedWords: 2,
          },
        ],
        weekly: [
          {
            nickname: null,
            numberOfLearnedWords: 2,
          },
        ],
      },
    })
  })
})
