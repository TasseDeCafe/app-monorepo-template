import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createNUsersWithInitialStateIntroducingCreditCardAfterOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { __getDayNDaysAgo } from '../../test/date-test-utils'
import { PronunciationEvaluationExerciseRepository } from '../../transport/database/pronunciation-exercises/pronunciation-evaluation-exercise-repository'
import { sql } from '../../transport/database/postgres-client'
import { PRONUNCIATION_EXERCISE_FACTOR } from '../../service/user-stats/user-stats-constants'

describe('Leaderboard Router Integration Tests', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  afterEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  const createPronunciationExerciseWithAttempt = async (
    userId: string,
    text: string,
    language: SupportedStudyLanguage,
    dialect: DialectCode,
    score: number
  ) => {
    const repository = PronunciationEvaluationExerciseRepository()

    const exerciseResult = await repository.createPronunciationExercise(userId, language, text, dialect)

    if (!exerciseResult.isSuccess) {
      throw new Error('Failed to create pronunciation exercise')
    }

    const attemptResult = await repository.createPronunciationAttempt(exerciseResult.exerciseId!, text, score)

    if (!attemptResult) {
      throw new Error('Failed to create pronunciation attempt')
    }

    return exerciseResult.exerciseId!
  }

  const modifyPronunciationAttemptDate = async (exerciseId: string, newDate: Date) => {
    await sql`
            UPDATE public.pronunciation_evaluation_attempts
            SET created_at = ${newDate.toISOString()}
            WHERE pronunciation_exercise_id = ${exerciseId}::uuid
        `
  }

  const calculateExpectedXp = (text: string, score: number): number => {
    const weightedLength = text.length * score
    return Math.round(weightedLength * PRONUNCIATION_EXERCISE_FACTOR)
  }

  describe('GET /leaderboard', () => {
    test('when there are no users with XP, the leaderboard is empty', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const response = await request(testApp).get('/api/v1/leaderboard').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      const data = response.body.data
      expect(data).toEqual({
        xp: {
          allTime: [],
          weekly: [],
          byLanguage: {},
        },
      })
    })

    test('when a user has earned XP, they appear in the leaderboard', async () => {
      const {
        token,
        testApp,
        id: userId,
      } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const text = 'hello world'
      const score = 0.95
      await createPronunciationExerciseWithAttempt(userId, text, LangCode.ENGLISH, DialectCode.AMERICAN_ENGLISH, score)

      const response = await request(testApp).get('/api/v1/leaderboard').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      const data = response.body.data

      const expectedXp = calculateExpectedXp(text, score)

      expect(data.xp.allTime).toEqual([
        {
          nickname: null,
          xp: expectedXp,
        },
      ])

      expect(data.xp.weekly).toEqual([
        {
          nickname: null,
          xp: expectedXp,
        },
      ])

      expect(data.xp.byLanguage).toEqual({
        en: {
          allTime: [
            {
              nickname: null,
              xp: expectedXp,
            },
          ],
          weekly: [
            {
              nickname: null,
              xp: expectedXp,
            },
          ],
        },
      })
    })

    test('the weekly leaderboard only includes XP from the current week', async () => {
      const {
        token,
        testApp,
        id: userId,
      } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const text = 'old exercise'
      const score = 0.95
      const exerciseId = await createPronunciationExerciseWithAttempt(
        userId,
        text,
        LangCode.ENGLISH,
        DialectCode.AMERICAN_ENGLISH,
        score
      )

      const lastWeek = __getDayNDaysAgo(7)
      await modifyPronunciationAttemptDate(exerciseId, lastWeek)

      const response = await request(testApp).get('/api/v1/leaderboard').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      const data = response.body.data

      const expectedXp = calculateExpectedXp(text, score)

      expect(data.xp.allTime).toEqual([
        {
          nickname: null,
          xp: expectedXp,
        },
      ])

      expect(data.xp.weekly).toEqual([])

      expect(data.xp.byLanguage).toEqual({
        en: {
          allTime: [
            {
              nickname: null,
              xp: expectedXp,
            },
          ],
          weekly: [],
        },
      })
    })

    test('users with nicknames appear with their nicknames in the leaderboard', async () => {
      const {
        token,
        testApp,
        id: userId,
      } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const nickname = 'TestUser'
      await request(testApp).patch('/api/v1/users/me/nickname').send({ nickname }).set(buildAuthorizationHeaders(token))

      const text = 'hello world'
      const score = 0.95
      await createPronunciationExerciseWithAttempt(userId, text, LangCode.ENGLISH, DialectCode.AMERICAN_ENGLISH, score)

      const response = await request(testApp).get('/api/v1/leaderboard').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      const data = response.body.data

      const expectedXp = calculateExpectedXp(text, score)

      expect(data.xp.allTime).toEqual([
        {
          nickname,
          xp: expectedXp,
        },
      ])

      expect(data.xp.weekly).toEqual([
        {
          nickname,
          xp: expectedXp,
        },
      ])

      expect(data.xp.byLanguage).toEqual({
        en: {
          allTime: [
            {
              nickname,
              xp: expectedXp,
            },
          ],
          weekly: [
            {
              nickname,
              xp: expectedXp,
            },
          ],
        },
      })
    })

    test('leaderboard handles multiple users and XP rankings correctly', async () => {
      const { users, testApp } = await __createNUsersWithInitialStateIntroducingCreditCardAfterOnboarding(3)
      const [{ token: tokenA, id: userIdA }, { token: tokenB, id: userIdB }, { token: tokenC, id: userIdC }] = users

      await request(testApp)
        .patch('/api/v1/users/me/nickname')
        .send({ nickname: 'UserA' })
        .set(buildAuthorizationHeaders(tokenA))
      await request(testApp)
        .patch('/api/v1/users/me/nickname')
        .send({ nickname: 'UserB' })
        .set(buildAuthorizationHeaders(tokenB))
      await request(testApp)
        .patch('/api/v1/users/me/nickname')
        .send({ nickname: 'UserC' })
        .set(buildAuthorizationHeaders(tokenC))

      // User A earns high XP with longer text and high score (English)
      const textA = 'This is a very long sentence for high XP'
      const scoreA = 0.95
      await createPronunciationExerciseWithAttempt(
        userIdA,
        textA,
        LangCode.ENGLISH,
        DialectCode.AMERICAN_ENGLISH,
        scoreA
      )

      // User B earns medium XP with medium text and score (Spanish)
      const textB = 'Hola mundo español'
      const scoreB = 0.8
      await createPronunciationExerciseWithAttempt(
        userIdB,
        textB,
        LangCode.SPANISH,
        DialectCode.MEXICAN_SPANISH,
        scoreB
      )

      // User C earns low XP with short text and lower score (French) - but last week
      const textC = 'Bonjour'
      const scoreC = 0.7
      const exerciseIdC = await createPronunciationExerciseWithAttempt(
        userIdC,
        textC,
        LangCode.FRENCH,
        DialectCode.PARISIAN_FRENCH,
        scoreC
      )

      // Make User C's attempt from last week
      const lastWeek = __getDayNDaysAgo(7)
      await modifyPronunciationAttemptDate(exerciseIdC, lastWeek)

      const response = await request(testApp).get('/api/v1/leaderboard').set(buildAuthorizationHeaders(tokenA))

      expect(response.status).toBe(200)
      const data = response.body.data

      const expectedXpA = calculateExpectedXp(textA, scoreA)
      const expectedXpB = calculateExpectedXp(textB, scoreB)
      const expectedXpC = calculateExpectedXp(textC, scoreC)

      // All-time leaderboard should be ordered by XP (highest first)
      expect(data.xp.allTime).toEqual([
        { nickname: 'UserA', xp: expectedXpA },
        { nickname: 'UserB', xp: expectedXpB },
        { nickname: 'UserC', xp: expectedXpC },
      ])

      // Weekly leaderboard should not include User C
      expect(data.xp.weekly).toEqual([
        { nickname: 'UserA', xp: expectedXpA },
        { nickname: 'UserB', xp: expectedXpB },
      ])

      // By-language leaderboards
      expect(data.xp.byLanguage).toEqual({
        en: {
          allTime: [{ nickname: 'UserA', xp: expectedXpA }],
          weekly: [{ nickname: 'UserA', xp: expectedXpA }],
        },
        es: {
          allTime: [{ nickname: 'UserB', xp: expectedXpB }],
          weekly: [{ nickname: 'UserB', xp: expectedXpB }],
        },
        fr: {
          allTime: [{ nickname: 'UserC', xp: expectedXpC }],
          weekly: [],
        },
      })
    })

    test('XP is calculated correctly based on text length and score', async () => {
      const {
        token,
        testApp,
        id: userId,
      } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      // Create multiple exercises with different text lengths and scores
      const exercises = [
        { text: 'Hi', score: 1.0 }, // 2 chars * 1.0 = 2.0 weighted
        { text: 'Hello world', score: 0.8 }, // 11 chars * 0.8 = 8.8 weighted
        { text: 'This is a longer sentence', score: 0.6 }, // 25 chars * 0.6 = 15.0 weighted
      ]

      for (const exercise of exercises) {
        await createPronunciationExerciseWithAttempt(
          userId,
          exercise.text,
          LangCode.ENGLISH,
          DialectCode.AMERICAN_ENGLISH,
          exercise.score
        )
      }

      const response = await request(testApp).get('/api/v1/leaderboard').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      const data = response.body.data

      // Total weighted length: 2.0 + 8.8 + 15.0 = 25.8
      // Total XP: 25.8 * PRONUNCIATION_EXERCISE_FACTOR (rounded)
      const totalWeightedLength = 2.0 + 8.8 + 15.0
      const expectedTotalXp = Math.round(totalWeightedLength * PRONUNCIATION_EXERCISE_FACTOR)

      expect(data.xp.allTime).toEqual([
        {
          nickname: null,
          xp: expectedTotalXp,
        },
      ])
    })

    test('multiple exercises in the same language are aggregated correctly', async () => {
      const {
        token,
        testApp,
        id: userId,
      } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      // Create multiple English exercises
      await createPronunciationExerciseWithAttempt(
        userId,
        'First exercise',
        LangCode.ENGLISH,
        DialectCode.AMERICAN_ENGLISH,
        0.9
      )

      await createPronunciationExerciseWithAttempt(
        userId,
        'Second exercise',
        LangCode.ENGLISH,
        DialectCode.BRITISH_ENGLISH, // Different dialect, same language
        0.8
      )

      const response = await request(testApp).get('/api/v1/leaderboard').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      const data = response.body.data

      // Both exercises should be aggregated under English
      const expectedXp1 = calculateExpectedXp('First exercise', 0.9)
      const expectedXp2 = calculateExpectedXp('Second exercise', 0.8)
      const totalXp = expectedXp1 + expectedXp2

      expect(data.xp.allTime).toEqual([
        {
          nickname: null,
          xp: totalXp,
        },
      ])

      expect(data.xp.byLanguage).toEqual({
        en: {
          allTime: [
            {
              nickname: null,
              xp: totalXp,
            },
          ],
          weekly: [
            {
              nickname: null,
              xp: totalXp,
            },
          ],
        },
      })
    })
  })
})
