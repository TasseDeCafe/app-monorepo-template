import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const mockTranslateText = async (
  text: string,
  sourceDialect: DialectCode,
  targetLanguage: LangCode
): Promise<string | null> => {
  return `mocked translation: sourceDialect: ${sourceDialect}, targetLang: ${targetLanguage}, text: ${text}`
}
