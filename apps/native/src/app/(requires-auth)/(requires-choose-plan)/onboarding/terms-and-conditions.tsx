import { Button } from '@/components/ui/button'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ArrowLeft, HelpCircle } from 'lucide-react-native'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { EXTERNAL_LINKS } from '@yourbestaccent/core/constants/external-links'
import { Checkbox } from '@/components/ui/checkbox'
import { useUpdateMarketingPreferences } from '@/hooks/api/user-marketing-preferences/user-marketing-preferences-hooks'
import { BigCard } from '@/components/ui/big-card'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import {
  useOnboardingNavigationCleanup,
  useRedirectToNextOnboardingStep,
} from '@/hooks/use-onboarding-navigation-cleanup'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { useLingui } from '@lingui/react/macro'

export default function TermsConditionsView() {
  const { t } = useLingui()

  const router = useRouter()
  const [isConsentChecked, setIsConsentChecked] = useState(false)
  const [shouldReceiveMarketingEmails, setShouldReceiveMarketingEmails] = useState(true)
  const { mutate: updateMarketingPreferences, isPending } = useUpdateMarketingPreferences()
  const setHasJustAcceptedTerms = useUserOnboardingStore((state) => state.setHasJustAcceptedTerms)
  const setHasJustSelectedTopics = useUserOnboardingStore((state) => state.setHasJustSelectedTopics)
  const [canGoBack, setCanGoBack] = useState(false)

  useRedirectToNextOnboardingStep()

  useOnboardingNavigationCleanup(() => {
    setHasJustSelectedTopics(false)
  }, [setHasJustSelectedTopics])

  useEffect(() => {
    setCanGoBack(router.canGoBack())
  }, [router])

  const handleMarketingEmailsChange = (checked: boolean) => {
    setShouldReceiveMarketingEmails(checked)
    updateMarketingPreferences({ shouldReceiveMarketingEmails: checked })
  }

  const handleStartCloning = () => {
    if (isConsentChecked) {
      setHasJustAcceptedTerms(true)
    }
  }

  const handleBack = () => {
    POSTHOG_EVENTS.click('go_back')
    router.back()
  }

  const openTermsOfService = () => {
    Linking.openURL(EXTERNAL_LINKS.TERMS_OF_SERVICE_URL).then()
  }

  const openPrivacyPolicy = () => {
    Linking.openURL(EXTERNAL_LINKS.PRIVACY_POLICY_URL).then()
  }

  return (
    <OnboardingLayout>
      {/* Header with Back button */}
      <View className='flex-row justify-between p-4'>
        {canGoBack && (
          <TouchableOpacity onPress={handleBack} disabled={isPending}>
            <ArrowLeft size={24} color='#6B7280' />
          </TouchableOpacity>
        )}
        <View />
      </View>
      <View className='flex-1 px-4'>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          className='flex-1'
        >
          {/* Title */}
          <View className='mb-4 px-4'>
            <Text className='text-center text-4xl font-bold text-stone-900'>{t`Get ready`}</Text>
            <Text className='mb-6 text-center text-4xl font-bold text-stone-900'>{t`to clone your voice`}</Text>
          </View>

          <View className='mb-8 px-0'>
            <BigCard className='mb-4'>
              <View className='flex-col items-start gap-y-1 p-2'>
                <View className='flex-1'>
                  <Text className='text-lg text-gray-600'>{t`In the next step, you'll read a short text aloud. For best results, ensure you're in a quiet environment. You can make mistakes, they will not affect the voice cloning.`}</Text>
                </View>
              </View>
              <View className='flex-col items-start gap-y-1 p-2'>
                <View className='flex-1'>
                  <Text className='text-lg text-gray-600'>{t`Your voice clone will be integrated into your learning experience, tailoring exercises just for you.`}</Text>
                </View>
              </View>
              <View className='flex-col items-start gap-y-1 p-2'>
                <View className='flex-1'>
                  <Text className='text-lg text-gray-600'>{t`You can always remove your voice clone later. It's not used by anyone outside the app.`}</Text>
                </View>
              </View>
            </BigCard>
          </View>

          {/* Consent Checkboxes */}
          <View className='mb-8 gap-3 px-1'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMarketingEmailsChange(!shouldReceiveMarketingEmails)}
              className='flex-row items-center'
            >
              <View className='mr-4'>
                <Checkbox checked={shouldReceiveMarketingEmails} onCheckedChange={handleMarketingEmailsChange} />
              </View>
              <View className='flex-1 flex-row items-center'>
                <Text className='text-base text-gray-600'>{t`Receive updates and tips`}</Text>
                <TouchableOpacity className='ml-2'>
                  <HelpCircle size={18} color='#9CA3AF' />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsConsentChecked(!isConsentChecked)}
              className='flex-row'
            >
              <View className='mr-4 mt-1'>
                <Checkbox checked={isConsentChecked} onCheckedChange={(checked) => setIsConsentChecked(checked)} />
              </View>
              <View className='flex-1'>
                <Text className='text-base text-gray-600'>
                  {t`I consent to having my voice cloned for personalized learning experiences within YourBestAccent.com, and I agree to the`}{' '}
                  <Text className='text-indigo-600' onPress={openTermsOfService}>
                    {t`Terms of Service`}
                  </Text>{' '}
                  {t`and`}{' '}
                  <Text className='text-indigo-600' onPress={openPrivacyPolicy}>
                    {t`Privacy Policy`}
                  </Text>
                  .
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* Bottom Navigation */}
        <View className='py-4'>
          <Button
            variant='default'
            size='lg'
            onPress={handleStartCloning}
            disabled={!isConsentChecked}
            className='bg-indigo-600'
            textClassName='text-xl'
          >
            {t`Go to Voice Cloning`}
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  )
}
