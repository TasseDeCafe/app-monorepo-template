import { ExpectedTextTranslationButton } from './atoms/expected-text-translation-button.tsx'
import { ExerciseControlsSettingsButton } from './molecules/exercise-controls-settings-button.tsx'
import { ExerciseBasicSettingsContent } from './atoms/exercise-basic-settings-content.tsx'

export const BeginnerLevelExerciseControls = () => {
  return (
    <div className='mt-8 flex w-full flex-row justify-center gap-x-2 md:gap-x-4'>
      <ExpectedTextTranslationButton />
      <ExerciseControlsSettingsButton shouldShowLevel={false} currentLevel={null}>
        <ExerciseBasicSettingsContent />
      </ExerciseControlsSettingsButton>
    </div>
  )
}
