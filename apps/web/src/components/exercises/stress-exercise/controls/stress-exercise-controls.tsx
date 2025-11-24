import { useSelector } from 'react-redux'
import { selectStudyLanguageOrEnglish } from '@/state/slices/account-slice.ts'
import { getCurrentLevel } from '@yourbestaccent/core/utils/cefr-level-selector-utils'
import { ExerciseControlsSettingsButton } from '@/components/exercises/pronunciation-evaluation-exercise/controls/molecules/exercise-controls-settings-button'
import { StressExerciseSettingsContent } from './molecules/stress-exercise-settings-content'
import { useFrequencySliderPosition } from '@/hooks/api/user-settings/user-settings-hooks'

export const StressExerciseControls = () => {
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const position = useFrequencySliderPosition(studyLanguage)
  const currentLevel = getCurrentLevel(position)

  return (
    <div className='mt-8 flex w-full flex-row justify-center gap-x-4 md:gap-x-4'>
      <ExerciseControlsSettingsButton shouldShowLevel={true} currentLevel={currentLevel}>
        <StressExerciseSettingsContent />
      </ExerciseControlsSettingsButton>
    </div>
  )
}
