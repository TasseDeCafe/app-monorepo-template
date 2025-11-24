import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PronunciationEvaluationExerciseRepository } from './pronunciation-evaluation-exercise-repository'
import { LangCode, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { __createUserInSupabaseAndGetHisIdAndToken, __removeAllAuthUsersFromSupabase } from '../../../test/test-utils'

describe('Pronunciation Exercise Repository Integration Tests', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  afterEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  describe('createPronunciationExercise', () => {
    it('should create a pronunciation exercise and return the ID', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )

      expect(result.isSuccess).toBe(true)
      expect(result.exerciseId).toBeTypeOf('string')
      expect(result.exerciseId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) // UUID pattern
    })

    it('should create a pronunciation exercise with dialect and return the ID', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.BRITISH_ENGLISH
      )

      expect(result.isSuccess).toBe(true)
      expect(result.exerciseId).toBeTypeOf('string')
      expect(result.exerciseId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) // UUID pattern
    })

    it('should fail for invalid user ID', async () => {
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.createPronunciationExercise(
        'invalid-user-id',
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )

      expect(result.isSuccess).toBe(false)
      expect(result.exerciseId).toBeNull()
    })

    it('should fail for dialect with length less than 5 characters', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'test' as any // 4 characters - should fail
      )

      expect(result.isSuccess).toBe(false)
      expect(result.exerciseId).toBeNull()
    })

    it('should fail for dialect with length greater than 10 characters', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'verylongtest' as any // 12 characters - should fail due to VARCHAR(10) limit
      )

      expect(result.isSuccess).toBe(false)
      expect(result.exerciseId).toBeNull()
    })
  })

  describe('createPronunciationAttempt', () => {
    it('should create a pronunciation attempt for an existing exercise', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )
      expect(exerciseResult.isSuccess).toBe(true)

      const attemptResult = await repository.createPronunciationAttempt(exerciseResult.exerciseId!, 'Hello world', 0.95)

      expect(attemptResult).toBe(true)
    })

    it('should require non-null scores', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )

      if (!exerciseResult.isSuccess) {
        throw new Error('Failed to create exercise')
      }

      // TypeScript should prevent passing null values, but if somehow null values are passed,
      // the database should reject them since the fields are NOT NULL
      const attemptResult = await repository.createPronunciationAttempt(
        exerciseResult.exerciseId,
        'some user parsed input',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any
      )

      expect(attemptResult).toBe(false)
    })

    it('should require non-null user parsed input', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )

      if (!exerciseResult.isSuccess) {
        throw new Error('Failed to create exercise')
      }

      // TypeScript should prevent passing null values, but if somehow null values are passed,
      // the database should reject them since the fields are NOT NULL
      const attemptResult = await repository.createPronunciationAttempt(
        exerciseResult.exerciseId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any,
        0
      )

      expect(attemptResult).toBe(false)
    })

    it('should allow empty strings as user parsed input', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )

      if (!exerciseResult.isSuccess) {
        throw new Error('Failed to create exercise')
      }

      const attemptResult = await repository.createPronunciationAttempt(exerciseResult.exerciseId, '', 0)

      expect(attemptResult).toBe(true)
    })

    it('should fail for non-existent exercise ID', async () => {
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.createPronunciationAttempt(
        '00000000-0000-0000-0000-000000000000',
        'Hello world',
        0.95
      )

      expect(result).toBe(false)
    })
  })

  describe('retrievePronunciationExercises', () => {
    it('should retrieve exercises with their attempts', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      // Create exercises
      const exercise1 = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )
      // We don't need to create the second exercise, we're just checking that the first one is returned
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exercise2 = await repository.createPronunciationExercise(
        testUserId,
        LangCode.SPANISH,
        'Hola mundo',
        DialectCode.CASTILIAN_SPANISH
      )

      // Create attempts for first exercise
      await repository.createPronunciationAttempt(exercise1.exerciseId!, 'Hello world', 0.95)
      await repository.createPronunciationAttempt(exercise1.exerciseId!, 'Hello earth', 0.85)

      const result = await repository.retrievePronunciationExercises(testUserId)

      expect(result.isSuccess).toBe(true)
      expect(result.exercises).toHaveLength(2)

      // Check that exercises are returned in descending order (newest first)
      const firstExercise = result.exercises![0]
      expect(firstExercise.text).toBe('Hola mundo')
      expect(firstExercise.attempts).toHaveLength(0)

      const secondExercise = result.exercises![1]
      expect(secondExercise.text).toBe('Hello world')
      expect(secondExercise.attempts).toHaveLength(2)
      expect(secondExercise.attempts[0].user_parsed_input).toBe('Hello earth') // newest first
      expect(secondExercise.attempts[1].user_parsed_input).toBe('Hello world')
    })

    it('should retrieve exercises with dialect information', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      // Create exercise with dialect
      await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.BRITISH_ENGLISH
      )
      // Create exercise with different dialect
      await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello there',
        DialectCode.AMERICAN_ENGLISH
      )

      const result = await repository.retrievePronunciationExercises(testUserId)

      expect(result.isSuccess).toBe(true)
      expect(result.exercises).toHaveLength(2)

      // Check that dialect information is properly retrieved
      const exerciseWithBritishDialect = result.exercises!.find((ex) => ex.text === 'Hello world')
      const exerciseWithAmericanDialect = result.exercises!.find((ex) => ex.text === 'Hello there')

      expect(exerciseWithBritishDialect!.dialect).toBe(DialectCode.BRITISH_ENGLISH)
      expect(exerciseWithAmericanDialect!.dialect).toBe(DialectCode.AMERICAN_ENGLISH)
    })

    it('should support pagination', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      // Create 3 exercises
      await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Exercise 1',
        DialectCode.AMERICAN_ENGLISH
      )
      await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Exercise 2',
        DialectCode.AMERICAN_ENGLISH
      )
      await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Exercise 3',
        DialectCode.AMERICAN_ENGLISH
      )

      const result = await repository.retrievePronunciationExercises(testUserId, undefined, 2)

      expect(result.isSuccess).toBe(true)
      expect(result.exercises).toHaveLength(2)
      expect(result.nextCursor).toBeTruthy()
      expect(result.nextCursor).toBeTypeOf('string')
    })

    it('should filter by language', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )
      await repository.createPronunciationExercise(
        testUserId,
        LangCode.SPANISH,
        'Hola mundo',
        DialectCode.CASTILIAN_SPANISH
      )

      const result = await repository.retrievePronunciationExercises(testUserId, undefined, 50, LangCode.SPANISH)

      expect(result.isSuccess).toBe(true)
      expect(result.exercises).toHaveLength(1)
      expect(result.exercises![0].text).toBe('Hola mundo')
    })

    it('should return empty result for non-existent user', async () => {
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.retrievePronunciationExercises('non-existent-user')

      expect(result.isSuccess).toBe(false)
      expect(result.exercises).toBeNull()
      expect(result.nextCursor).toBeNull()
    })
  })

  describe('retrieveExerciseById', () => {
    it('should retrieve a specific exercise by ID with attempts', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )
      expect(exerciseResult.isSuccess).toBe(true)
      const exerciseId = exerciseResult.exerciseId!

      await repository.createPronunciationAttempt(exerciseId, 'Hello world', 0.95)
      await repository.createPronunciationAttempt(exerciseId, 'Hello earth', 0.85)

      const result = await repository.retrieveExerciseByIdAndUserId(testUserId, exerciseId)

      expect(result.isSuccess).toBe(true)
      expect(result.exercise!.id).toBe(exerciseId)
      expect(result.exercise!.text).toBe('Hello world')
      expect(result.exercise!.language).toBe(LangCode.ENGLISH)
      expect(result.exercise!.attempts).toHaveLength(2)
      expect(result.exercise!.attempts[0].user_parsed_input).toBe('Hello earth') // newest first
      expect(result.exercise!.attempts[1].user_parsed_input).toBe('Hello world')
    })

    it('should retrieve exercise with dialect information', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AUSTRALIAN_ENGLISH
      )
      expect(exerciseResult.isSuccess).toBe(true)
      const exerciseId = exerciseResult.exerciseId!

      const result = await repository.retrieveExerciseByIdAndUserId(testUserId, exerciseId)

      expect(result.isSuccess).toBe(true)
      expect(result.exercise!.dialect).toBe(DialectCode.AUSTRALIAN_ENGLISH)
    })

    it('should retrieve exercise with no attempts', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId,
        LangCode.SPANISH,
        'Hola mundo',
        DialectCode.MEXICAN_SPANISH
      )
      expect(exerciseResult.isSuccess).toBe(true)
      const exerciseId = exerciseResult.exerciseId!

      const result = await repository.retrieveExerciseByIdAndUserId(testUserId, exerciseId)

      expect(result.isSuccess).toBe(true)
      expect(result.exercise!.id).toBe(exerciseId)
      expect(result.exercise!.text).toBe('Hola mundo')
      expect(result.exercise!.language).toBe(LangCode.SPANISH)
      expect(result.exercise!.dialect).toBe(DialectCode.MEXICAN_SPANISH)
      expect(result.exercise!.attempts).toHaveLength(0)
    })

    it('should return failure for non-existent exercise ID', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const repository = PronunciationEvaluationExerciseRepository()

      const result = await repository.retrieveExerciseByIdAndUserId(testUserId, '00000000-0000-0000-0000-000000000000')

      expect(result.isSuccess).toBe(false)
      expect(result.exercise).toBeNull()
    })

    it('should return failure when exercise belongs to different user', async () => {
      const { id: testUserId1 } = await __createUserInSupabaseAndGetHisIdAndToken()
      const { id: testUserId2 } = await __createUserInSupabaseAndGetHisIdAndToken('email2@gmail.com')
      const repository = PronunciationEvaluationExerciseRepository()

      const exerciseResult = await repository.createPronunciationExercise(
        testUserId1,
        LangCode.ENGLISH,
        'Hello world',
        DialectCode.AMERICAN_ENGLISH
      )
      expect(exerciseResult.isSuccess).toBe(true)
      const exerciseId = exerciseResult.exerciseId!

      const result = await repository.retrieveExerciseByIdAndUserId(testUserId2, exerciseId)

      expect(result.isSuccess).toBe(false)
      expect(result.exercise).toBeNull()
    })
  })
})
