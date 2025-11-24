import React from 'react'
import { Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import colors from 'tailwindcss/colors'
import { useCurrentStreak, useGetNumberOfDaysOfNextStreakBadge } from '@/hooks/api/words/words-hooks'
import { useLingui } from '@lingui/react/macro'

export const StreakCard = () => {
  const { t } = useLingui()

  const currentStreak = useCurrentStreak()
  const numberOfDaysOfNextStreakBadge = useGetNumberOfDaysOfNextStreakBadge()
  const daysLeft = numberOfDaysOfNextStreakBadge - currentStreak

  return (
    <View className='overflow-hidden rounded-2xl'>
      <LinearGradient colors={[colors.indigo[200], colors.violet[200]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View className='flex-row items-center p-5'>
          <View className='mr-4 items-center justify-center rounded-xl bg-white p-5'>
            <Text className='text-xl font-medium text-indigo-500'>
              {currentStreak}/{numberOfDaysOfNextStreakBadge}
            </Text>
          </View>
          <View className='flex-1 pr-6'>
            <View className='flex-row items-center'>
              <Text className='text-lg font-medium text-indigo-800'>{t`${currentStreak}-day streak`}</Text>
            </View>
            <Text className='mt-1 text-indigo-900'>
              {t`${daysLeft} days left to achieve ${numberOfDaysOfNextStreakBadge}-day streak badge!`}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}
