import { oc } from '@orpc/contract'
import { z } from 'zod'
import { DialectCode, SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'

export const STRESS_EXERCISE_GENERATE_PATH = '/exercises/stress/generate' as const

export const StressExerciseSchema = z.object({
  word: z.string(),
  sentence: z.string(),
  wordIpa: z.string(),
  syllables: z.array(
    z.object({
      text: z.string(),
    })
  ),
  stressIndex: z.number(),
})

export type StressExercise = z.infer<typeof StressExerciseSchema>

export const stressExerciseContract = {
  generateStressExercises: oc
    .route({
      method: 'POST',
      path: STRESS_EXERCISE_GENERATE_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
            })
          ),
        }),
      },
    })
    .input(
      z.object({
        position: z.number().int(),
        language: z.enum(SUPPORTED_STUDY_LANGUAGES),
        dialect: z.enum(DialectCode),
      })
    )
    .output(
      z.object({
        data: z.object({
          exercises: z.array(StressExerciseSchema),
        }),
      })
    ),
} as const