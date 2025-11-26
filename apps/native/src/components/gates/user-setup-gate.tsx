import { ReactNode, useEffect } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateOrUpdateUser } from '@/hooks/api/user/user-hooks'
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

  const {
    mutate: getOrCreateUserData,
    isPending: isUserPending,
    isError: isUserSetupError,
  } = useCreateOrUpdateUser({
    meta: {
      showSuccessToast: false,
    },
  })

  const accessToken = session?.access_token
  const userId = session?.user.id

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
      getOrCreateUserData({
        referral: urlParams.referral,
        utmSource: urlParams.utmSource,
        utmMedium: urlParams.utmMedium,
        utmCampaign: urlParams.utmCampaign,
        utmTerm: urlParams.utmTerm,
        utmContent: urlParams.utmContent,
      })
    }
  }, [accessToken, getOrCreateUserData, urlParams])

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
