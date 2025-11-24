import { useSelector } from 'react-redux'
import { selectStudyLanguageOrEnglish } from '../../../../state/slices/account-slice.ts'
import { getCurrentLevel } from '@yourbestaccent/core/utils/cefr-level-selector-utils.ts'
import { ExpectedTextTranslationButton } from './atoms/expected-text-translation-button.tsx'
import { PronunciationEvaluationExerciseSettingsContent } from './molecules/pronunciation-evaluation-exercise-settings-content.tsx'
import { ExerciseControlsSettingsButton } from './molecules/exercise-controls-settings-button.tsx'
import { TopicSelectorButton } from './atoms/topic-selector-button.tsx'
import { useFrequencySliderPosition } from '@/hooks/api/user-settings/user-settings-hooks'

export const StandardPronunciationEvaluationExerciseControls = () => {
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const position = useFrequencySliderPosition(studyLanguage)
  const currentLevel = getCurrentLevel(position)

  return (
    <div className='mt-8 flex w-full flex-row justify-center gap-x-4 md:gap-x-4'>
      <ExpectedTextTranslationButton />
      <TopicSelectorButton />
      <ExerciseControlsSettingsButton shouldShowLevel={true} currentLevel={currentLevel}>
        <PronunciationEvaluationExerciseSettingsContent />
      </ExerciseControlsSettingsButton>
    </div>
  )
}
