import { LangCode } from '@template-app/core/constants/lang-codes.ts'

export const isUsingPolishLanguage = (): boolean => {
  const userLanguage = navigator.language
  const isPolish = userLanguage.toLowerCase().startsWith('pl')
  return isPolish
}

export const getBrowserLanguageAsLangCodeOrEnglish = (): LangCode => {
  const browserLang = navigator.language.toLowerCase()
  const langPart = browserLang.split('-')[0]
  const supportedLang = Object.values(LangCode).find((langCode) => langPart === langCode.toLowerCase())

  return supportedLang ?? LangCode.ENGLISH
}
