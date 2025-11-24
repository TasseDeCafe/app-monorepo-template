import { sql } from '../postgres-client'
import { LangCode, SupportedStudyLanguage, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { logCustomErrorMessageAndError, logWithSentry } from '../../third-party/sentry/error-monitoring'
import { GrammarPattern } from '@yourbestaccent/api-client/orpc-contracts/translation-exercise-contract'

export interface DbGrammarPattern {
  structure: string
  concept: string
}

/**
 * Converts GrammarPattern (with optional hint) to DbGrammarPattern (without hint)
 * This ensures we don't store hints in the database as they're not needed for exercise generation
 */
export const mapGrammarPatternToDbGrammarPattern = (pattern: GrammarPattern): DbGrammarPattern => ({
  structure: pattern.structure,
  concept: pattern.concept,
})

/**
 * Converts an array of GrammarPattern to DbGrammarPattern, filtering out hints
 */
export const mapGrammarPatternsToDbGrammarPatterns = (patterns: GrammarPattern[]): DbGrammarPattern[] =>
  patterns.map(mapGrammarPatternToDbGrammarPattern)

export interface DbTranslationExercise {
  id: string
  user_id: string
  study_language: SupportedStudyLanguage
  mother_language: LangCode
  dialect: DialectCode
  mother_language_sentence: string
  study_language_sentence: string
  user_translation: string | null
  user_translation_attempt: string | null
  skipped: boolean
  created_at: Date
  completed_at: Date | null
  grammar_patterns: DbGrammarPattern[] | null
}

export interface DbSelection {
  id: string
  translation_exercise_id: string
  selection_chunks: string[]
  selection_positions: number[]
  language: string
  created_at: Date
}

export interface CreateSelectionParams {
  translationExerciseId: string
  selections: Array<{
    selection_chunks: string[]
    selection_positions: number[]
    language: string
  }>
}

export interface CreateTranslationExerciseParams {
  userId: string
  studyLanguage: SupportedStudyLanguage
  motherLanguage: LangCode
  dialect: DialectCode
  motherLanguageSentence: string
  studyLanguageSentence: string
}

export interface CompleteTranslationExerciseParams {
  exerciseId: string
  userTranslation?: string
  skipped: boolean
  selectedGrammarPatterns?: DbGrammarPattern[]
}

export interface RetrieveTranslationExercisesResult {
  isSuccess: boolean
  exercises?: DbTranslationExercise[]
  nextCursor?: string | null
}

export interface TranslationExercisesRepositoryInterface {
  createTranslationExercise: (params: CreateTranslationExerciseParams) => Promise<DbTranslationExercise | null>
  completeTranslationExercise: (params: CompleteTranslationExerciseParams) => Promise<boolean>
  retrieveExerciseByIdAndUserId: (userId: string, exerciseId: string) => Promise<DbTranslationExercise | null>
  retrieveTranslationExercises: (
    userId: string,
    cursor?: string,
    limit?: number,
    languageFilter?: SupportedStudyLanguage
  ) => Promise<RetrieveTranslationExercisesResult>
  getPreviousExercises: (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode,
    limit: number
  ) => Promise<DbTranslationExercise[]>
  getLatestExercisesForRandomSelection: (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode,
    limit?: number
  ) => Promise<DbTranslationExercise[]>
  getIncompleteExercise: (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    dialect: DialectCode
  ) => Promise<DbTranslationExercise | null>
  createSelections: (params: CreateSelectionParams) => Promise<DbSelection[]>
  getSelectionsByExerciseId: (exerciseId: string) => Promise<DbSelection[]>
}

export const TranslationExercisesRepository = (): TranslationExercisesRepositoryInterface => {
  const createTranslationExercise = async (
    params: CreateTranslationExerciseParams
  ): Promise<DbTranslationExercise | null> => {
    try {
      const result: DbTranslationExercise[] = await sql`
        INSERT INTO translation_exercises (
          user_id, 
          study_language, 
          mother_language, 
          dialect,
          mother_language_sentence, 
          study_language_sentence
        )
        VALUES (
          ${params.userId}, 
          ${params.studyLanguage}, 
          ${params.motherLanguage}, 
          ${params.dialect},
          ${params.motherLanguageSentence}, 
          ${params.studyLanguageSentence}
        )
        RETURNING *
      `

      return result[0] || null
    } catch (error) {
      logCustomErrorMessageAndError('Error creating translation exercise', error)
      return null
    }
  }

  const completeTranslationExercise = async (params: CompleteTranslationExerciseParams): Promise<boolean> => {
    try {
      const result = await sql`
        UPDATE translation_exercises 
        SET 
          user_translation = ${params.userTranslation || null},
          skipped = ${params.skipped},
          grammar_patterns = ${JSON.stringify(params.selectedGrammarPatterns || [])},
          completed_at = NOW()
        WHERE id = ${params.exerciseId}
      `
      return result.count === 1
    } catch (error) {
      logWithSentry({
        message: 'Error completing translation exercise',
        params: {
          exerciseId: params.exerciseId,
          userTranslation: params.userTranslation,
          skipped: params.skipped,
          selectedGrammarPatterns: params.selectedGrammarPatterns,
        },
        error,
      })
      return false
    }
  }

  const getPreviousExercises = async (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode,
    limit: number
  ): Promise<DbTranslationExercise[]> => {
    try {
      const result: DbTranslationExercise[] = await sql`
        SELECT * FROM translation_exercises 
        WHERE user_id = ${userId} 
          AND study_language = ${studyLanguage}
          AND mother_language = ${motherLanguage}
          AND dialect = ${dialect}
          AND completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT ${limit}
      `

      return result
    } catch (error) {
      logWithSentry({
        message: 'Error getting previous exercises',
        params: { userId, studyLanguage, motherLanguage, dialect, limit },
        error,
      })
      return []
    }
  }

  const getLatestExercisesForRandomSelection = async (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode,
    limit: number = 100
  ): Promise<DbTranslationExercise[]> => {
    try {
      const result: DbTranslationExercise[] = await sql`
        SELECT * FROM translation_exercises 
        WHERE user_id = ${userId} 
          AND study_language = ${studyLanguage}
          AND mother_language = ${motherLanguage}
          AND dialect = ${dialect}
          AND completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT ${limit}
      `

      return result
    } catch (error) {
      logWithSentry({
        message: 'Error getting latest exercises for random selection',
        params: { userId, studyLanguage, motherLanguage, dialect, limit },
        error,
      })
      return []
    }
  }

  const getIncompleteExercise = async (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    dialect: DialectCode
  ): Promise<DbTranslationExercise | null> => {
    try {
      const result: DbTranslationExercise[] = await sql`
        SELECT * FROM translation_exercises 
        WHERE user_id = ${userId} 
          AND study_language = ${studyLanguage}
          AND dialect = ${dialect}
          AND completed_at IS NULL
        ORDER BY created_at ASC
        LIMIT 1
      `

      return result[0] || null
    } catch (error) {
      logWithSentry({
        message: 'Error getting incomplete exercise',
        params: { userId, studyLanguage, dialect },
        error,
      })
      return null
    }
  }

  const createSelections = async (params: CreateSelectionParams): Promise<DbSelection[]> => {
    try {
      if (params.selections.length === 0) {
        return []
      }

      const results: DbSelection[] = []

      // Insert selections one by one to avoid SQL template issues with bulk inserts
      for (const selection of params.selections) {
        const result: DbSelection[] = await sql`
          INSERT INTO translation_exercise_selections (translation_exercise_id, selection_chunks, selection_positions, language)
          VALUES (
            ${params.translationExerciseId},
            ${selection.selection_chunks},
            ${selection.selection_positions},
            ${selection.language}
          )
          RETURNING *
        `

        if (result[0]) {
          results.push(result[0])
        }
      }

      return results
    } catch (error) {
      logWithSentry({
        message: 'Error creating selections',
        params: {
          translationExerciseId: params.translationExerciseId,
          selectionsCount: params.selections.length,
        },
        error,
      })
      return []
    }
  }

  const getSelectionsByExerciseId = async (exerciseId: string): Promise<DbSelection[]> => {
    try {
      const result: DbSelection[] = await sql`
        SELECT * FROM translation_exercise_selections
        WHERE translation_exercise_id = ${exerciseId}
        ORDER BY id ASC
      `

      return result
    } catch (error) {
      logWithSentry({
        message: 'Error getting selections by exercise ID',
        params: { exerciseId },
        error,
      })
      return []
    }
  }

  const retrieveExerciseByIdAndUserId = async (
    userId: string,
    exerciseId: string
  ): Promise<DbTranslationExercise | null> => {
    try {
      const result: DbTranslationExercise[] = await sql`
        SELECT * FROM translation_exercises 
        WHERE id = ${exerciseId} AND user_id = ${userId}
        LIMIT 1
      `

      return result[0] || null
    } catch (error) {
      logWithSentry({
        message: 'Error retrieving translation exercise by ID and user ID',
        params: { userId, exerciseId },
        error,
      })
      return null
    }
  }

  const retrieveTranslationExercises = async (
    userId: string,
    cursor?: string,
    limit: number = 50,
    languageFilter?: SupportedStudyLanguage
  ): Promise<RetrieveTranslationExercisesResult> => {
    try {
      const actualLimit = limit + 1 // Get one extra to check if there are more

      let query = sql`
        SELECT * FROM translation_exercises 
        WHERE user_id = ${userId} AND completed_at IS NOT NULL
      `

      if (languageFilter) {
        query = sql`
          SELECT * FROM translation_exercises 
          WHERE user_id = ${userId} 
            AND completed_at IS NOT NULL
            AND study_language = ${languageFilter}
        `
      }

      if (cursor) {
        if (languageFilter) {
          query = sql`
            SELECT * FROM translation_exercises 
            WHERE user_id = ${userId} 
              AND completed_at IS NOT NULL
              AND study_language = ${languageFilter}
              AND completed_at < ${cursor}
          `
        } else {
          query = sql`
            SELECT * FROM translation_exercises 
            WHERE user_id = ${userId} 
              AND completed_at IS NOT NULL
              AND completed_at < ${cursor}
          `
        }
      }

      const finalQuery = sql`
        ${query}
        ORDER BY completed_at DESC
        LIMIT ${actualLimit}
      `

      const result = await finalQuery

      const hasMore = result.length > limit
      const exercises = hasMore ? result.slice(0, -1) : result
      const nextCursor = hasMore && exercises.length > 0 ? exercises[exercises.length - 1].completed_at : null

      return {
        isSuccess: true,
        exercises: exercises as DbTranslationExercise[],
        nextCursor,
      }
    } catch (error) {
      logWithSentry({
        message: 'Error retrieving translation exercises',
        params: { userId, cursor, limit, languageFilter },
        error,
      })
      return {
        isSuccess: false,
      }
    }
  }

  return {
    createTranslationExercise,
    completeTranslationExercise,
    retrieveExerciseByIdAndUserId,
    retrieveTranslationExercises,
    getPreviousExercises,
    getLatestExercisesForRandomSelection,
    getIncompleteExercise,
    createSelections,
    getSelectionsByExerciseId,
  }
}
