import { ReactNode, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/stores/auth-store'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import { useCreateOrUpdateUser } from '@/hooks/api/user/user-hooks'
import { useGetMarketingPreferences } from '@/hooks/api/user-marketing-preferences/user-marketing-preferences-hooks'
import { posthog } from '@/analytics/posthog/posthog'
import { useInstallReferrerParams } from '@/hooks/use-install-referrer-params'
import { identifyUserWithSentry } from '@/analytics/sentry/sentry-initializer'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { useLingui } from '@lingui/react/macro'

type UserSetupGateProps = {
  children: ReactNode
}

export const UserSetupGate = ({ children }: UserSetupGateProps) => {
  const { t } = useLingui()

  const signOut = useAuthStore((state) => state.signOut)
  const session = useAuthStore((state) => state.session)
  const urlParams = useInstallReferrerParams()
  const [shouldFetchMarketingPreferences, setShouldFetchMarketingPreferences] = useState(false)

  const initializeOnboardingStore = useUserOnboardingStore((state) => state.initializeOnboardingStore)

  const {
    mutate: getOrCreateUserData,
    isPending: isUserPending,
    isError: isUserSetupError,
    isSuccess: isUserSetupSuccess,
  } = useCreateOrUpdateUser({
    meta: {
      showSuccessToast: false,
    },
  })

  useGetMarketingPreferences(shouldFetchMarketingPreferences && !!session?.user.id)

  const accessToken = session?.access_token
  const userId = session?.user.id

  // Handle 5-second delay after user creation, similar to frontend implementation
  useEffect(() => {
    if (isUserSetupSuccess && !isUserPending) {
      // Related to GRAM-1320 - Customer.io is not synchronous
      // Even though they return a 200 response for a new customer creation,
      // this data is not immediately retrievable
      const fiveSeconds = 5000
      setTimeout(() => {
        setShouldFetchMarketingPreferences(true)
      }, fiveSeconds)
    }
  }, [isUserSetupSuccess, isUserPending])

  useEffect(() => {
    if (userId && urlParams) {
      // Wait for utmParams
      // https://posthog.com/docs/product-analytics/identify
      posthog.identify(userId, {
        $set_once: {
          referral: urlParams.referral,
          utm_source: urlParams.utmSource,
          utm_medium: urlParams.utmMedium,
          utm_campaign: urlParams.utmCampaign,
          utm_term: urlParams.utmTerm,
          utm_content: urlParams.utmContent,
        },
      })
    }
  }, [userId, urlParams])

  useEffect(() => {
    if (accessToken && urlParams) {
      getOrCreateUserData(
        {
          referral: urlParams.referral,
          utmSource: urlParams.utmSource,
          utmMedium: urlParams.utmMedium,
          utmCampaign: urlParams.utmCampaign,
          utmTerm: urlParams.utmTerm,
          utmContent: urlParams.utmContent,
        },
        {
          onSuccess: (response) => {
            // todo onboarding: try to remove the zustand onboarding store and use react query instead
            // this is crucial to run before we start using zustand user onboarding store
            initializeOnboardingStore({
              motherLanguage: response.data.motherLanguage,
              studyLanguage: response.data.studyLanguage,
              dialect: response.data.studyDialect,
              hasVoice: response.data.hasVoice,
              topics: response.data.topics,
              dailyStudyMinutes: response.data.dailyStudyMinutes,
            })
          },
        }
      )
    }
  }, [accessToken, getOrCreateUserData, urlParams, initializeOnboardingStore])

  useEffect(() => {
    if (userId) {
      identifyUserWithSentry(userId)
    }
  }, [userId])

  if (isUserPending) {
    return <LoadingScreen message={t`Setting up account...`} />
  }

  if (isUserSetupError) {
    Alert.alert('Error', t`Could not set up your account. Please try restarting the app.`, [
      { text: 'OK', onPress: () => signOut().then(() => router.replace('/')) },
    ])
    logWithSentry('Error setting up account')
    return <LoadingScreen message={t`Error setting up account...`} />
  }

  return children
}
