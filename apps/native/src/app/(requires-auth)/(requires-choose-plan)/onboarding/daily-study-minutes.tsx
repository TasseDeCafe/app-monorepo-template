import { Button } from '@/components/ui/button'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { DAILY_STUDY_TIME_ONBOARDING_OPTIONS } from '@template-app/core/constants/daily-study-constants'
import { usePatchDailyStudyMinutes } from '@/hooks/api/user/user-hooks'
import { DailyStudyTimeCard } from '@/components/ui/daily-study-time-card'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import {
  useOnboardingNavigationCleanup,
  useRedirectToNextOnboardingStep,
} from '@/hooks/use-onboarding-navigation-cleanup'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { useLingui } from '@lingui/react/macro'

export default function DailyStudyMinutesView() {
  const { t } = useLingui()

  const router = useRouter()
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)
  const setDailyStudyMinutes = useUserOnboardingStore((state) => state.setDailyStudyMinutes)
  const setTopics = useUserOnboardingStore((state) => state.setTopics)
  const setHasJustSelectedTopics = useUserOnboardingStore((state) => state.setHasJustSelectedTopics)
  const [canGoBack, setCanGoBack] = useState(false)

  useRedirectToNextOnboardingStep()

  useOnboardingNavigationCleanup(() => {
    setHasJustSelectedTopics(false)
  }, [setTopics])

  const { mutate: patchDailyStudyMinutes, isPending } = usePatchDailyStudyMinutes({
    meta: {
      showSuccessToast: false,
    },
  })
  useEffect(() => {
    setCanGoBack(router.canGoBack())
  }, [router])

  const handleComplete = () => {
    if (selectedMinutes) {
      patchDailyStudyMinutes(
        { dailyStudyMinutes: selectedMinutes },
        {
          onSuccess: () => {
            setDailyStudyMinutes(selectedMinutes)
          },
          onError: () => {
            // todo onboarding: add error toast or alert
          },
        }
      )
    }
  }

  const handleBack = () => {
    POSTHOG_EVENTS.click('go_back')
    router.back()
  }

  const handleMinutesClick = (minutes: number) => {
    if (selectedMinutes === minutes) {
      setSelectedMinutes(null)
    } else {
      setSelectedMinutes(minutes)
    }
  }

  return (
    <OnboardingLayout>
      {/* Header with Back button */}
      <View className='w-full flex-row justify-between p-4'>
        {canGoBack && (
          <TouchableOpacity onPress={handleBack} disabled={isPending}>
            <ArrowLeft size={24} color='#6B7280' />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
      </View>
      <View className='flex-1 px-4'>
        {/* Title */}
        <View className='mb-6 px-4'>
          <Text className='mb-2 text-center text-4xl font-bold text-stone-900'>
            {t`Choose your daily goal for learning`}
          </Text>
          <Text className='text-center text-lg text-gray-500'>{t`(You can always change it later)`}</Text>
        </View>

        {/* Daily Study Time Options */}
        <View className='flex-1 gap-y-2'>
          {DAILY_STUDY_TIME_ONBOARDING_OPTIONS.map((minutes) => (
            <DailyStudyTimeCard
              key={minutes}
              minutes={minutes}
              handleClick={handleMinutesClick}
              isSelected={selectedMinutes === minutes}
            />
          ))}
        </View>

        {/* Bottom Navigation */}
        <View className='py-4'>
          <Button
            variant='default'
            size='lg'
            onPress={handleComplete}
            disabled={!selectedMinutes || isPending}
            loading={isPending}
            className='bg-indigo-600'
            textClassName='text-2xl'
          >
            {isPending ? t`Loading...` : t`Continue`}
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  )
}
