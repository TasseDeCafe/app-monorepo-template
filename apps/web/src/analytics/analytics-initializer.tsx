import { useEffect } from 'react'
import { getConfig } from '@/config/environment-config'
import { identifyUserForPosthog } from './posthog/posthog-initializer.ts'
import { identifyUserWithSentry, initializeSentry } from './sentry/sentry-initializer.ts'
import * as Sentry from '@sentry/react'
import { checkIsTestUser } from '@/utils/test-users-utils'
import { useAuthStore, getUserId, getUserEmail } from '@/stores/auth-store'
import { useTrackingStore } from '@/stores/tracking-store'

export const AnalyticsInitializer = () => {
  const userId = useAuthStore(getUserId)
  const isUserSetupComplete = useAuthStore((state) => state.isUserSetupComplete)
  const referral = useTrackingStore((state) => state.referral)
  const email = useAuthStore(getUserEmail)
  const isTestUser = checkIsTestUser(email)

  useEffect(() => {
    if (userId && !isTestUser && isUserSetupComplete) {
      if (getConfig().posthogToken) {
        identifyUserForPosthog(userId, referral)
      }
    }
    // we need isUserSetupComplete so that we know the real referral of the user
  }, [isUserSetupComplete, userId, referral, isTestUser])

  useEffect(() => {
    if (userId) {
      // no need to check for cookies because sentry is an error logging software, not analytics software
      identifyUserWithSentry(userId)
    }
  }, [userId])

  useEffect(() => {
    if (getConfig().sentry.dsn) {
      if (!Sentry.isInitialized()) {
        initializeSentry()
      }
      if (userId) {
        Sentry.setUser({ id: userId })
      }
    }
  }, [userId])

  return <></>
}
