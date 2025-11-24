import { sql } from '../postgres-client'
import { logCustomErrorMessageAndError } from '../../third-party/sentry/error-monitoring'
import { LangCode, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import {
  PronunciationExerciseRepositoryInterface,
  DbRetrievePronunciationExercisesResult,
  DbCreatePronunciationExerciseResult,
  DbPronunciationExerciseWithAttempts,
  DbRetrieveExerciseByIdResult,
} from './pronunciation-evaluation-exercise-repository-types'

export const PronunciationEvaluationExerciseRepository = (): PronunciationExerciseRepositoryInterface => {
  const createPronunciationExercise = async (
    userId: string,
    language: LangCode,
    text: string,
    dialect: DialectCode
  ): Promise<DbCreatePronunciationExerciseResult> => {
    try {
      const result = await sql`
        INSERT INTO public.pronunciation_evaluation_exercises (user_id, language, text, dialect)
        VALUES (${userId}::uuid, ${language}, ${text}, ${dialect})
        RETURNING id
      `
      return {
        isSuccess: true,
        exerciseId: result[0].id,
      }
    } catch (e) {
      logCustomErrorMessageAndError(
        `createPronunciationExercise error, userId = ${userId}, language = ${language}, text = ${text}, dialect = ${dialect}`,
        e
      )
      return {
        isSuccess: false,
        exerciseId: null,
      }
    }
  }

  const createPronunciationAttempt = async (
    exerciseId: string,
    userParsedInput: string,
    userScore: number
  ): Promise<boolean> => {
    try {
      await sql`
        INSERT INTO public.pronunciation_evaluation_attempts (pronunciation_exercise_id, user_parsed_input, user_score)
        VALUES (${exerciseId}::uuid, ${userParsedInput}, ${userScore})
      `
      return true
    } catch (e) {
      logCustomErrorMessageAndError(
        `createPronunciationAttempt error, exerciseId = ${exerciseId}, userParsedInput = ${userParsedInput}, userScore = ${userScore}`,
        e
      )
      return false
    }
  }

  const retrievePronunciationExercises = async (
    userId: string,
    cursor?: string,
    limit: number = 50,
    languageFilter?: LangCode
  ): Promise<DbRetrievePronunciationExercisesResult> => {
    try {
      const cursorCondition = cursor
        ? sql`AND pe.created_at < (SELECT created_at FROM public.pronunciation_evaluation_exercises WHERE id = ${cursor}::uuid)`
        : sql``
      const languageCondition = languageFilter ? sql`AND pe.language = ${languageFilter}` : sql``

      const result = await sql`
        WITH exercises_with_attempts AS (
          SELECT 
            pe.id,
            pe.user_id,
            pe.language,
            pe.text,
            pe.dialect,
            pe.created_at::text,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', pa.id,
                  'pronunciation_exercise_id', pa.pronunciation_exercise_id,
                  'user_parsed_input', pa.user_parsed_input,
                  'user_score', pa.user_score,
                  'created_at', pa.created_at::text
                ) ORDER BY pa.created_at DESC
              ) FILTER (WHERE pa.id IS NOT NULL),
              '[]'::json
            ) AS attempts
          FROM public.pronunciation_evaluation_exercises pe
          LEFT JOIN public.pronunciation_evaluation_attempts pa ON pe.id = pa.pronunciation_exercise_id
          WHERE pe.user_id = ${userId}::uuid ${cursorCondition} ${languageCondition}
          GROUP BY pe.id, pe.user_id, pe.language, pe.text, pe.dialect, pe.created_at
          ORDER BY pe.created_at DESC
          LIMIT ${limit + 1}
        )
        SELECT * FROM exercises_with_attempts
      `

      const hasNextPage = result.length > limit
      const exercises: DbPronunciationExerciseWithAttempts[] = result.slice(0, limit).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        language: row.language,
        text: row.text,
        dialect: row.dialect,
        created_at: row.created_at,
        attempts: row.attempts || [],
      }))
      const nextCursor = hasNextPage ? exercises[exercises.length - 1].id : null

      return {
        isSuccess: true,
        exercises,
        nextCursor,
      }
    } catch (e) {
      logCustomErrorMessageAndError(`retrievePronunciationExercises error, userId = ${userId}`, e)
      return {
        isSuccess: false,
        exercises: null,
        nextCursor: null,
      }
    }
  }

  const retrieveExerciseByIdAndUserId = async (
    userId: string,
    exerciseId: string
  ): Promise<DbRetrieveExerciseByIdResult> => {
    try {
      const result = await sql`
        WITH exercise_with_attempts AS (
          SELECT 
            pe.id,
            pe.user_id,
            pe.language,
            pe.text,
            pe.dialect,
            pe.created_at::text,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', pa.id,
                  'pronunciation_exercise_id', pa.pronunciation_exercise_id,
                  'user_parsed_input', pa.user_parsed_input,
                  'user_score', pa.user_score,
                  'created_at', pa.created_at::text
                ) ORDER BY pa.created_at DESC
              ) FILTER (WHERE pa.id IS NOT NULL),
              '[]'::json
            ) AS attempts
          FROM public.pronunciation_evaluation_exercises pe
          LEFT JOIN public.pronunciation_evaluation_attempts pa ON pe.id = pa.pronunciation_exercise_id
          WHERE pe.id = ${exerciseId}::uuid AND pe.user_id = ${userId}::uuid
          GROUP BY pe.id, pe.user_id, pe.language, pe.text, pe.dialect, pe.created_at
        )
        SELECT * FROM exercise_with_attempts
      `

      if (result.length === 0) {
        return {
          isSuccess: false,
          exercise: null,
        }
      }

      const row = result[0]
      const exercise: DbPronunciationExerciseWithAttempts = {
        id: row.id,
        user_id: row.user_id,
        language: row.language,
        text: row.text,
        dialect: row.dialect,
        created_at: row.created_at,
        attempts: row.attempts || [],
      }

      return {
        isSuccess: true,
        exercise,
      }
    } catch (e) {
      logCustomErrorMessageAndError(`retrieveExerciseById error, userId = ${userId}, exerciseId = ${exerciseId}`, e)
      return {
        isSuccess: false,
        exercise: null,
      }
    }
  }

  return {
    createPronunciationExercise,
    createPronunciationAttempt,
    retrievePronunciationExercises,
    retrieveExerciseByIdAndUserId,
  }
}
