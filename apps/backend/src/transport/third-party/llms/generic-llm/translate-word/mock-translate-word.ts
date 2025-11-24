import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const mockTranslateWord = async (
  text: string,
  sourceDialect: DialectCode,
  targetLanguage: LangCode,
  expectedWords: string[],
  selectedWordIndex: number
): Promise<string | null> => {
  return `mocked translation: sourceDialect: ${sourceDialect}, targetLang: ${targetLanguage}, text: ${text}, selectedWordIndex: ${selectedWordIndex}`
}
