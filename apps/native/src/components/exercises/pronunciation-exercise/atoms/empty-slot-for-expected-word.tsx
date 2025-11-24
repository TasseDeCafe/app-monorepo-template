import React from 'react'
import { View } from 'react-native'

export const EmptySlotForExpectedWord = () => {
  return (
    <View className='relative h-10 min-w-[30px] items-center justify-center rounded-xl border-l border-r border-t border-gray-200'>
      <View className='absolute bottom-0 left-1 right-1 h-[2px] rounded-b-xl bg-red-200' />
    </View>
  )
}
