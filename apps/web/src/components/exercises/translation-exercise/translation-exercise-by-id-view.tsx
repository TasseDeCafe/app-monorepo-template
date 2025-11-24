import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { TranslationExerciseView } from './translation-exercise-view.tsx'
import { BigCard } from '../../design-system/big-card.tsx'
import { WithNavbar } from '../../navbar/with-navbar.tsx'
import { ExerciseNotFound } from '@/components/exercises/pronunciation-evaluation-exercise/exercise-not-found'
import { useTranslationExercise } from '@/hooks/api/translation-exercise/translation-exercise-hooks'
import { ORPCError } from '@orpc/contract'

export const TranslationExerciseByIdView = () => {
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { data: exerciseData, isFetching: isFetchingExercise, error: exerciseError } = useTranslationExercise(id)

  if (exerciseError instanceof ORPCError && exerciseError.code === 'NOT_FOUND') {
    return (
      <WithNavbar>
        <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
          <BigCard className='container relative flex flex-1 flex-col items-center'>
            <ExerciseNotFound />
          </BigCard>
        </div>
      </WithNavbar>
    )
  }

  return <TranslationExerciseView currentExercise={exerciseData} isLoading={isFetchingExercise} />
}
