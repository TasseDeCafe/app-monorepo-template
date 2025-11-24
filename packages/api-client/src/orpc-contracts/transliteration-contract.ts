import { oc } from '@orpc/contract'
import { z } from 'zod'
import { LANGUAGES_WITH_TRANSLITERATION } from '@yourbestaccent/core/constants/lang-codes'

export const TRANSLITERATION_PATH = '/transliteration' as const

const errorSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
    })
  ),
})

export const transliterationContract = {
  transliterate: oc
    .route({
      method: 'POST',
      path: `${TRANSLITERATION_PATH}/transliterate`,
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
        language: z.enum(LANGUAGES_WITH_TRANSLITERATION),
        text: z.string().min(1),
      })
    )
    .output(
      z.object({
        data: z.object({
          transliteration: z.string(),
        }),
      })
    ),
} as const
