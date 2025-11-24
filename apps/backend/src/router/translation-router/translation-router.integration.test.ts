import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { buildApp } from '../../app'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createUserRightAfterSignup,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'

describe('translation-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  describe('translate word', () => {
    test('when unauthenticated request', async () => {
      const testApp = buildApp({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-word')
        .send({
          text: 'translate',
          sourceDialect: DialectCode.AMERICAN_ENGLISH,
          targetLanguage: LangCode.SPANISH,
          contextWords: ['some', 'text', 'to', 'translate'],
          selectedWordIndex: 3,
        })
        .set({ Authorization: `Bearer wrong-token` })

      expect(createResponse.status).toBe(401)
    })

    test('when non existent language', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-word')
        .send({
          text: 'translate',
          sourceDialect: 'wrong dialect code',
          targetLanguage: LangCode.SPANISH,
          contextWords: ['some', 'text', 'to', 'translate'],
          selectedWordIndex: 3,
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(400)
    })

    test('happy path', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-word')
        .send({
          text: 'translate',
          sourceDialect: DialectCode.AMERICAN_ENGLISH,
          targetLanguage: LangCode.SPANISH,
          contextWords: ['some', 'text', 'to', 'translate'],
          selectedWordIndex: 3,
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation:
            'mocked translation: sourceDialect: en-US, targetLang: es, text: translate, selectedWordIndex: 3',
        },
      })
    })
    test('when user has no subscription', async () => {
      const { token, testApp } = await __createUserRightAfterSignup({})
      const createResponse = await request(testApp)
        .post(`/api/v1/translation/translate-word`)
        .send({
          text: 'translate',
          sourceDialect: DialectCode.AMERICAN_ENGLISH,
          targetLanguage: LangCode.SPANISH,
          contextWords: ['some', 'text', 'to', 'translate'],
          selectedWordIndex: 3,
        })
        .set(buildAuthorizationHeaders(token))
      expect(createResponse.status).toBe(403)
    })
  })

  describe('translate text', () => {
    test('when unauthenticated request', async () => {
      const testApp = buildApp({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-text')
        .send({
          text: 'translate',
          sourceDialect: DialectCode.AMERICAN_ENGLISH,
          targetLanguage: LangCode.SPANISH,
        })
        .set({ Authorization: `Bearer ${'wrong-token'}` })

      expect(createResponse.status).toBe(401)
    })

    test('when non existent language', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-text')
        .send({
          text: 'translate',
          sourceDialect: 'wrong dialect code',
          targetLanguage: LangCode.SPANISH,
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(400)
    })

    test('happy path', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-text')
        .send({
          text: 'translate',
          sourceDialect: DialectCode.AMERICAN_ENGLISH,
          targetLanguage: LangCode.SPANISH,
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation: 'mocked translation: sourceDialect: en-US, targetLang: es, text: translate',
        },
      })
    })
  })

  describe('translateWordWithTranslationContext', () => {
    test('happy path', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-word-with-translation-context')
        .send({
          word: 'hello',
          sourceDialect: DialectCode.AMERICAN_ENGLISH,
          targetLanguage: LangCode.SPANISH,
          originalSentence: 'Hello, how are you today?',
          translatedSentence: 'Hola, ¿cómo estás hoy?',
          wordIndex: 0,
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation: 'mocked word with context: sourceDialect: en-US, targetLang: es, word: hello, wordIndex: 0',
        },
      })
    })

    test('happy path - single chunk selection', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-selection')
        .send({
          sourceDialect: DialectCode.PARISIAN_FRENCH,
          targetLanguage: LangCode.ENGLISH,
          originalSentence: 'Ma sœur achète une nouvelle veste',
          translationSentence: 'My sister buys a new jacket',
          selectionChunks: ['Ma sœur achète'],
          selectionPositions: [0],
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation: '[Ma sœur achète translated]',
        },
      })
    })

    test('happy path - multiple non-adjacent chunks', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-selection')
        .send({
          sourceDialect: DialectCode.PARISIAN_FRENCH,
          targetLanguage: LangCode.ENGLISH,
          originalSentence: 'Elle a ouvert la porte et a vu un beau jardin',
          translationSentence: 'She opened the door and saw a beautiful garden',
          selectionChunks: ['Elle a', 'et', 'beau jardin'],
          selectionPositions: [0, 20, 35],
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation: '[Elle a translated] ... [et translated] ... [beau jardin translated]',
        },
      })
    })

    test('happy path - German separable verb', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-selection')
        .send({
          sourceDialect: DialectCode.STANDARD_GERMAN,
          targetLanguage: LangCode.ENGLISH,
          originalSentence: 'Ich stehe jeden Morgen früh auf',
          translationSentence: 'I get up early every morning',
          selectionChunks: ['stehe', 'auf'],
          selectionPositions: [4, 25],
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation: '[stehe translated] ... [auf translated]',
        },
      })
    })

    test('with empty selection chunks', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-selection')
        .send({
          sourceDialect: DialectCode.PARISIAN_FRENCH,
          targetLanguage: LangCode.ENGLISH,
          originalSentence: 'Elle a ouvert la porte et a vu un beau jardin',
          translationSentence: 'She opened the door and saw a beautiful garden',
          selectionChunks: [],
          selectionPositions: [],
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation: '',
        },
      })
    })

    test('with mismatched chunks and positions arrays', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const createResponse = await request(testApp)
        .post('/api/v1/translation/translate-selection')
        .send({
          sourceDialect: DialectCode.PARISIAN_FRENCH,
          targetLanguage: LangCode.ENGLISH,
          originalSentence: 'Elle a ouvert la porte et a vu un beau jardin',
          translationSentence: 'She opened the door and saw a beautiful garden',
          selectionChunks: ['Elle a', 'et'],
          selectionPositions: [0], // Missing position for second chunk
        })
        .set(buildAuthorizationHeaders(token))

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toStrictEqual({
        data: {
          translation: '[Elle a translated] ... [et translated]',
        },
      })
    })
  })
})
