import { oc } from '@orpc/contract'
import { z } from 'zod'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'

export const LANGUAGE_DETECTION_ROUTE = '/detect-study-language' as const

const languageDetectionInputSchema = z.object({
  text: z.string().min(1).max(1000),
})

export const languageDetectionResultSchema = z.object({
  studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES).optional(),
  confidence: z.number().optional(),
  hasDetectedAStudyLanguage: z.boolean(),
})

export type LanguageDetectionResult = z.infer<typeof languageDetectionResultSchema>

export const languageDetectionContract = {
  detectStudyLanguage: oc
    .route({
      method: 'POST',
      path: LANGUAGE_DETECTION_ROUTE,
      successStatus: 200,
    })
    .input(languageDetectionInputSchema)
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
        data: languageDetectionResultSchema,
      })
    ),
} as const
