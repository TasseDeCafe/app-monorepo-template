import { useEffect } from 'react'
import { useCreateOrUpdateUser, useIsUserSetupComplete } from '@/hooks/api/user/user-hooks'
import { useAuthStore, getAccessToken, getUserId, getUserEmail } from '@/stores/auth-store'
import { getTrackingParams, useTrackingStore } from '@/stores/tracking-store'
import { useShallow } from 'zustand/react/shallow'
import posthog from 'posthog-js'
import { checkIsTestUser } from '@/utils/test-users-utils'

export const UserSetup = () => {
  const accessToken = useAuthStore(getAccessToken)
  const isUserSetupComplete = useIsUserSetupComplete()
  const userId = useAuthStore(getUserId)
  const urlParams = useTrackingStore(getTrackingParams)
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
    if (accessToken && !isUserSetupComplete) {
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
    if (userId && urlParams && !isTestUser && isUserSetupComplete) {
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
  }, [userId, urlParams, isTestUser, isUserSetupComplete])

  return <></>
}
