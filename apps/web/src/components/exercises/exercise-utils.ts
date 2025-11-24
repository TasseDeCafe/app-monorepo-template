import {
  EXERCISE_TEXT_SEARCH_PARAM_NAME,
  STUDY_LANGUAGE_SEARCH_PARAM_NAME,
} from '@yourbestaccent/core/constants/search-params.ts'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes.ts'
import { getConfig } from '../../config/environment-config.ts'

export const buildShareLink = (studyLanguage: SupportedStudyLanguage, exerciseText: string) => {
  const url = new URL(`${getConfig().landingPageUrl}/share`)
  url.searchParams.set(STUDY_LANGUAGE_SEARCH_PARAM_NAME, studyLanguage)
  url.searchParams.set(EXERCISE_TEXT_SEARCH_PARAM_NAME, exerciseText)
  return url.toString()
}
