import React from 'react'
import { Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import colors from 'tailwindcss/colors'
import { useLongestStreak } from '@/hooks/api/words/words-hooks'
import { Zap } from 'lucide-react-native'
import { useLingui } from '@lingui/react/macro'

export const LongestStreakCard = () => {
  const { t } = useLingui()

  const longestStreak = useLongestStreak()

  return (
    <View className='overflow-hidden rounded-2xl'>
      <LinearGradient colors={[colors.orange[100], colors.red[50]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View className='flex-row items-center p-5'>
          <View className='mr-4 items-center justify-center rounded-xl bg-white p-5'>
            <Zap size={24} color={colors.orange[500]} />
          </View>
          <View className='flex-1 pr-6'>
            <View className='flex-row items-center'>
              <Text className='text-lg font-medium text-orange-800'>{t`${longestStreak}-day streak`}</Text>
            </View>
            <Text className='mt-1 text-orange-900'>{t`Your Longest Streak`}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}
