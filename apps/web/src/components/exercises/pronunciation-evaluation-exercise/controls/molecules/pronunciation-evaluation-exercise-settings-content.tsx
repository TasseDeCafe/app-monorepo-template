import { useSelector } from 'react-redux'
import { selectStudyLanguageOrEnglish } from '../../../../../state/slices/account-slice.ts'
import { CefrLevelSelector } from '../atoms/cefr-level-selector/cefr-level-selector.tsx'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes.ts'
import cloneDeep from 'lodash.clonedeep'
import { ExerciseBasicSettingsContent } from '../atoms/exercise-basic-settings-content.tsx'
import { ExerciseLengthLevelSelector } from '../atoms/exercise-length-level-selector/exercise-length-level-selector.tsx'
import { UserSettings } from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract.ts'
import {
  useFrequencySliderPosition,
  useFrequencyWordLength,
  useUpdateFrequencyListPositionMutation,
  useUpdateFrequencyWordLengthMutation,
  useUserSettings,
} from '@/hooks/api/user-settings/user-settings-hooks'

export const PronunciationEvaluationExerciseSettingsContent = () => {
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const position = useFrequencySliderPosition(studyLanguage)
  const wordLength = useFrequencyWordLength(studyLanguage)
  const { data: userSettings } = useUserSettings()
  const { mutate: mutateFrequencyListPosition } = useUpdateFrequencyListPositionMutation(studyLanguage)
  const { mutate: mutateWordLength } = useUpdateFrequencyWordLengthMutation(studyLanguage)

  const handlePositionChange = (newPosition: number) => {
    updateFrequencySliderPosition(studyLanguage, newPosition)
  }

  const handleWordLengthChange = (newPosition: number) => {
    updateWordLengthSliderPosition(studyLanguage, newPosition)
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

  const updateWordLengthSliderPosition = (language: LangCode, wordLength: number) => {
    if (!userSettings) {
      return
    }
    const updatedSettings: UserSettings = cloneDeep(userSettings)
    updatedSettings.preferences.exercises.frequencyList.exerciseLength.byLanguage.map((lang) => {
      if (lang.language === language) {
        lang.length = wordLength
      }
      return lang
    })
    mutateWordLength(updatedSettings)
  }

  return (
    <div className='flex flex-col gap-6'>
      <CefrLevelSelector initialPosition={position} onPositionCommit={handlePositionChange} />
      <ExerciseLengthLevelSelector initialWordLength={wordLength} onWordLengthCommit={handleWordLengthChange} />
      <ExerciseBasicSettingsContent />
    </div>
  )
}
