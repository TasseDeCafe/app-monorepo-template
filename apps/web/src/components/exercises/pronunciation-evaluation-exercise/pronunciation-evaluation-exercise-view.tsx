import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys.ts'
import { Exercise } from './exercise.tsx'
import { TextForExercise } from './text-for-exercise.tsx'
import { StandardPronunciationEvaluationExerciseControls } from '@/components/exercises/pronunciation-evaluation-exercise/controls/standard-pronunciation-evaluation-exercise-controls.tsx'
import { CustomPronunciationEvaluationExerciseControls } from '@/components/exercises/pronunciation-evaluation-exercise/controls/custom-pronunciation-evaluation-exercise-controls.tsx'
import { ExerciseNotFound } from './exercise-not-found.tsx'
import { BigCard } from '../../design-system/big-card.tsx'
import { ExerciseSkeleton } from './exercise-skeleton.tsx'
import { ArrowLeft } from 'lucide-react'
import {
  ROUTE_PATHS,
  PronunciationEvaluationExerciseSubtype,
  EXERCISE_SUBTYPE_QUERY_PARAM,
} from '@/routing/route-paths.ts'
import { Button } from '../../design-system/button.tsx'
import { WithNavbar } from '../../navbar/with-navbar.tsx'
import { usePronunciationEvaluationExercise } from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import { useLingui } from '@lingui/react/macro'
import { ORPCError } from '@orpc/contract'

const VALID_EXERCISE_SUBTYPES: readonly PronunciationEvaluationExerciseSubtype[] = ['standard', 'custom'] as const

const isValidExerciseSubtype = (value: string | null): value is PronunciationEvaluationExerciseSubtype => {
  return VALID_EXERCISE_SUBTYPES.includes(value as PronunciationEvaluationExerciseSubtype)
}

export const PronunciationEvaluationExerciseView = () => {
  const { t } = useLingui()

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const exerciseSubtypeParam = searchParams.get(EXERCISE_SUBTYPE_QUERY_PARAM)
  const exerciseSubtype = isValidExerciseSubtype(exerciseSubtypeParam) ? exerciseSubtypeParam : 'standard'

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const {
    data: exerciseData,
    isFetching: isFetchingExercise,
    error: exerciseError,
  } = usePronunciationEvaluationExercise(id)

  const expectedText: string = exerciseData?.text ?? ''

  useEffect(() => {
    if (expectedText) {
      queryClient.setQueryData<string>([QUERY_KEYS.EXERCISE_TEXT], expectedText)
    }
  }, [expectedText, queryClient])

  useEffect(() => {
    if (exerciseData?.wordsFromExerciseThatAreSaved) {
      const savedWords: { word: string; language: SupportedStudyLanguage }[] =
        exerciseData.wordsFromExerciseThatAreSaved
      savedWords.forEach(({ word, language }) => {
        if (word) {
          queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, language], true)
        }
      })
    }
  }, [exerciseData?.wordsFromExerciseThatAreSaved, queryClient])

  const handleGoToDashboard = () => {
    POSTHOG_EVENTS.click('go_back')
  }

  const handleTryAnotherTextClick = () => {
    if (exerciseSubtype === 'custom') {
      navigate(ROUTE_PATHS.PRONUNCIATION_EVALUATION_CUSTOM_EXERCISE_START)
    } else {
      navigate(ROUTE_PATHS.PRONUNCIATION_EVALUATION_STANDARD_EXERCISE_START)
    }
  }

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

  if (isFetchingExercise || !exerciseData) {
    return (
      <WithNavbar>
        <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
          <BigCard className='container relative flex flex-1 flex-col items-center'>
            <Button
              href={ROUTE_PATHS.DASHBOARD}
              onClick={handleGoToDashboard}
              className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
            >
              <ArrowLeft className='' />
            </Button>
            <ExerciseSkeleton />
          </BigCard>
        </div>
      </WithNavbar>
    )
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
        <BigCard className='container relative flex flex-1 flex-col items-center'>
          <Button
            href={ROUTE_PATHS.DASHBOARD}
            onClick={handleGoToDashboard}
            className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
          >
            <ArrowLeft className='' />
          </Button>
          {exerciseSubtype === 'custom' ? (
            <CustomPronunciationEvaluationExerciseControls />
          ) : (
            <StandardPronunciationEvaluationExerciseControls />
          )}
          <Exercise
            expectedText={exerciseData.text}
            onTryAnotherTextClick={handleTryAnotherTextClick}
            textOnTryAnotherTextButton={exerciseSubtype === 'custom' ? t`Another text` : t`Try another sentence`}
            exerciseId={exerciseData.id}
          >
            <TextForExercise text={exerciseData.text} studyLanguage={exerciseData.language as SupportedStudyLanguage} />
          </Exercise>
        </BigCard>
      </div>
    </WithNavbar>
  )
}
