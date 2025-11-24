import type { I18n } from '@lingui/core'
import {
  LangCode,
  SUPPORTED_MOTHER_LANGUAGES,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedStudyLanguage,
} from '@template-app/core/constants/lang-codes'
import {
  langCodeToNativeLanguageName,
  langCodeToNativeLatinLanguageName,
} from '@template-app/core/utils/lang-native-utils'
import { langNameMessages } from './lang-code-translation-utils'

const createLanguageFilter = <T extends LangCode>(languagesToFilter: T[], i18n: I18n) => {
  const LANG_CODE_ALLOWED_TYPINGS: [T, string[]][] = languagesToFilter.map((langCode: T) => [
    langCode,
    [
      i18n._(langNameMessages[langCode]).toLowerCase(),
      langCodeToNativeLanguageName(langCode).toLowerCase(),
      langCodeToNativeLatinLanguageName(langCode).toLowerCase(),
    ],
  ])

  return (userInput: string): T[] => {
    if (!userInput) {
      return [...languagesToFilter]
    } else {
      const result: T[] = []
      const lowercaseInput = userInput.toLowerCase()

      for (let i = 0; i < LANG_CODE_ALLOWED_TYPINGS.length; i++) {
        const [langCode, allowedTypings] = LANG_CODE_ALLOWED_TYPINGS[i]
        let includesInput = false

        for (let j = 0; j < allowedTypings.length; j++) {
          if (allowedTypings[j].includes(lowercaseInput)) {
            includesInput = true
            break
          }
        }

        if (includesInput) {
          result.push(langCode)
        }
      }

      return result
    }
  }
}

export const createMotherLanguageFilter = (i18n: I18n): ((userInput: string) => LangCode[]) => {
  return createLanguageFilter<LangCode>(Array.from(SUPPORTED_MOTHER_LANGUAGES), i18n)
}

export const createStudyLanguageFilter = (i18n: I18n): ((userInput: string) => SupportedStudyLanguage[]) => {
  return createLanguageFilter<SupportedStudyLanguage>(Array.from(SUPPORTED_STUDY_LANGUAGES), i18n)
}
