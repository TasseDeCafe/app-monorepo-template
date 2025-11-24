import { oc } from '@orpc/contract'
import { z } from 'zod'
import { DialectCode, SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import { AVAILABLE_TOPICS } from '@yourbestaccent/core/constants/topics'
import { Base64FileUploadInput } from './common/file-upload-schemas'
import { audioUploadSchema } from './common/audio-upload-schema'

const errorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
    })
  ),
})

const pronunciationEvaluationExerciseHistoryItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
  dialect: z.enum(DialectCode),
  createdAt: z.string(),
  attempts: z.array(
    z.object({
      id: z.string(),
      transcript: z.string(),
      score: z.number(),
      createdAt: z.string(),
    })
  ),
})

const pronunciationEvaluationExerciseSchema = pronunciationEvaluationExerciseHistoryItemSchema.extend({
  wordsFromExerciseThatAreSaved: z.array(
    z.object({
      word: z.string(),
      language: z.enum(SUPPORTED_STUDY_LANGUAGES),
    })
  ),
})

export const UserStatsSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  totalDaysLearned: z.number(),
  numberOfDaysOfNextStreakBadge: z.number(),
  numberOfAchievedStreakBadges: z.number(),
  xpEarnedToday: z.number(),
  totalXp: z.number(),
})


export const pronunciationEvaluationExerciseContract = {
  generatePronunciationExercise: oc
    .route({
      method: 'POST',
      path: '/exercises/pronunciation-evaluation/standard/generate',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        language: z.enum(SUPPORTED_STUDY_LANGUAGES),
        position: z.number(),
        wordLength: z.number(),
        dialect: z.enum(DialectCode),
        topics: z.array(z.enum(AVAILABLE_TOPICS)).optional(),
      })
    )
    .output(
      z.object({
        data: pronunciationEvaluationExerciseSchema,
      })
    ),

  generateCustomPronunciationExercise: oc
    .route({
      method: 'POST',
      path: '/exercises/pronunciation-evaluation/custom/generate',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        text: z.string().min(1).max(1000),
        language: z.enum(SUPPORTED_STUDY_LANGUAGES),
        dialect: z.enum(DialectCode),
      })
    )
    .output(
      z.object({
        data: pronunciationEvaluationExerciseSchema,
      })
    ),

  retrievePronunciationExerciseHistory: oc
    .route({
      method: 'GET',
      path: '/exercises/pronunciation-evaluation/history',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(1000).optional(),
        language: z.enum(SUPPORTED_STUDY_LANGUAGES).optional(),
      })
    )
    .output(
      z.object({
        data: z.object({
          exercises: z.array(pronunciationEvaluationExerciseHistoryItemSchema),
          nextCursor: z.string().nullable(),
        }),
      })
    ),

  retrievePronunciationExercise: oc
    .route({
      method: 'GET',
      path: '/exercises/pronunciation-evaluation/:exerciseId',
      successStatus: 200,
    })
    .errors({
      BAD_REQUEST: {
        status: 400,
        data: errorResponseSchema,
      },
      NOT_FOUND: {
        status: 404,
        data: errorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        exerciseId: z.string(),
      })
    )
    .output(
      z.object({
        data: pronunciationEvaluationExerciseSchema,
      })
    ),

  completePronunciationExercise: oc
    .route({
      method: 'POST',
      path: '/exercises/pronunciation-evaluation/:exerciseId/complete',
      successStatus: 200,
    })
    .errors({
      AUDIO_VALIDATION_ERROR: {
        status: 400,
        data: errorResponseSchema,
      },
      BAD_REQUEST: {
        status: 400,
        data: errorResponseSchema,
      },
      NOT_FOUND: {
        status: 404,
        data: errorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        exerciseId: z.string(),
        audio: audioUploadSchema,
      })
    )
    .output(
      z.object({
        data: z.object({
          evaluation: z.object({
            transcript: z.string(),
            score: z.number(),
            wordPairs: z.array(
              z.object({
                expectedWord: z.string().nullable(),
                actualWord: z.string().nullable(),
                actualStartTimeInSeconds: z.number().nullable(),
                actualEndTimeInSeconds: z.number().nullable(),
                confidence: z.number().nullable(),
              })
            ),
          }),
          userStats: UserStatsSchema,
        }),
      })
    ),
} as const

export type { Base64FileUploadInput }
