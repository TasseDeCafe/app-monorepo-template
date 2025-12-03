import { useEffect } from 'react'
import { useCreateOrUpdateUser, useIsUserSetupComplete } from '@/hooks/api/user/user-hooks'
import { getAccessToken, getUserEmail, getUserId, useAuthStore } from '@/stores/auth-store'
import { useTrackingStore } from '@/stores/tracking-store'
import { useShallow } from 'zustand/react/shallow'
import posthog from 'posthog-js'
import { checkIsTestUser } from '@/utils/test-users-utils'

export const UserSetup = () => {
  const accessToken = useAuthStore(getAccessToken)
  const isUserSetupComplete = useIsUserSetupComplete()
  const userId = useAuthStore(getUserId)
  const email = useAuthStore(getUserEmail)
  const isTestUser = checkIsTestUser(email)

  // Use useShallow to prevent object reference changes from causing re-renders
  const trackingParams = useTrackingStore(
    useShallow((state) => ({
      referral: state.referral,
      utmSource: state.utmSource,
      utmMedium: state.utmMedium,
      utmCampaign: state.utmCampaign,
      utmTerm: state.utmTerm,
      utmContent: state.utmContent,
    }))
  )

  const { mutate: getOrCreateUserData } = useCreateOrUpdateUser()

  useEffect(() => {
    if (accessToken && !isUserSetupComplete && trackingParams) {
      // TODO: this mutation fires multiple times when multiple windows are open. This might because of the local storage
      // being shared between windows, or some other reason. See this PR: GRAM-1561/fix/insertuser-duplicate-key-value-violates-unique-constraint-users_pkey
      getOrCreateUserData({
        referral: trackingParams.referral,
        utmSource: trackingParams.utmSource,
        utmMedium: trackingParams.utmMedium,
        utmCampaign: trackingParams.utmCampaign,
        utmTerm: trackingParams.utmTerm,
        utmContent: trackingParams.utmContent,
      })
    }
  }, [accessToken, getOrCreateUserData, isUserSetupComplete, trackingParams])

  useEffect(() => {
    // we need isUserSetupComplete so that we know the real referral of the user
    if (userId && trackingParams && !isTestUser && isUserSetupComplete) {
      posthog.identify(userId, {
        $set_once: {
          referral: trackingParams.referral,
          utm_source: trackingParams.utmSource,
          utm_medium: trackingParams.utmMedium,
          utm_campaign: trackingParams.utmCampaign,
          utm_term: trackingParams.utmTerm,
          utm_content: trackingParams.utmContent,
        },
      })
    }
  }, [userId, trackingParams, isTestUser, isUserSetupComplete])

  return <></>
}
