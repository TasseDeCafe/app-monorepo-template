import { AudioLines, FileAudio, Languages, MessageSquareMoreIcon, Mic } from 'lucide-react'
import { ROUTE_PATHS } from '../../routing/route-paths.ts'
import { MobileExerciseItem } from './mobile-exercise-item.tsx'
import { selectEmail } from '../../state/slices/account-slice.ts'
import { useSelector } from 'react-redux'
import { getConfig } from '../../config/environment-config.ts'
import { checkIsTestUser } from '../../utils/test-users-utils'
import { useLingui } from '@lingui/react/macro'

export const ExercisesList = () => {
  const { t } = useLingui()

  const email = useSelector(selectEmail)
  const isTestUser = checkIsTestUser(email)

  return (
    <div className='flex w-full flex-col gap-3'>
      {(getConfig().featureFlags.isTranslationExerciseEnabled() || isTestUser) && (
        <MobileExerciseItem
          icon={Languages}
          title={t`Adaptive translation practice`}
          description={t`Translate sentences adapted to your level`}
          to={ROUTE_PATHS.TRANSLATION_EXERCISE_START}
        />
      )}
      <MobileExerciseItem
        icon={MessageSquareMoreIcon}
        title={t`Conversation Practice`}
        description={t`Real-world conversations`}
        to={ROUTE_PATHS.CONVERSATION_EXERCISE}
      />
      <MobileExerciseItem
        icon={Mic}
        title={t`Pronunciation practice`}
        description={t`Pronounce words tailored to your language level`}
        to={ROUTE_PATHS.PRONUNCIATION_EVALUATION_STANDARD_EXERCISE_START}
      />
      <MobileExerciseItem
        icon={AudioLines}
        title={t`Stress practice`}
        description={t`Master word stress patterns in sentences`}
        to={ROUTE_PATHS.STRESS_EXERCISE}
      />
      <MobileExerciseItem
        icon={FileAudio}
        title={t`Custom pronunciation practice`}
        description={t`Use your own text for targeted practice`}
        to={ROUTE_PATHS.PRONUNCIATION_EVALUATION_CUSTOM_EXERCISE_START}
      />
    </div>
  )
}
