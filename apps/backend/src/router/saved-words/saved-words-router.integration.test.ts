import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createNUsersWithInitialStateIntroducingCreditCardAfterOnboarding,
  __createUserRightAfterSignup,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
  InitialState,
} from '../../test/test-utils'
import { buildApp } from '../../app'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { MockGenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'
import { __deleteWords } from '../../transport/database/words/words-repository'
import { SavedWord } from '@yourbestaccent/api-client/orpc-contracts/saved-words-contract'

const __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock = async (
  wordToOrthographicFormMap: Record<string, string> = {}
): Promise<InitialState> => {
  const genericLlmApi = {
    ...MockGenericLlmApi,
    getOrthographicFormForWord: async (language: LangCode, contextWords: string[], selectedWordIndex: number) => {
      return wordToOrthographicFormMap[contextWords[selectedWordIndex]]
    },
  }
  const { token, id, testApp, stripeCallsCounters } =
    await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
      appDependencies: {
        genericLlmApi,
      },
    })
  return { token, id, testApp, stripeCallsCounters }
}

describe('saved-words-router', async () => {
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

  describe('authentication unhappy paths', () => {
    test('when unauthenticated request', async () => {
      const testApp = buildApp({})
      const response = await request(testApp)
        .put('/api/v1/saved-words')
        .send({
          word: 'some word',
        })
        .set({ Authorization: `Bearer wrong-token` })

      expect(response.status).toBe(401)
    })

    test('when user has no subscription', async () => {
      const { token, testApp } = await __createUserRightAfterSignup({})
      const response = await request(testApp)
        .put('/api/v1/saved-words')
        .send({
          word: 'some word',
        })
        .set(buildAuthorizationHeaders(token))
      expect(response.status).toBe(403)
    })
  })

  describe('idempotency', () => {
    test('saving the same word second time returns 200', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({
        Dog: 'dog',
      })
      const language = LangCode.ENGLISH

      const firstSaveResponse = await request(testApp)
        .put('/api/v1/saved-words')
        .send({
          contextWords: ['I', 'have', 'a', 'Dog'],
          wordIndex: 3,
          language,
        })
        .set(buildAuthorizationHeaders(token))
      expect(firstSaveResponse.status).toBe(200)

      const secondSaveResponse = await request(testApp)
        .put('/api/v1/saved-words')
        .send({
          contextWords: ['I', 'have', 'a', 'Dog'],
          wordIndex: 3,
          language,
        })
        .set(buildAuthorizationHeaders(token))
      expect(secondSaveResponse.status).toBe(200)
      expect(secondSaveResponse.body.data.orthographicForm).toBe('dog')
    })

    test('deleting a non existing saved word returns 200', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({
        nonexistent: 'nonexistent',
      })
      const wordToDelete = 'nonexistent'
      const language = LangCode.ENGLISH

      const deleteResponse = await request(testApp)
        .delete('/api/v1/saved-words')
        .send({ orthographicForm: wordToDelete, language })
        .set(buildAuthorizationHeaders(token))
      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.data.orthographicForm).toBe('nonexistent')
    })
  })

  test('saving a word and retrieving it', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({ Dog: 'dog' })
    const language = LangCode.ENGLISH
    const saveResponse = await request(testApp)
      .put('/api/v1/saved-words')
      .send({ contextWords: ['I', 'have', 'a', 'Dog'], wordIndex: 3, language })
      .set(buildAuthorizationHeaders(token))
    expect(saveResponse.status).toBe(200)
    expect(saveResponse.body.data.orthographicForm).toBe('dog')

    const getResponse = await request(testApp).get('/api/v1/saved-words').set(buildAuthorizationHeaders(token))

    expect(getResponse.status).toBe(200)
    expect(getResponse.body.data.savedWords).toHaveLength(1)
    expect(getResponse.body.data.savedWords[0]).toEqual(
      expect.objectContaining({
        word: 'dog',
        language: language,
      })
    )
  })

  test('getting saved words', async () => {
    const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({
      dog: 'dog',
      CaR: 'car',
      casa: 'casa',
    })

    const pairs = [
      {
        word: 'CaR',
        language: LangCode.ENGLISH,
      },
      {
        word: 'dog',
        language: LangCode.ENGLISH,
      },
      {
        word: 'casa',
        language: LangCode.SPANISH,
      },
    ]
    for (const { word, language } of pairs) {
      await request(testApp)
        .put('/api/v1/saved-words')
        .send({ contextWords: [word], wordIndex: 0, language })
        .set(buildAuthorizationHeaders(token))
    }

    const getResponse = await request(testApp).get('/api/v1/saved-words').set(buildAuthorizationHeaders(token))

    expect(getResponse.status).toBe(200)
    expect(getResponse.body.data.savedWords).toHaveLength(3)
    expect(getResponse.body.data.savedWords).toEqual(
      expect.arrayContaining([
        {
          word: 'car',
          language: LangCode.ENGLISH,
        },
        {
          word: 'dog',
          language: LangCode.ENGLISH,
        },
        {
          word: 'casa',
          language: LangCode.SPANISH,
        },
      ])
    )

    expect(getResponse.body.data.countersByLanguage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          language: LangCode.ENGLISH,
          count: 2,
        }),
        expect.objectContaining({
          language: LangCode.SPANISH,
          count: 1,
        }),
      ])
    )
  })

  test('delete a saved word', async () => {
    const wordToSave = 'test'
    const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({
      [wordToSave]: wordToSave,
    })
    const language = LangCode.ENGLISH
    await request(testApp)
      .put('/api/v1/saved-words')
      .send({ contextWords: [wordToSave], wordIndex: 0, language })
      .set(buildAuthorizationHeaders(token))

    const deleteResponse = await request(testApp)
      .delete('/api/v1/saved-words')
      .send({ contextWords: [wordToSave], wordIndex: 0, language })
      .set(buildAuthorizationHeaders(token))
    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.body.data.orthographicForm).toBe(wordToSave)

    const getResponseAfter = await request(testApp).get('/api/v1/saved-words').set(buildAuthorizationHeaders(token))
    expect(getResponseAfter.body.data.savedWords).toHaveLength(0)
  })

  test("can't delete a saved word from another user", async () => {
    const { users, testApp } = await __createNUsersWithInitialStateIntroducingCreditCardAfterOnboarding(2)
    const [{ token: token1 }, { token: token2 }] = users

    const wordToSave = 'test'
    const language = LangCode.ENGLISH

    await request(testApp)
      .put('/api/v1/saved-words')
      .send({ contextWords: [wordToSave], wordIndex: 0, language })
      .set(buildAuthorizationHeaders(token1))

    await request(testApp)
      .delete('/api/v1/saved-words')
      .send({ contextWords: [wordToSave], wordIndex: 0, language })
      .set(buildAuthorizationHeaders(token2))

    const getResponse = await request(testApp).get('/api/v1/saved-words').set(buildAuthorizationHeaders(token1))

    expect(getResponse.status).toBe(200)
    expect(getResponse.body.data.savedWords).toHaveLength(1)
    expect(getResponse.body.data.savedWords[0]).toEqual(
      expect.objectContaining({
        word: wordToSave,
        language: language,
      })
    )
  })

  describe('saved-words-router with language filter', () => {
    test('getting saved words in different languages and filtering by language', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({
        dog: 'dog',
        cat: 'cat',
        perro: 'perro',
        gato: 'gato',
      })

      const wordsToSave = [
        { word: 'dog', language: LangCode.ENGLISH },
        { word: 'cat', language: LangCode.ENGLISH },
        { word: 'perro', language: LangCode.SPANISH },
        { word: 'gato', language: LangCode.SPANISH },
      ]

      for (const { word, language } of wordsToSave) {
        await request(testApp)
          .put('/api/v1/saved-words')
          .send({ contextWords: [word], wordIndex: 0, language })
          .set(buildAuthorizationHeaders(token))
      }

      const getResponseEnglish = await request(testApp)
        .get('/api/v1/saved-words?language=en')
        .set(buildAuthorizationHeaders(token))

      expect(getResponseEnglish.status).toBe(200)
      const englishWords = getResponseEnglish.body.data.savedWords as SavedWord[]
      expect(englishWords).toHaveLength(2)
      expect(englishWords).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ word: 'dog', language: LangCode.ENGLISH }),
          expect.objectContaining({ word: 'cat', language: LangCode.ENGLISH }),
        ])
      )

      const getResponseSpanish = await request(testApp)
        .get('/api/v1/saved-words?language=es')
        .set(buildAuthorizationHeaders(token))

      expect(getResponseSpanish.status).toBe(200)
      const spanishWords = getResponseSpanish.body.data.savedWords as SavedWord[]
      expect(spanishWords).toHaveLength(2)
      expect(spanishWords).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            word: 'perro',
            language: LangCode.SPANISH,
          }),
          expect.objectContaining({ word: 'gato', language: LangCode.SPANISH }),
        ])
      )
    })

    test('returns 400 for invalid language filter', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock()

      const getResponse = await request(testApp)
        .get('/api/v1/saved-words?language=invalid')
        .set(buildAuthorizationHeaders(token))

      expect(getResponse.status).toBe(400)
    })

    test('returns empty array for language with no saved words', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({
        bonjour: 'bonjour',
        merci: 'merci',
      })

      const frenchWords = ['bonjour', 'merci']

      for (const word of frenchWords) {
        await request(testApp)
          .put('/api/v1/saved-words')
          .send({
            contextWords: [word],
            wordIndex: 0,
            language: LangCode.FRENCH,
          })
          .set(buildAuthorizationHeaders(token))
      }

      const getResponse = await request(testApp)
        .get('/api/v1/saved-words?language=de')
        .set(buildAuthorizationHeaders(token))

      expect(getResponse.status).toBe(200)
      const savedWords = getResponse.body.data.savedWords as SavedWord[]
      expect(savedWords).toHaveLength(0)
      expect(getResponse.body.data.nextCursor).toBeNull()
    })

    test('pagination works correctly with language filter', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterOnboardingWithOrthographicFormMock({
        bonjour: 'bonjour',
        merci: 'merci',
        revoir: 'revoir',
        baguette: 'baguette',
        croissant: 'croissant',
      })

      const frenchWords = ['bonjour', 'merci', 'revoir', 'baguette', 'croissant']

      for (const word of frenchWords) {
        await request(testApp)
          .put('/api/v1/saved-words')
          .send({
            contextWords: [word],
            wordIndex: 0,
            language: LangCode.FRENCH,
          })
          .set(buildAuthorizationHeaders(token))
      }

      const getResponse1 = await request(testApp)
        .get('/api/v1/saved-words?limit=3&language=fr')
        .set(buildAuthorizationHeaders(token))

      expect(getResponse1.status).toBe(200)
      const savedWords1 = getResponse1.body.data.savedWords as SavedWord[]
      expect(savedWords1).toHaveLength(3)
      expect(getResponse1.body.data.nextCursor).toBeTruthy()

      const getResponse2 = await request(testApp)
        .get(`/api/v1/saved-words?limit=3&language=fr&cursor=${getResponse1.body.data.nextCursor}`)
        .set(buildAuthorizationHeaders(token))

      expect(getResponse2.status).toBe(200)
      const savedWords2 = getResponse2.body.data.savedWords as SavedWord[]
      expect(savedWords2.length).toBeGreaterThan(0)
      expect(savedWords2.every((word) => word.language === LangCode.FRENCH)).toBe(true)
      expect(savedWords2.length).toBeLessThanOrEqual(2)
    })
  })
})
