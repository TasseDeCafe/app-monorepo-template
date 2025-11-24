import { View, Text } from 'react-native'
import { Skeleton } from '@/components/ui/skeleton'
import { useLingui } from '@lingui/react/macro'

export const StressExerciseSkeleton = () => {
  const { t } = useLingui()

  return (
    <View className='flex-1 p-4'>
      <View className='mb-6 items-center gap-2 pb-4'>
        <Text className='text-2xl font-semibold text-gray-600'>{t`Getting your exercise ready...`}</Text>
        <Skeleton className='h-6 w-1/2 rounded-md' />
      </View>
      <View className='mb-6 items-center'>
        <Skeleton className='h-8 w-48 rounded-md' />
      </View>
      <View className='my-4'>
        <Skeleton className='mb-2 h-6 w-full rounded-md' />
        <Skeleton className='h-6 w-3/4 rounded-md' />
      </View>
      <View className='my-8 items-center'>
        <Skeleton className='h-8 w-36 rounded-md' />
      </View>
      <View className='my-8 flex-row justify-center gap-3'>
        <Skeleton className='h-12 w-16 rounded-xl' />
        <Skeleton className='h-12 w-16 rounded-xl' />
      </View>
    </View>
  )
}
