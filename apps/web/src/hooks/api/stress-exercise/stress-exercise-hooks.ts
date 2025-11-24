import { useInfiniteQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { DialectCode, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice'

import { useFrequencySliderPosition } from '@/hooks/api/user-settings/user-settings-hooks'
import { useLingui } from '@lingui/react/macro'

// We use an infinite query because we want to fetch more exercises when the user is 3 exercises away from the end
// using an InfiniteQuery makes it to concatenate the data from all pages, even though there is no true pagination
export const useGetStressExercises = () => {
  const { t } = useLingui()

  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const studyDialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const position = useFrequencySliderPosition(studyLanguage)

  return useInfiniteQuery(
    orpcQuery.stressExercise.generateStressExercises.infiniteOptions({
      input: () => ({
        position,
        language: studyLanguage,
        dialect: studyDialect,
      }),
      getNextPageParam: (_, allPages) => {
        return allPages.length
      },
      initialPageParam: 0,
      meta: {
        errorMessage: t`Error generating stress exercises`,
      },
      queryKey: [QUERY_KEYS.EXERCISE_STRESS, studyDialect, studyLanguage, position],
      select: (data) => ({
        ...data,
        pages: data.pages.map((page) => {
          const exercises = page.data.exercises
          if (exercises.length === 0) {
            throw new Error(t`No valid exercises returned`)
          }
          return exercises
        }),
      }),
    })
  )
}
