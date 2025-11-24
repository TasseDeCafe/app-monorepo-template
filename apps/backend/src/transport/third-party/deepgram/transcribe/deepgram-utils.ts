import { LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const langCodeToDeepgramLanguage = (langCode: LangCode): string => {
  // taken from https://developers.deepgram.com/docs/models-languages-overview
  if (langCode === LangCode.PORTUGUESE) {
    return 'pt-BR'
  } else {
    return langCode
  }
}
