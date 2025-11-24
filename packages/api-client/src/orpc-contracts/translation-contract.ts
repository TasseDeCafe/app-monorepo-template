import { oc } from '@orpc/contract'
import { z } from 'zod'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const TRANSLATION_PATH = '/translation' as const

const MAX_TEXT_LENGTH = 1000

const errorSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
    })
  ),
})

export const translationContract = {
  translateWord: oc
    .route({
      method: 'POST',
      path: `${TRANSLATION_PATH}/translate-word`,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorSchema,
      },
    })
    .input(
      z.object({
        sourceDialect: z.enum(DialectCode),
        targetLanguage: z.enum(LangCode),
        text: z.string().min(1).max(MAX_TEXT_LENGTH),
        contextWords: z.array(z.string()),
        selectedWordIndex: z.number(),
      })
    )
    .output(
      z.object({
        data: z.object({
          translation: z.string(),
        }),
      })
    ),

  translateText: oc
    .route({
      method: 'POST',
      path: `${TRANSLATION_PATH}/translate-text`,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorSchema,
      },
    })
    .input(
      z.object({
        sourceDialect: z.enum(DialectCode),
        targetLanguage: z.enum(LangCode),
        text: z.string().min(1).max(MAX_TEXT_LENGTH),
      })
    )
    .output(
      z.object({
        data: z.object({
          translation: z.string(),
        }),
      })
    ),

  translateSelection: oc
    .route({
      method: 'POST',
      path: `${TRANSLATION_PATH}/translate-selection`,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorSchema,
      },
    })
    .input(
      z.object({
        sourceDialect: z.enum(DialectCode),
        targetLanguage: z.enum(LangCode),
        originalSentence: z.string().min(1).max(MAX_TEXT_LENGTH),
        translationSentence: z.string().min(1).max(MAX_TEXT_LENGTH),
        selectionChunks: z.array(z.string()),
        selectionPositions: z.array(z.number()),
      })
    )
    .output(
      z.object({
        data: z.object({
          translation: z.string(),
        }),
      })
    ),

  translateWordWithTranslationContext: oc
    .route({
      method: 'POST',
      path: `${TRANSLATION_PATH}/translate-word-with-translation-context`,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorSchema,
      },
    })
    .input(
      z.object({
        sourceDialect: z.enum(DialectCode),
        targetLanguage: z.enum(LangCode),
        word: z.string().min(1).max(MAX_TEXT_LENGTH),
        originalSentence: z.string().min(1).max(MAX_TEXT_LENGTH),
        translatedSentence: z.string().min(1).max(MAX_TEXT_LENGTH),
        wordIndex: z.number(),
      })
    )
    .output(
      z.object({
        data: z.object({
          translation: z.string(),
        }),
      })
    ),
} as const
