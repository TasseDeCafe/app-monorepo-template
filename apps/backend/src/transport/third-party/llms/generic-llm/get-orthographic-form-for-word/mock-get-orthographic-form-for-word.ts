import { LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const mockGetOrthographicFormForWord = async (
  language: LangCode,
  contextWords: string[],
  selectedWordIndex: number
): Promise<string | null> => {
  return contextWords[selectedWordIndex]
}
