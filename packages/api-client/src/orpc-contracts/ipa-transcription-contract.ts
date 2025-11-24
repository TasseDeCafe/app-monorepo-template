import { oc } from '@orpc/contract'
import { DialectCode, SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import { MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS } from '@yourbestaccent/core/constants/api-constants'
import { z } from 'zod'

export const ipaTranscriptionContract = {
  transcribeToIpa: oc
    .route({
      method: 'POST',
      path: '/pronunciation/transcribe-to-ipa',
      successStatus: 200,
    })
    .errors({
      FORBIDDEN: {
        status: 403,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
              code: z.string().optional(),
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
    })
    .input(
      z.object({
        text: z.string().min(1).max(MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS),
        language: z.enum(SUPPORTED_STUDY_LANGUAGES),
        dialect: z.enum(DialectCode),
      })
    )
    .output(
      z.object({
        data: z.object({
          ipaTranscription: z.array(z.string()),
        }),
      })
    ),
} as const
