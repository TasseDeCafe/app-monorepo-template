import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { LanguageSelectorSheetContent } from './language-selector-sheet-content'
import { createMotherLanguageFilter } from '@yourbestaccent/i18n/lang-filter-utils'
import { useLingui } from '@lingui/react/macro'
import { useMemo } from 'react'

export type LanguageSelectorSheetContentProps = {
  close: () => void
  onLanguageSelect?: (language: LangCode) => void
  initialLanguage?: LangCode
}

export const CustomExerciseStudyLanguageSelectorSheetContent = (props: LanguageSelectorSheetContentProps) => {
  const { t, i18n } = useLingui()

  const languageFilter = useMemo(() => createMotherLanguageFilter(i18n), [i18n])

  return (
    <LanguageSelectorSheetContent
      {...props}
      languageFilter={languageFilter}
      title={t`Language of the text`}
      description={t`Choose the language of the text you want to practice.`}
      searchPlaceholder={t`Search language...`}
    />
  )
}
