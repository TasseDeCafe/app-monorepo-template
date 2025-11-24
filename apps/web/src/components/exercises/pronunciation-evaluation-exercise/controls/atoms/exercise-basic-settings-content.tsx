import { IpaToggle } from './ipa-toggle.tsx'
import { TransliterationToggle } from './transliteration-toggle.tsx'
import {
  preferencesActions,
  selectShouldShowIpa,
  selectShouldShowTransliteration,
} from '../../../../../state/slices/preferences-slice.ts'
import { useDispatch, useSelector } from 'react-redux'
import { selectStudyLanguageOrEnglish } from '../../../../../state/slices/account-slice.ts'
import { isLanguageWithTransliteration } from '@yourbestaccent/core/utils/lang-codes-utils'
import { useLingui } from '@lingui/react/macro'

export const ExerciseBasicSettingsContent = () => {
  const { t } = useLingui()

  const shouldShowIpa = useSelector(selectShouldShowIpa)
  const shouldShowTransliteration = useSelector(selectShouldShowTransliteration)
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const dispatch = useDispatch()

  const handleIpaClick = () => {
    dispatch(preferencesActions.setShouldShowIpa(!shouldShowIpa))
  }

  const handleTransliterationClick = () => {
    dispatch(preferencesActions.setShouldShowTransliteration(!shouldShowTransliteration))
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-base font-semibold text-gray-800'>{t`IPA and transliteration`}</h3>
      <div className='space-y-2'>
        <IpaToggle shouldShowIpa={shouldShowIpa} handleIpaClick={handleIpaClick} />
        {isLanguageWithTransliteration(studyLanguage) && (
          <TransliterationToggle
            shouldShowTransliteration={shouldShowTransliteration}
            handleTransliterationClick={handleTransliterationClick}
          />
        )}
      </div>
      <p className='text-sm text-gray-400'>{t`International phonetic alphabet (IPA) and transliteration will appear above the study words`}</p>
    </div>
  )
}
