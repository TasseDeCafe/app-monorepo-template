import React from 'react'
import { View } from 'react-native'
import { Skeleton } from '@/components/ui/skeleton'

export const NarrowSkeleton = () => {
  return (
    <View className='h-6 w-full items-center justify-center'>
      <Skeleton className='h-4 w-full rounded-xl' />
    </View>
  )
}
