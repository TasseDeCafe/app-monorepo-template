import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import { logWithSentry } from '../../transport/third-party/sentry/error-monitoring'
import { FrequencyLists } from '../../utils/frequency-list-utils'
import { StressExerciseResult, StressExerciseServiceInterface } from './stress-exercise-service-types'

export type { StressExerciseResult, StressExerciseServiceInterface }

const generateStressFailureResult = (crypticCode: string): StressExerciseResult => ({
  isSuccess: false,
  crypticCode,
})

export const StressExerciseService = (
  genericLlmApi: GenericLlmApi,
  frequencyLists: FrequencyLists
): StressExerciseServiceInterface => {
  const generateStressExercises = async (
    position: number,
    language: SupportedStudyLanguage,
    dialect: DialectCode
  ): Promise<StressExerciseResult> => {
    const result = await genericLlmApi.generateStressExercises(position, language, dialect, frequencyLists)
    if (!result) {
      logWithSentry({
        message: 'Failed to generate stress exercises',
        params: {
          position,
          language,
          dialect,
        },
      })
      return generateStressFailureResult('400')
    }
    return { isSuccess: true, exercises: result }
  }

  return {
    generateStressExercises,
  }
}
