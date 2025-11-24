import React from 'react'
import { View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { BarChart2, FileText, Layers } from 'lucide-react-native'
import { ExerciseItem } from '@/components/ui/exercise-item'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { useLingui } from '@lingui/react/macro'

export const ExercisesList = () => {
  const { t } = useLingui()

  const router = useRouter()

  return (
    <View className='flex-1 bg-indigo-50'>
      <Stack.Screen />
      <ExerciseItem
        icon={Layers}
        title={t`Pronunciation practice`}
        description={t`Pronounce words tailored to your language level`}
        onPress={() => {
          POSTHOG_EVENTS.click('level_based_exercise')
          router.push(ROUTE_PATHS.PRONUNCIATION_EVALUATION_STANDARD_EXERCISE_START)
        }}
      />
      <ExerciseItem
        icon={BarChart2}
        title={t`Stress practice`}
        description={t`Master word stress patterns in sentences`}
        onPress={() => {
          POSTHOG_EVENTS.click('stress_exercise')
          router.push('/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/exercises/stress')
        }}
      />
      <ExerciseItem
        icon={FileText}
        title={t`Custom pronunciation practice`}
        description={t`Use your own text for targeted practice`}
        onPress={() => {
          POSTHOG_EVENTS.click('custom_exercise')
          router.push(ROUTE_PATHS.PRONUNCIATION_EVALUATION_CUSTOM_EXERCISE_START)
        }}
      />
    </View>
  )
}
