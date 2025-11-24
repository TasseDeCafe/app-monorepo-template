import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys.ts'
import { useTopics } from '@/hooks/api/user/user-hooks'
import { buildPronunciationEvaluationExercisePath, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { BigCard } from '../../design-system/big-card.tsx'
import { ExerciseSkeleton } from './exercise-skeleton.tsx'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../design-system/button.tsx'
import { WithNavbar } from '../../navbar/with-navbar.tsx'
import { useGeneratePronunciationEvaluationExerciseMutation } from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { useFrequencySliderPosition, useFrequencyWordLength } from '@/hooks/api/user-settings/user-settings-hooks'

export const NewStandardPronunciationEvaluationExerciseView = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const { data: topicsData } = useTopics()
  const topics = useMemo(() => topicsData ?? [], [topicsData])
  const frequencyListPosition = useFrequencySliderPosition(studyLanguage)
  const wordLength = useFrequencyWordLength(studyLanguage)

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { mutate: generateExercise } = useGeneratePronunciationEvaluationExerciseMutation(
    studyLanguage,
    frequencyListPosition,
    wordLength,
    dialect,
    topics
  )

  useEffect(() => {
    generateExercise(undefined, {
      onSuccess: (exerciseData) => {
        queryClient.setQueryData([QUERY_KEYS.PRONUNCIATION_EVALUATION_EXERCISE, exerciseData.id], exerciseData)

        if (exerciseData.wordsFromExerciseThatAreSaved) {
          exerciseData.wordsFromExerciseThatAreSaved.forEach(({ word, language }) => {
            if (word) {
              queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, language], true)
            }
          })
        }

        navigate(buildPronunciationEvaluationExercisePath(exerciseData.id, 'standard'), {
          replace: true,
        })
      },
      onError: () => {
        navigate(ROUTE_PATHS.DASHBOARD)
      },
    })
  }, [dialect, frequencyListPosition, generateExercise, navigate, queryClient, studyLanguage, topics, wordLength])

  const handleGoToDashboard = () => {
    POSTHOG_EVENTS.click('go_back')
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
          <ExerciseSkeleton />
        </BigCard>
      </div>
    </WithNavbar>
  )
}
