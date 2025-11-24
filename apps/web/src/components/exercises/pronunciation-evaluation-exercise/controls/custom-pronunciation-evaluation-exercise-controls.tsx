import { ExpectedTextTranslationButton } from './atoms/expected-text-translation-button.tsx'
import { ExerciseBasicSettingsContent } from './atoms/exercise-basic-settings-content.tsx'
import { ExerciseControlsSettingsButton } from './molecules/exercise-controls-settings-button.tsx'

export const CustomPronunciationEvaluationExerciseControls = () => {
  return (
    <div className='flex flex-row items-center gap-x-2 md:gap-x-4'>
      <ExpectedTextTranslationButton />
      <ExerciseControlsSettingsButton shouldShowLevel={false} currentLevel={null}>
        <ExerciseBasicSettingsContent />
      </ExerciseControlsSettingsButton>
    </div>
  )
}
