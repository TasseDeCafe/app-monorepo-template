import { LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const languageSpecificPrompt = (language: LangCode): string => {
  if (language === LangCode.RUSSIAN) {
    return 'Always use "ё" when spelling Russian words where appropriate.'
  }
  return ''
}
