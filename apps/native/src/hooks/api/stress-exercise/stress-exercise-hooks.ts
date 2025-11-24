import { useInfiniteQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useFrequencySliderPosition } from '@/hooks/api/user-settings/user-settings-hooks'

export const useGetStressExercises = () => {
  const { defaultedUserData: user } = useGetUser()
  const studyLanguage = user.studyLanguage
  const studyDialect = user.studyDialect
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
      queryKey: [QUERY_KEYS.EXERCISE_STRESS, studyDialect, studyLanguage, position],
      select: (data) => ({
        ...data,
        pages: data.pages.map((page) => {
          const exercises = page.data.exercises
          if (exercises.length === 0) {
            throw new Error('No valid exercises returned')
          }
          return exercises
        }),
      }),
    })
  )
}
