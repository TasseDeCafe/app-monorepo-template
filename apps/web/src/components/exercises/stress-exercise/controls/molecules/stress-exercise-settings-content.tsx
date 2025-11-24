import { useSelector } from 'react-redux'
import { selectStudyLanguageOrEnglish } from '../../../../../state/slices/account-slice.ts'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes.ts'
import cloneDeep from 'lodash.clonedeep'
import { CefrLevelSelector } from '@/components/exercises/pronunciation-evaluation-exercise/controls/atoms/cefr-level-selector/cefr-level-selector.tsx'
import { UserSettings } from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract.ts'
import {
  useFrequencySliderPosition,
  useUpdateFrequencyListPositionMutation,
  useUserSettings,
} from '@/hooks/api/user-settings/user-settings-hooks'

export const StressExerciseSettingsContent = () => {
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const position = useFrequencySliderPosition(studyLanguage)
  const { data: userSettings } = useUserSettings()
  const { mutate: mutateFrequencyListPosition } = useUpdateFrequencyListPositionMutation(studyLanguage)

  const handlePositionChange = (newPosition: number) => {
    updateFrequencySliderPosition(studyLanguage, newPosition)
  }

  const updateFrequencySliderPosition = (language: LangCode, position: number) => {
    if (!userSettings) {
      return
    }
    const updatedSettings: UserSettings = cloneDeep(userSettings)
    updatedSettings.preferences.exercises.frequencyList.position.byLanguage.map((lang) => {
      if (lang.language === language) {
        lang.position = position
      }
      return lang
    })
    mutateFrequencyListPosition(updatedSettings)
  }

  return (
    <div className='flex flex-col gap-6'>
      <CefrLevelSelector initialPosition={position} onPositionCommit={handlePositionChange} />
    </div>
  )
}
