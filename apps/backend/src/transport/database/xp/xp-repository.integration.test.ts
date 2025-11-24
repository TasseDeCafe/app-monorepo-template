import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XpRepository } from './xp-repository'
import { PronunciationEvaluationExerciseRepository } from '../pronunciation-exercises/pronunciation-evaluation-exercise-repository'
import { LangCode, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { __createUserInSupabaseAndGetHisIdAndToken, __removeAllAuthUsersFromSupabase } from '../../../test/test-utils'

describe('XP Repository Integration Tests', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  afterEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  describe('getDailyWeightedLengths', () => {
    it('should return empty array when user has no pronunciation attempts', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const xpRepository = XpRepository()

      const result = await xpRepository.getDailyWeightedLengths(testUserId)

      expect(result.isSuccess).toBe(true)
      expect(result.dailyData).toEqual([])
    })

    it('should group attempts by date and sum weighted lengths correctly', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const pronunciationRepository = PronunciationEvaluationExerciseRepository()
      const xpRepository = XpRepository()

      const exerciseResult = await pronunciationRepository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world test',
        DialectCode.AMERICAN_ENGLISH
      )
      expect(exerciseResult.isSuccess).toBe(true)

      // Create multiple attempts on the same day
      await pronunciationRepository.createPronunciationAttempt(exerciseResult.exerciseId!, 'Hello world test', 0.8)
      await pronunciationRepository.createPronunciationAttempt(exerciseResult.exerciseId!, 'Hello world test', 0.6)

      const result = await xpRepository.getDailyWeightedLengths(testUserId)

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.dailyData).toHaveLength(1)

        const [todayData] = result.dailyData
        expect(todayData.date).toBeDefined()
        // "Hello world test" = 16 characters: 16 * 0.8 + 16 * 0.6 = 12.8 + 9.6 = 22.4
        expect(todayData.total_weighted_length).toBe(22.4)
      } else {
        throw new Error('Unexpected error')
      }
    })

    it('should handle different exercise text lengths on same day', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const pronunciationRepository = PronunciationEvaluationExerciseRepository()
      const xpRepository = XpRepository()

      const shortExercise = await pronunciationRepository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hi',
        DialectCode.AMERICAN_ENGLISH
      )
      const longExercise = await pronunciationRepository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'This is a much longer sentence.',
        DialectCode.AMERICAN_ENGLISH
      )

      await pronunciationRepository.createPronunciationAttempt(shortExercise.exerciseId!, 'Hi', 0.9)
      await pronunciationRepository.createPronunciationAttempt(
        longExercise.exerciseId!,
        'This is a much longer sentence.',
        0.7
      )

      const result = await xpRepository.getDailyWeightedLengths(testUserId)

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.dailyData).toHaveLength(1)
        const [todayData] = result.dailyData
        // "Hi" = 2 characters: 2 * 0.9 = 1.8
        // "This is a much longer sentence." = 31 characters: 31 * 0.7 = 21.7
        // Total = 1.8 + 21.7 = 23.5
        expect(todayData.total_weighted_length).toBe(23.5)
      } else {
        throw new Error('Unexpected error')
      }
    })

    it('should only include attempts from the specified user', async () => {
      const { id: testUserId1 } = await __createUserInSupabaseAndGetHisIdAndToken('user1@test.com')
      const { id: testUserId2 } = await __createUserInSupabaseAndGetHisIdAndToken('user2@test.com')
      const pronunciationRepository = PronunciationEvaluationExerciseRepository()
      const xpRepository = XpRepository()

      const exercise1 = await pronunciationRepository.createPronunciationExercise(
        testUserId1,
        LangCode.ENGLISH,
        'User 1 exercise',
        DialectCode.AMERICAN_ENGLISH
      )
      const exercise2 = await pronunciationRepository.createPronunciationExercise(
        testUserId2,
        LangCode.ENGLISH,
        'User 2 exercise',
        DialectCode.AMERICAN_ENGLISH
      )

      await pronunciationRepository.createPronunciationAttempt(exercise1.exerciseId!, 'User 1 exercise', 0.8)
      await pronunciationRepository.createPronunciationAttempt(exercise2.exerciseId!, 'User 2 exercise', 0.9)

      const result = await xpRepository.getDailyWeightedLengths(testUserId1)

      if (result.isSuccess) {
        expect(result.dailyData).toHaveLength(1)
        const [todayData] = result.dailyData
        // Only user 1's attempt: "User 1 exercise" = 15 characters * 0.8 = 12
        expect(todayData.total_weighted_length).toBe(12)
      } else {
        throw new Error('Unexpected error')
      }
    })

    it('should handle zero scores correctly', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const pronunciationRepository = PronunciationEvaluationExerciseRepository()
      const xpRepository = XpRepository()

      const exerciseResult = await pronunciationRepository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Test exercise',
        DialectCode.AMERICAN_ENGLISH
      )

      await pronunciationRepository.createPronunciationAttempt(exerciseResult.exerciseId!, 'Test exercise', 0.0)
      await pronunciationRepository.createPronunciationAttempt(exerciseResult.exerciseId!, 'Test exercise', 0.5)

      const result = await xpRepository.getDailyWeightedLengths(testUserId)

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.dailyData).toHaveLength(1)
        const [todayData] = result.dailyData
        // "Test exercise" = 13 characters: 13 * 0.0 + 13 * 0.5 = 0 + 6.5 = 6.5
        expect(todayData.total_weighted_length).toBe(6.5)
      } else {
        throw new Error('Unexpected error')
      }
    })

    it('should return data sorted by date in ascending order', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const pronunciationRepository = PronunciationEvaluationExerciseRepository()
      const xpRepository = XpRepository()

      const exerciseResult = await pronunciationRepository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Test',
        DialectCode.AMERICAN_ENGLISH
      )

      await pronunciationRepository.createPronunciationAttempt(exerciseResult.exerciseId!, 'Test', 0.8)
      await pronunciationRepository.createPronunciationAttempt(exerciseResult.exerciseId!, 'Test', 0.9)

      const result = await xpRepository.getDailyWeightedLengths(testUserId)
      if (result.isSuccess) {
        const [todayData] = result.dailyData
        expect(todayData.date).toBeDefined()
        expect(typeof todayData.total_weighted_length).toBe('number')
        // "Test" = 4 characters: 4 * 0.8 + 4 * 0.9 = 3.2 + 3.6 = 6.8
        expect(todayData.total_weighted_length).toBe(6.8)
      } else {
        throw new Error('Unexpected error')
      }
    })

    it('should handle invalid user ID gracefully', async () => {
      const xpRepository = XpRepository()
      const invalidUserId = 'invalid-uuid'

      const result = await xpRepository.getDailyWeightedLengths(invalidUserId)

      expect(result.isSuccess).toBe(false)
      expect(result.dailyData).toBeNull()
    })
  })
})
