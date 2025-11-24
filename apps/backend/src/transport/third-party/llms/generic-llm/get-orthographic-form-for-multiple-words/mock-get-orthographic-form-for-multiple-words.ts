import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { GetOrthographicFormsForMultipleWordsResult } from './get-orthographic-form-for-multiple-words'

export const mockGetOrthographicFormsForMultipleWords = async (
  text: string,
  wordsWithoutPunctuation: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language: LangCode
): Promise<GetOrthographicFormsForMultipleWordsResult> => {
  return {
    isSuccess: true,
    orthographicForms: wordsWithoutPunctuation,
  }
}
