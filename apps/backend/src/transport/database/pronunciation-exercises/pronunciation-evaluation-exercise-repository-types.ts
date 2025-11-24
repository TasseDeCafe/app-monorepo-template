import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'

export interface DbPronunciationExercise {
  id: string
  user_id: string
  language: SupportedStudyLanguage
  text: string
  dialect: DialectCode
  created_at: string
}

export interface DbPronunciationAttempt {
  id: string
  pronunciation_exercise_id: string
  user_parsed_input: string
  user_score: number
  created_at: string
}

export interface DbPronunciationExerciseWithAttempts extends DbPronunciationExercise {
  attempts: DbPronunciationAttempt[]
}

export type DbCreatePronunciationExerciseResult =
  | {
      isSuccess: true
      exerciseId: string
    }
  | {
      isSuccess: false
      exerciseId: null
    }

export type DbRetrievePronunciationExercisesResult =
  | {
      isSuccess: true
      exercises: DbPronunciationExerciseWithAttempts[]
      nextCursor: string | null
    }
  | {
      isSuccess: false
      exercises: null
      nextCursor: null
    }

export type DbRetrieveExerciseByIdResult =
  | {
      isSuccess: true
      exercise: DbPronunciationExerciseWithAttempts
    }
  | {
      isSuccess: false
      exercise: null
    }

export interface PronunciationExerciseRepositoryInterface {
  createPronunciationExercise: (
    userId: string,
    language: SupportedStudyLanguage,
    text: string,
    dialect: DialectCode
  ) => Promise<DbCreatePronunciationExerciseResult>

  createPronunciationAttempt: (exerciseId: string, userParsedInput: string, userScore: number) => Promise<boolean>

  retrievePronunciationExercises: (
    userId: string,
    cursor?: string,
    limit?: number,
    languageFilter?: SupportedStudyLanguage
  ) => Promise<DbRetrievePronunciationExercisesResult>

  retrieveExerciseByIdAndUserId: (userId: string, exerciseId: string) => Promise<DbRetrieveExerciseByIdResult>
}
