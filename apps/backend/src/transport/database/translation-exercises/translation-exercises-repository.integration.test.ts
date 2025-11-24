import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TranslationExercisesRepository, DbTranslationExercise } from './translation-exercises-repository'
import { LangCode, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { __createUserInSupabaseAndGetHisIdAndToken, __removeAllAuthUsersFromSupabase } from '../../../test/test-utils'
import { sql } from '../postgres-client'

describe('Translation Exercises Repository Integration Tests', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await sql`DELETE FROM translation_exercises`
  })

  afterEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await sql`DELETE FROM translation_exercises`
  })

  describe('createTranslationExercise', () => {
    it('should create a translation exercise successfully', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const result = await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.GERMAN,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_GERMAN,
        motherLanguageSentence: 'I like to go for walks.',
        studyLanguageSentence: 'Ich gehe gerne spazieren.',
      })

      expect(result).not.toBeNull()
      expect(result!.user_id).toBe(testUserId)
      expect(result!.study_language).toBe(LangCode.GERMAN)
      expect(result!.mother_language).toBe(LangCode.ENGLISH)
      expect(result!.mother_language_sentence).toBe('I like to go for walks.')
      expect(result!.study_language_sentence).toBe('Ich gehe gerne spazieren.')
      expect(result!.completed_at).toBeNull()
      expect(result!.skipped).toBe(false)
      expect(typeof result!.id).toBe('string')
      expect(result!.dialect).toBe(DialectCode.STANDARD_GERMAN)
    })

    it('should return null when creating exercise fails', async () => {
      const translationExercisesRepository = TranslationExercisesRepository()

      const result = await translationExercisesRepository.createTranslationExercise({
        userId: 'non-existent-user',
        studyLanguage: LangCode.GERMAN,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_GERMAN,
        motherLanguageSentence: 'Test sentence',
        studyLanguageSentence: 'Test Satz',
      })

      expect(result).toBeNull()
    })
  })

  describe('completeTranslationExercise', () => {
    it('should complete a translation exercise with full data', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercise = await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.GERMAN,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_GERMAN,
        motherLanguageSentence: 'I like to go for walks.',
        studyLanguageSentence: 'Ich gehe gerne spazieren.',
      })

      expect(exercise).not.toBeNull()

      const result = await translationExercisesRepository.completeTranslationExercise({
        exerciseId: exercise!.id,
        userTranslation: 'Ich mag es, spazieren zu gehen.',
        skipped: false,
        selectedGrammarPatterns: [
          { structure: 'like to go', concept: 'expressing preference' },
          { structure: 'for walks', concept: 'purpose expression' },
        ],
      })

      expect(result).toBe(true)

      const exercises = await translationExercisesRepository.getPreviousExercises(
        testUserId,
        LangCode.GERMAN,
        LangCode.ENGLISH,
        DialectCode.STANDARD_GERMAN,
        1
      )
      expect(exercises).toHaveLength(1)
      expect(exercises[0].user_translation).toBe('Ich mag es, spazieren zu gehen.')
      expect(exercises[0].skipped).toBe(false)
      expect(exercises[0].grammar_patterns).toEqual(
        JSON.stringify([
          { structure: 'like to go', concept: 'expressing preference' },
          { structure: 'for walks', concept: 'purpose expression' },
        ])
      )
      expect(exercises[0].completed_at).not.toBeNull()
    })

    it('should complete a translation exercise with minimal data', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercise = await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.SPANISH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.CASTILIAN_SPANISH,
        motherLanguageSentence: 'How are you?',
        studyLanguageSentence: '¿Cómo estás?',
      })

      const result = await translationExercisesRepository.completeTranslationExercise({
        exerciseId: exercise!.id,
        skipped: true,
      })

      expect(result).toBe(true)

      const exercises = await translationExercisesRepository.getPreviousExercises(
        testUserId,
        LangCode.SPANISH,
        LangCode.ENGLISH,
        DialectCode.CASTILIAN_SPANISH,
        1
      )
      expect(exercises).toHaveLength(1)
      expect(exercises[0].skipped).toBe(true)
      expect(exercises[0].user_translation).toBeNull()
      expect(exercises[0].grammar_patterns).toEqual(JSON.stringify([]))
    })

    it('should return false when completing non-existent exercise', async () => {
      const translationExercisesRepository = TranslationExercisesRepository()

      const result = await translationExercisesRepository.completeTranslationExercise({
        exerciseId: 'non-existent-uuid',
        skipped: true,
      })

      expect(result).toBe(false)
    })
  })

  describe('getPreviousExercises', () => {
    it('should retrieve previous exercises in reverse chronological order', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercise1 = await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.FRENCH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.PARISIAN_FRENCH,
        motherLanguageSentence: 'Hello world',
        studyLanguageSentence: 'Bonjour le monde',
      })

      const exercise2 = await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.FRENCH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.PARISIAN_FRENCH,
        motherLanguageSentence: 'Good morning',
        studyLanguageSentence: 'Bonjour',
      })

      await translationExercisesRepository.completeTranslationExercise({
        exerciseId: exercise1!.id,
        skipped: false,
      })

      await translationExercisesRepository.completeTranslationExercise({
        exerciseId: exercise2!.id,
        skipped: false,
      })

      const exercises = await translationExercisesRepository.getPreviousExercises(
        testUserId,
        LangCode.FRENCH,
        LangCode.ENGLISH,
        DialectCode.PARISIAN_FRENCH,
        10
      )

      expect(exercises).toHaveLength(2)
      expect(exercises[0].mother_language_sentence).toBe('Good morning')
      expect(exercises[1].mother_language_sentence).toBe('Hello world')
    })

    it('should filter exercises by user and language pair', async () => {
      const { id: user1Id } = await __createUserInSupabaseAndGetHisIdAndToken('user1@test.com')
      const { id: user2Id } = await __createUserInSupabaseAndGetHisIdAndToken('user2@test.com')
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercise1 = await translationExercisesRepository.createTranslationExercise({
        userId: user1Id,
        studyLanguage: LangCode.GERMAN,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_GERMAN,
        motherLanguageSentence: 'Test 1',
        studyLanguageSentence: 'Test 1 German',
      })

      const exercise2 = await translationExercisesRepository.createTranslationExercise({
        userId: user2Id,
        studyLanguage: LangCode.GERMAN,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_GERMAN,
        motherLanguageSentence: 'Test 2',
        studyLanguageSentence: 'Test 2 German',
      })

      const exercise3 = await translationExercisesRepository.createTranslationExercise({
        userId: user1Id,
        studyLanguage: LangCode.SPANISH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.CASTILIAN_SPANISH,
        motherLanguageSentence: 'Test 3',
        studyLanguageSentence: 'Test 3 Spanish',
      })

      await Promise.all([
        translationExercisesRepository.completeTranslationExercise({ exerciseId: exercise1!.id, skipped: false }),
        translationExercisesRepository.completeTranslationExercise({ exerciseId: exercise2!.id, skipped: false }),
        translationExercisesRepository.completeTranslationExercise({ exerciseId: exercise3!.id, skipped: false }),
      ])

      const user1GermanExercises = await translationExercisesRepository.getPreviousExercises(
        user1Id,
        LangCode.GERMAN,
        LangCode.ENGLISH,
        DialectCode.STANDARD_GERMAN,
        10
      )

      expect(user1GermanExercises).toHaveLength(1)
      expect(user1GermanExercises[0].mother_language_sentence).toBe('Test 1')
    })

    it('should respect the limit parameter', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercises = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          translationExercisesRepository.createTranslationExercise({
            userId: testUserId,
            studyLanguage: LangCode.ITALIAN,
            motherLanguage: LangCode.ENGLISH,
            dialect: DialectCode.STANDARD_ITALIAN,
            motherLanguageSentence: `Test sentence ${i + 1}`,
            studyLanguageSentence: `Frase di test ${i + 1}`,
          })
        )
      )

      await Promise.all(
        exercises.map((exercise) =>
          translationExercisesRepository.completeTranslationExercise({ exerciseId: exercise!.id, skipped: false })
        )
      )

      const limitedExercises = await translationExercisesRepository.getPreviousExercises(
        testUserId,
        LangCode.ITALIAN,
        LangCode.ENGLISH,
        DialectCode.STANDARD_ITALIAN,
        3
      )

      expect(limitedExercises).toHaveLength(3)
    })

    it('should only return completed exercises', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercise1 = await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.PORTUGUESE,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.EUROPEAN_PORTUGUESE,
        motherLanguageSentence: 'Completed exercise',
        studyLanguageSentence: 'Exercício concluído',
      })

      await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.PORTUGUESE,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.EUROPEAN_PORTUGUESE,
        motherLanguageSentence: 'Incomplete exercise',
        studyLanguageSentence: 'Exercício incompleto',
      })

      // Complete only the first exercise
      await translationExercisesRepository.completeTranslationExercise({
        exerciseId: exercise1!.id,
        skipped: false,
      })

      const exercises = await translationExercisesRepository.getPreviousExercises(
        testUserId,
        LangCode.PORTUGUESE,
        LangCode.ENGLISH,
        DialectCode.EUROPEAN_PORTUGUESE,
        10
      )

      expect(exercises).toHaveLength(1)
      expect(exercises[0].mother_language_sentence).toBe('Completed exercise')
    })

    it('should return empty array for non-existent user', async () => {
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercises = await translationExercisesRepository.getPreviousExercises(
        'non-existent-user',
        LangCode.GERMAN,
        LangCode.ENGLISH,
        DialectCode.STANDARD_GERMAN,
        10
      )

      expect(exercises).toEqual([])
    })
  })

  describe('getLatestExercisesForRandomSelection', () => {
    it('should retrieve latest exercises with default limit of 100', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercises: DbTranslationExercise[] = []
      for (let i = 0; i < 5; i++) {
        const exercise = await translationExercisesRepository.createTranslationExercise({
          userId: testUserId,
          studyLanguage: LangCode.DUTCH,
          motherLanguage: LangCode.ENGLISH,
          dialect: DialectCode.STANDARD_DUTCH,
          motherLanguageSentence: `Random selection test ${i + 1}`,
          studyLanguageSentence: `Willekeurige selectie test ${i + 1}`,
        })

        await translationExercisesRepository.completeTranslationExercise({
          exerciseId: exercise!.id,
          skipped: false,
        })

        exercises.push(exercise!)
      }

      const latestExercises = await translationExercisesRepository.getLatestExercisesForRandomSelection(
        testUserId,
        LangCode.DUTCH,
        LangCode.ENGLISH,
        DialectCode.STANDARD_DUTCH
      )

      expect(latestExercises).toHaveLength(5)
      expect(latestExercises[0].mother_language_sentence).toBe('Random selection test 5')
    })

    it('should respect custom limit parameter', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercises: DbTranslationExercise[] = []
      for (let i = 0; i < 10; i++) {
        const exercise = await translationExercisesRepository.createTranslationExercise({
          userId: testUserId,
          studyLanguage: LangCode.SWEDISH,
          motherLanguage: LangCode.ENGLISH,
          dialect: DialectCode.STANDARD_SWEDISH,
          motherLanguageSentence: `Limit test ${i + 1}`,
          studyLanguageSentence: `Gräns test ${i + 1}`,
        })

        await translationExercisesRepository.completeTranslationExercise({
          exerciseId: exercise!.id,
          skipped: false,
        })

        exercises.push(exercise!)
      }

      const limitedExercises = await translationExercisesRepository.getLatestExercisesForRandomSelection(
        testUserId,
        LangCode.SWEDISH,
        LangCode.ENGLISH,
        DialectCode.STANDARD_SWEDISH,
        3
      )

      expect(limitedExercises).toHaveLength(3)
      expect(limitedExercises[0].mother_language_sentence).toBe('Limit test 10')
      expect(limitedExercises[1].mother_language_sentence).toBe('Limit test 9')
      expect(limitedExercises[2].mother_language_sentence).toBe('Limit test 8')
    })
  })

  describe('getIncompleteExercise', () => {
    it('should retrieve the oldest incomplete exercise for a user and study language', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.POLISH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_POLISH,
        motherLanguageSentence: 'First incomplete',
        studyLanguageSentence: 'Pierwszy niekompletny',
      })

      await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.POLISH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_POLISH,
        motherLanguageSentence: 'Second incomplete',
        studyLanguageSentence: 'Drugi niekompletny',
      })

      const incompleteExercise = await translationExercisesRepository.getIncompleteExercise(
        testUserId,
        LangCode.POLISH,
        DialectCode.STANDARD_POLISH
      )

      expect(incompleteExercise).not.toBeNull()
      expect(incompleteExercise!.mother_language_sentence).toBe('First incomplete')
      expect(incompleteExercise!.completed_at).toBeNull()
    })

    it('should return null when no incomplete exercises exist', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      const exercise = await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.RUSSIAN,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_RUSSIAN,
        motherLanguageSentence: 'Completed exercise',
        studyLanguageSentence: 'Завершенное упражнение',
      })

      await translationExercisesRepository.completeTranslationExercise({
        exerciseId: exercise!.id,
        skipped: false,
      })

      const incompleteExercise = await translationExercisesRepository.getIncompleteExercise(
        testUserId,
        LangCode.RUSSIAN,
        DialectCode.STANDARD_RUSSIAN
      )

      expect(incompleteExercise).toBeNull()
    })

    it('should filter by study language correctly', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const translationExercisesRepository = TranslationExercisesRepository()

      await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.CZECH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_CZECH,
        motherLanguageSentence: 'Czech exercise',
        studyLanguageSentence: 'České cvičení',
      })

      await translationExercisesRepository.createTranslationExercise({
        userId: testUserId,
        studyLanguage: LangCode.FINNISH,
        motherLanguage: LangCode.ENGLISH,
        dialect: DialectCode.STANDARD_FINNISH,
        motherLanguageSentence: 'Finnish exercise',
        studyLanguageSentence: 'Suomen harjoitus',
      })

      const czechIncomplete = await translationExercisesRepository.getIncompleteExercise(
        testUserId,
        LangCode.CZECH,
        DialectCode.STANDARD_CZECH
      )
      const finnishIncomplete = await translationExercisesRepository.getIncompleteExercise(
        testUserId,
        LangCode.FINNISH,
        DialectCode.STANDARD_FINNISH
      )

      expect(czechIncomplete).not.toBeNull()
      expect(czechIncomplete!.study_language).toBe(LangCode.CZECH)
      expect(finnishIncomplete).not.toBeNull()
      expect(finnishIncomplete!.study_language).toBe(LangCode.FINNISH)
    })

    it('should return null for non-existent user', async () => {
      const translationExercisesRepository = TranslationExercisesRepository()

      const incompleteExercise = await translationExercisesRepository.getIncompleteExercise(
        'non-existent-user',
        LangCode.GERMAN,
        DialectCode.STANDARD_GERMAN
      )

      expect(incompleteExercise).toBeNull()
    })
  })
})
