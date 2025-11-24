import { DialectCode, LangCode } from '@template-app/core/constants/lang-codes'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages, dialectNameMessages } from '@template-app/i18n/lang-code-translation-utils'

export const useLangCodeToLanguageName = () => {
  const { i18n } = useLingui()
  return (langCode: LangCode): string => {
    return i18n._(langNameMessages[langCode])
  }
}

export const useDialectCodeToDialectName = () => {
  const { i18n } = useLingui()
  return (dialectCode: DialectCode): string => {
    return i18n._(dialectNameMessages[dialectCode])
  }
}
