import { oc } from '@orpc/contract'
import { z } from 'zod'
import { SUPPORTED_STUDY_LANGUAGES, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const TRANSLATION_EXERCISE_START_PATH = '/exercises/translation/start' as const
export const TRANSLATION_EXERCISE_HISTORY_PATH = '/exercises/translation/history' as const
export const TRANSLATION_EXERCISE_RETRIEVE_PATH = '/exercises/translation/:exerciseId' as const
export const TRANSLATION_EXERCISE_COMPLETE_PATH = '/exercises/translation/:exerciseId/complete' as const
export const TRANSLATION_EXERCISE_ANALYZE_GRAMMAR_PATH = '/exercises/translation/analyze-grammar-patterns' as const

const grammarPatternSchema = z.object({
  structure: z.string(),
  concept: z.string(),
  hint: z.string().optional(),
})

const selectionSchema = z.object({
  chunk: z.array(z.string()).min(1),
  chunk_position: z.array(z.number()).min(1),
  language: z.string().length(2),
})

const translationExerciseHistoryItemSchema = z.object({
  id: z.string(),
  motherLanguageSentence: z.string(),
  studyLanguageSentence: z.string(),
  studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
  motherLanguage: z.enum(LangCode),
  dialect: z.enum(DialectCode),
  createdAt: z.string(),
  userTranslation: z.string().nullable(),
  skipped: z.boolean(),
})

const translationExerciseSchema = translationExerciseHistoryItemSchema

export type GrammarPattern = z.infer<typeof grammarPatternSchema>
export type Selection = z.infer<typeof selectionSchema>

const commonErrorSchemas = {
  BAD_REQUEST: {
    status: 400,
    data: z.object({
      errors: z.array(
        z.object({
          message: z.string(),
        })
      ),
    }),
  },
  NOT_FOUND: {
    status: 404,
    data: z.object({
      errors: z.array(
        z.object({
          message: z.string(),
        })
      ),
    }),
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    data: z.object({
      errors: z.array(
        z.object({
          message: z.string(),
          code: z.string().optional(),
        })
      ),
    }),
  },
}

export const translationExerciseContract = {
  startTranslationExercise: oc
    .route({
      method: 'POST',
      path: TRANSLATION_EXERCISE_START_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: commonErrorSchemas.INTERNAL_SERVER_ERROR,
    })
    .input(
      z.object({
        studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
        motherLanguage: z.enum(LangCode),
        dialect: z.enum(DialectCode),
      })
    )
    .output(
      z.object({
        data: translationExerciseSchema,
      })
    ),

  retrieveTranslationExerciseHistory: oc
    .route({
      method: 'GET',
      path: TRANSLATION_EXERCISE_HISTORY_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: commonErrorSchemas.INTERNAL_SERVER_ERROR,
    })
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.coerce.number().optional(),
        language: z.enum(SUPPORTED_STUDY_LANGUAGES).optional(),
      })
    )
    .output(
      z.object({
        data: z.object({
          exercises: z.array(translationExerciseHistoryItemSchema),
          nextCursor: z.string().nullable(),
        }),
      })
    ),

  retrieveTranslationExercise: oc
    .route({
      method: 'GET',
      path: TRANSLATION_EXERCISE_RETRIEVE_PATH,
      successStatus: 200,
    })
    .errors({
      BAD_REQUEST: commonErrorSchemas.BAD_REQUEST,
      NOT_FOUND: commonErrorSchemas.NOT_FOUND,
      INTERNAL_SERVER_ERROR: commonErrorSchemas.INTERNAL_SERVER_ERROR,
    })
    .input(
      z.object({
        exerciseId: z.string(),
      })
    )
    .output(
      z.object({
        data: translationExerciseSchema,
      })
    ),

  completeTranslationExercise: oc
    .route({
      method: 'POST',
      path: TRANSLATION_EXERCISE_COMPLETE_PATH,
      successStatus: 200,
    })
    .errors({
      BAD_REQUEST: commonErrorSchemas.BAD_REQUEST,
      NOT_FOUND: commonErrorSchemas.NOT_FOUND,
      INTERNAL_SERVER_ERROR: commonErrorSchemas.INTERNAL_SERVER_ERROR,
    })
    .input(
      z.object({
        exerciseId: z.string(),
        userTranslation: z.string().optional(),
        skipped: z.boolean().optional(),
        selectedGrammarPatterns: z.array(grammarPatternSchema).optional(),
        selectedChunks: z.array(selectionSchema).optional(),
      })
    )
    .output(
      z.object({
        data: z.object({
          success: z.boolean(),
        }),
      })
    ),

  generateGrammarPatterns: oc
    .route({
      method: 'POST',
      path: TRANSLATION_EXERCISE_ANALYZE_GRAMMAR_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: commonErrorSchemas.INTERNAL_SERVER_ERROR,
    })
    .input(
      z.object({
        motherLanguageSentence: z.string(),
        studyLanguageSentence: z.string(),
        studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
        motherLanguage: z.enum(LangCode),
      })
    )
    .output(
      z.object({
        data: z.object({
          grammarPatterns: z.array(grammarPatternSchema),
        }),
      })
    ),
} as const
