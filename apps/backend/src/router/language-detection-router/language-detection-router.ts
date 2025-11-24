import { Router } from 'express'
import { SUPPORTED_STUDY_LANGUAGES_SET, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import LanguageDetect from 'languagedetect'
import { implement } from '@orpc/server'
import { languageDetectionContract } from '@yourbestaccent/api-client/orpc-contracts/language-detection-contract'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'

const languageDetector = new LanguageDetect()
languageDetector.setLanguageType('iso2')

export const LanguageDetectionRouter = (): Router => {
  const implementer = implement(languageDetectionContract).$context<OrpcContext>()

  const router = implementer.router({
    detectStudyLanguage: implementer.detectStudyLanguage.handler(async ({ input }) => {
      const languageDetectionResult: [string, number][] = languageDetector
        .detect(input.text)
        .filter((item) => SUPPORTED_STUDY_LANGUAGES_SET.has(item[0] as SupportedStudyLanguage))

      if (!languageDetectionResult || languageDetectionResult.length === 0) {
        return {
          data: {
            hasDetectedAStudyLanguage: false,
          },
        }
      }

      const studyLanguage = languageDetectionResult[0][0] as SupportedStudyLanguage | undefined

      if (!studyLanguage) {
        return {
          data: {
            hasDetectedAStudyLanguage: false,
          },
        }
      }

      return {
        data: {
          studyLanguage,
          confidence: languageDetectionResult[0][1],
          hasDetectedAStudyLanguage: true,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: languageDetectionContract })
}
