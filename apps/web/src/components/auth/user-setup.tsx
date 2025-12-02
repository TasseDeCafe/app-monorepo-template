import { useEffect } from 'react'
import { useCreateOrUpdateUser, useIsUserSetupComplete } from '@/hooks/api/user/user-hooks'
import { useAuthStore, getAccessToken } from '@/stores/auth-store'
import { useTrackingStore } from '@/stores/tracking-store'
import { useShallow } from 'zustand/react/shallow'

export const UserSetup = () => {
  const accessToken = useAuthStore(getAccessToken)
  const isUserSetupComplete = useIsUserSetupComplete()

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

  return <></>
}
