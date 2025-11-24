import { oc } from '@orpc/contract'
import { z } from 'zod'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const GRAMMAR_CORRECTION_PATH = '/grammar/correct-and-explain' as const

export const grammarCorrectionInputSchema = z.object({
  text: z.string(),
  motherLanguage: z.enum(LangCode),
  language: z.enum(LangCode),
  dialect: z.enum(DialectCode),
})

export const grammarCorrectionContract = {
  correctGrammarAndExplain: oc
    .route({
      method: 'POST',
      path: GRAMMAR_CORRECTION_PATH,
      successStatus: 200,
    })
    .input(grammarCorrectionInputSchema)
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
    .output(
      z.object({
        data: z.object({
          correction: z.string(),
          explanation: z.string().nullable(),
        }),
      })
    ),
} as const
