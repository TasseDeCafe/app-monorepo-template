import { View, Text } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ScrollView } from 'react-native-gesture-handler'

import { Skeleton } from '@/components/ui/skeleton'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useTranslateText } from '@/hooks/api/translation/translation-hooks'
import { useLingui } from '@lingui/react/macro'

export const TranslationSheetContent = () => {
  const { t } = useLingui()

  const queryClient = useQueryClient()
  const { defaultedUserData } = useGetUser()
  const dialect = defaultedUserData.studyDialect
  const motherLanguage = defaultedUserData.motherLanguage

  const { data: currentExerciseText, isFetching: isFetchingExerciseText } = useQuery<string>({
    queryKey: [QUERY_KEYS.EXERCISE_TEXT],
    queryFn: () => queryClient.getQueryData<string>([QUERY_KEYS.EXERCISE_TEXT]) ?? '',
  })

  const expectedText = currentExerciseText ?? ''

  const { data: translateData, isFetching: isFetchingTextTranslation } = useTranslateText(
    expectedText,
    dialect,
    motherLanguage
  )

  const translatedText = translateData?.translation?.trim()

  return (
    <ScrollView className='flex-1'>
      <View className='p-4'>
        {/* Title */}
        <Text className='mb-6 text-center text-2xl font-bold text-gray-900'>{t`Translation`}</Text>

        <View className='mb-4 rounded-xl bg-white p-4'>
          <View className='mb-2 flex-row items-center'>
            <Text className='text-sm font-medium text-gray-600'>{t`Translation`}</Text>
          </View>
          {isFetchingTextTranslation || !translatedText ? (
            <Skeleton className='h-8 w-full rounded' />
          ) : (
            <Text className='text-base leading-relaxed text-gray-700'>{translatedText}</Text>
          )}
        </View>

        <View className='mb-4 rounded-xl bg-white p-4'>
          <View className='mb-2 flex-row items-center'>
            <Text className='text-sm font-medium text-gray-600'>{t`Original Text`}</Text>
          </View>
          {isFetchingExerciseText || !expectedText ? (
            <Skeleton className='h-8 w-full rounded' />
          ) : (
            <Text className='text-base leading-relaxed text-gray-700'>{expectedText}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
