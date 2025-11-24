import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'

export const mockCorrectGrammar = async (
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studyLanguage: SupportedStudyLanguage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dialect: DialectCode
): Promise<string | null> => {
  if (!text) {
    return null
  }
  return text
}
