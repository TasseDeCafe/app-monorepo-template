import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useCurrentStreak, useGetNumberOfDaysOfNextStreakBadge } from '@/hooks/api/words/words-hooks'
import { useLingui } from '@lingui/react/macro'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const StreakProgressBar = () => {
  const { t } = useLingui()

  const currentStreak = useCurrentStreak()
  const numberOfDaysOfNextStreakBadge = useGetNumberOfDaysOfNextStreakBadge()
  const percentageOfCurrentStreak = (currentStreak / numberOfDaysOfNextStreakBadge) * 100

  const streakProgressString = `${currentStreak}/${numberOfDaysOfNextStreakBadge} ${t`days`}`

  const width = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
    }
  })

  useEffect(() => {
    const animateProgress = async () => {
      await sleep(50)
      width.value = withTiming(percentageOfCurrentStreak, { duration: 1000 })
    }

    animateProgress().then()
  }, [width, percentageOfCurrentStreak])

  return (
    <View className='relative h-8 w-full overflow-hidden rounded-xl bg-indigo-100'>
      <Animated.View className='h-full rounded-full bg-indigo-400' style={animatedStyle} />
      <View className='absolute inset-0 flex-row items-center justify-end pr-4'>
        <Text className='text-base font-normal text-indigo-700'>{streakProgressString}</Text>
      </View>
    </View>
  )
}
