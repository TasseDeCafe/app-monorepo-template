import {
  LANGUAGES_WITH_TRANSLITERATION,
  LanguageWithTransliteration,
  SupportedStudyLanguage,
} from '../constants/lang-codes'

export const isLanguageWithTransliteration = (lang: SupportedStudyLanguage): lang is LanguageWithTransliteration => {
  return (LANGUAGES_WITH_TRANSLITERATION as readonly SupportedStudyLanguage[]).includes(lang)
}
