import { LangCode, SupportedStudyLanguage, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { PreviousExerciseWithLearningData, GenerateTranslationExerciseResult } from './generate-translation-exercise'
import { FrequencyLists } from '../../../../../utils/frequency-list-utils'

export const mockGenerateTranslationExercise = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  previousExercise: PreviousExerciseWithLearningData | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studyLanguage: SupportedStudyLanguage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  motherLanguage: LangCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dialect: DialectCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frequencyLists: FrequencyLists
): Promise<GenerateTranslationExerciseResult> => {
  return {
    isSuccess: true,
    exercise: {
      study_language_sentence: 'Ich gehe gerne am Wochenende spazieren.',
      mother_language_sentence: 'I like to go for walks on weekends.',
    },
  }
}
