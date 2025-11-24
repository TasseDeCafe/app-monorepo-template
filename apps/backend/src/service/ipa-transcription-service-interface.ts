import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi } from '../transport/third-party/llms/generic-llm/generic-llm-api'
import { logWithSentry } from '../transport/third-party/sentry/error-monitoring'

export type PronunciationIpaResult =
  | {
      isSuccess: true
      ipaTranscription: string[]
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export interface IpaTranscriptionServiceInterface {
  generateIpaTranscription: (
    text: string,
    language: SupportedStudyLanguage,
    dialect: DialectCode
  ) => Promise<PronunciationIpaResult>
}

const generateIpaFailureResult = (crypticCode: string): PronunciationIpaResult => ({
  isSuccess: false,
  crypticCode,
})

export const IpaTranscriptionService = (genericLlmApi: GenericLlmApi): IpaTranscriptionServiceInterface => {
  const generateIpaTranscription = async (
    text: string,
    language: SupportedStudyLanguage,
    dialect: DialectCode
  ): Promise<PronunciationIpaResult> => {
    const result = await genericLlmApi.generateIpa(text, language, dialect)
    if (!result) {
      logWithSentry({
        message: 'Failed to generate IPA',
        params: {
          text,
          language,
          dialect,
        },
      })
      return generateIpaFailureResult('300')
    }
    return { isSuccess: true, ipaTranscription: result }
  }

  return {
    generateIpaTranscription,
  }
}
