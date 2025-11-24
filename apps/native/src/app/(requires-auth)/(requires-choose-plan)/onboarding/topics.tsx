import { Button } from '@/components/ui/button'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft } from 'lucide-react-native'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { AVAILABLE_TOPICS, Topic } from '@template-app/core/constants/topics'
import colors from 'tailwindcss/colors'
import { withOpacity } from '@template-app/core/utils/tailwind-utils'
import { usePatchTopics } from '@/hooks/api/user/user-hooks'
import { TopicCard } from '@/components/ui/topic-card'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import { LANGUAGES_WITH_MULTIPLE_DIALECTS, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import {
  useOnboardingNavigationCleanup,
  useRedirectToNextOnboardingStep,
} from '@/hooks/use-onboarding-navigation-cleanup'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { useLingui } from '@lingui/react/macro'

export default function ChooseTopicView() {
  const { t } = useLingui()

  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState<Topic[]>([])
  const setHasJustSelectedTopics = useUserOnboardingStore((state) => state.setHasJustSelectedTopics)
  const setTopics = useUserOnboardingStore((state) => state.setTopics)
  const setStoredStudyLanguage = useUserOnboardingStore((state) => state.setStudyLanguage)
  const setStoredDialect = useUserOnboardingStore((state) => state.setDialect)
  const storedStudyLanguage = useUserOnboardingStore((state) => state.studyLanguage)
  const [canGoBack, setCanGoBack] = useState(false)

  useRedirectToNextOnboardingStep()

  useOnboardingNavigationCleanup(() => {
    if (LANGUAGES_WITH_MULTIPLE_DIALECTS.includes(storedStudyLanguage as SupportedStudyLanguage)) {
      setStoredDialect(null)
    } else {
      setStoredStudyLanguage(null)
    }
  }, [setStoredDialect, setStoredStudyLanguage, storedStudyLanguage])

  const { mutate: patchTopics, isPending } = usePatchTopics({
    meta: {
      showSuccessToast: false,
    },
  })

  useEffect(() => {
    setCanGoBack(router.canGoBack())
  }, [router])

  const handleComplete = () => {
    patchTopics(
      { topics: selectedTopic },
      {
        onSuccess: () => {
          setHasJustSelectedTopics(true)
          setTopics(selectedTopic)
        },
        onError: () => {
          // todo onboarding: add error toast or alert
        },
      }
    )
  }

  const handleSkip = () => {
    patchTopics(
      { topics: [] },
      {
        onSuccess: () => {
          setHasJustSelectedTopics(true)
          setTopics([])
        },
      }
    )
  }

  const handleBack = () => {
    POSTHOG_EVENTS.click('go_back')
    router.back()
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic([topic])
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
            <ArrowLeft size={24} color='#6B7280' />
          </TouchableOpacity>
        )}
      </View>
      <View className='flex-1 px-4'>
        {/* Title */}
        <View className='mb-6 px-4'>
          <Text className='mb-2 text-center text-4xl font-bold text-stone-900'>
            {t`Which topic do you want to focus on?`}
          </Text>
          <Text className='text-center text-lg text-gray-500'>{t`(You can always change it later)`}</Text>
        </View>

        {/* Topics Grid */}
        <View style={{ flex: 1, position: 'relative' }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
            <View className='flex-row flex-wrap justify-center gap-2'>
              {AVAILABLE_TOPICS.map((topic) => (
                <View key={topic} className='mb-2 w-auto'>
                  <TopicCard
                    topic={topic}
                    isSelected={selectedTopic[0] === topic}
                    onSelect={() => handleTopicSelect(topic)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

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
            disabled={!selectedTopic || isPending}
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
