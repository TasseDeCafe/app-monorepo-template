import { oc } from '@orpc/contract'
import { z } from 'zod'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'

export const SAVED_WORDS_PATH = '/saved-words' as const

const errorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
    })
  ),
})

export const SavedWordSchema = z.object({
  word: z.string(),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
})
export type SavedWord = z.infer<typeof SavedWordSchema>

export const SavedWordCountSchema = z.object({
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
  count: z.number().int().nonnegative(),
})
export type SavedWordCount = z.infer<typeof SavedWordCountSchema>

const putSavedWordInputSchema = z.object({
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
  contextWords: z.array(z.string()),
  wordIndex: z.number(),
})

const deleteSavedWordInputSchema = z.union([
  z.object({
    language: z.enum(SUPPORTED_STUDY_LANGUAGES),
    contextWords: z.array(z.string()),
    wordIndex: z.number(),
  }),
  z.object({
    orthographicForm: z.string(),
    language: z.enum(SUPPORTED_STUDY_LANGUAGES),
  }),
])

const getSavedWordsInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES).optional(),
})

const savedWordsResponseSchema = z.object({
  savedWords: z.array(SavedWordSchema),
  countersByLanguage: z.array(SavedWordCountSchema),
  nextCursor: z.string().nullable(),
})

export const savedWordsContract = {
  putSavedWord: oc
    .route({
      method: 'PUT',
      path: SAVED_WORDS_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(putSavedWordInputSchema)
    .output(
      z.object({
        data: z.object({
          orthographicForm: z.string(),
        }),
      })
    ),

  deleteSavedWord: oc
    .route({
      method: 'DELETE',
      path: SAVED_WORDS_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(deleteSavedWordInputSchema)
    .output(
      z.object({
        data: z.object({
          orthographicForm: z.string(),
        }),
      })
    ),

  getSavedWords: oc
    .route({
      method: 'GET',
      path: SAVED_WORDS_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(getSavedWordsInputSchema)
    .output(
      z.object({
        data: savedWordsResponseSchema,
      })
    ),
} as const

export type PutSavedWordInput = z.infer<typeof putSavedWordInputSchema>
export type DeleteSavedWordInput = z.infer<typeof deleteSavedWordInputSchema>
export type GetSavedWordsResponse = z.infer<typeof savedWordsResponseSchema>
