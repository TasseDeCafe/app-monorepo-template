import { Button } from '@/components/ui/button'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { DialectCode, LANGUAGES_TO_DIALECT_MAP } from '@template-app/core/constants/lang-codes'
import { DialectCard } from '@/components/ui/dialect-card'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft } from 'lucide-react-native'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { withOpacity } from '@template-app/core/utils/tailwind-utils'
import colors from 'tailwindcss/colors'
import { usePatchStudyDialect } from '@/hooks/api/user/user-hooks'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import {
  useOnboardingNavigationCleanup,
  useRedirectToNextOnboardingStep,
} from '@/hooks/use-onboarding-navigation-cleanup'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { useLingui } from '@lingui/react/macro'

export default function ChooseDialectView() {
  const { t } = useLingui()

  const router = useRouter()

  const storedStudyLanguage = useUserOnboardingStore((state) => state.studyLanguage)
  const storedDialect = useUserOnboardingStore((state) => state.dialect)
  const setStoredDialect = useUserOnboardingStore((state) => state.setDialect)
  const setStoredStudyLanguage = useUserOnboardingStore((state) => state.setStudyLanguage)

  const [selectedDialect, setSelectedDialect] = useState<DialectCode | null>(storedDialect || null)

  const availableDialects = storedStudyLanguage ? LANGUAGES_TO_DIALECT_MAP[storedStudyLanguage] : []

  const { mutate: updateStudyDialect, isPending } = usePatchStudyDialect()

  const [canGoBack, setCanGoBack] = useState(false)

  useOnboardingNavigationCleanup(() => {
    setStoredStudyLanguage(null)
  }, [setStoredStudyLanguage])

  useRedirectToNextOnboardingStep()

  useEffect(() => {
    setCanGoBack(router.canGoBack())
  }, [router])

  const handleComplete = () => {
    if (selectedDialect) {
      updateStudyDialect(
        { studyDialect: selectedDialect },
        {
          onSuccess: () => {
            setStoredDialect(selectedDialect)
          },
        }
      )
    }
  }

  const handleSkip = () => {
    if (availableDialects.length > 0) {
      updateStudyDialect(
        { studyDialect: availableDialects[0] },
        {
          onSuccess: () => {
            setStoredDialect(availableDialects[0])
            router.push(ROUTE_PATHS.ONBOARDING_TOPICS)
            if (selectedDialect) {
              POSTHOG_EVENTS.studyDialectChanged(selectedDialect)
            }
          },
        }
      )
    } else {
      logWithSentry('No dialects available, skipping', null, {
        availableDialects,
        dialect: selectedDialect,
        storedDialect: storedDialect,
      })
      router.push(ROUTE_PATHS.ONBOARDING_TOPICS)
    }
  }

  const handleBack = () => {
    POSTHOG_EVENTS.click('go_back')
    router.back()
  }

  const handleDialectSelect = (dialect: DialectCode) => {
    if (selectedDialect === dialect) {
      setSelectedDialect(null)
    } else {
      setSelectedDialect(dialect)
    }
  }

  return (
    <OnboardingLayout>
      {/* Header with Back and Skip buttons */}
      <View className='w-full flex-row-reverse justify-between p-4'>
        <TouchableOpacity onPress={handleSkip} disabled={isPending}>
          <Text className='mr-4 text-xl text-gray-500'>{t`Skip`}</Text>
        </TouchableOpacity>
        {canGoBack && (
          <TouchableOpacity onPress={handleBack} disabled={isPending}>
            <ArrowLeft size={24} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>
      <View className='flex-1 px-4'>
        {/* Title */}
        <View className='mb-6 px-4'>
          <Text className='mb-2 text-center text-4xl font-bold text-stone-900'>
            {t`Choose the dialect you want to study:`}
          </Text>
          <Text className='text-center text-lg text-gray-500'>{t`(You can always change it later)`}</Text>
        </View>

        {/* Dialect List */}
        <View style={{ flex: 1, position: 'relative' }}>
          <FlatList
            data={availableDialects}
            numColumns={1}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className='mb-4 w-full'>
                <DialectCard dialect={item} handleClick={handleDialectSelect} isSelected={selectedDialect === item} />
              </View>
            )}
          />

          {/* Fade effect overlay */}
          <LinearGradient
            colors={[withOpacity(colors.indigo[50], 0), colors.white]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              pointerEvents: 'none',
            }}
          />
        </View>

        {/* Bottom Navigation */}
        <View className='py-4'>
          <Button
            variant='default'
            size='lg'
            onPress={handleComplete}
            disabled={!selectedDialect || isPending}
            loading={isPending}
            className='bg-indigo-600'
            textClassName='text-2xl'
          >
            {isPending ? t`Loading...` : t`Next`}
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  )
}
