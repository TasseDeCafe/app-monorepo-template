import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { LanguageSelectorSheetContent } from './language-selector-sheet-content'
import { createStudyLanguageFilter } from '@yourbestaccent/i18n/lang-filter-utils'
import { useLingui } from '@lingui/react/macro'
import { useMemo } from 'react'

export type LanguageSelectorSheetContentProps = {
  close: () => void
  onLanguageSelect?: (language: LangCode) => void
  initialLanguage?: LangCode
}

export const StudyLanguageSettingsSelectorSheetContent = (props: LanguageSelectorSheetContentProps) => {
  const { t, i18n } = useLingui()

  const languageFilter = useMemo(() => createStudyLanguageFilter(i18n), [i18n])

  return (
    <LanguageSelectorSheetContent
      {...props}
      languageFilter={languageFilter}
      title={t`I am learning`}
      description={t`This is the language that will be used in the exercises.`}
      searchPlaceholder={t`Search language...`}
    />
  )
}
