import { LangCode } from '../constants/lang-codes'
import { langCodeToNativeLanguageNameMap, langCodeToNativeLatinLanguageNameMap } from '../constants/lang-native-names'

export const langCodeToNativeLanguageName = (langCode: LangCode): string => {
  return langCodeToNativeLanguageNameMap[langCode] || 'Unknown Language'
}
export const langCodeToNativeLatinLanguageName = (langCode: LangCode): string => {
  return langCodeToNativeLatinLanguageNameMap[langCode] || 'Unknown Language'
}
