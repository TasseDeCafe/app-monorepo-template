import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const mockTranslateWordWithTranslationContext = async (
  word: string,
  sourceDialect: DialectCode,
  targetLanguage: LangCode,

  originalSentence: string,

  translatedSentence: string,
  wordIndex: number
): Promise<string | null> => {
  // Mock translation that shows source dialect, target language, word and context indicator
  return `mocked word with context: sourceDialect: ${sourceDialect}, targetLang: ${targetLanguage}, word: ${word}, wordIndex: ${wordIndex}`
}
