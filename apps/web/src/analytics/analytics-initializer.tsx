import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  selectEmail,
  selectIsBackendUserInfoLoaded,
  selectReferral,
  selectUserId,
} from '../state/slices/account-slice.ts'
import { getConfig } from '../config/environment-config.ts'
import { identifyUserForPosthog } from './posthog/posthog-initializer.ts'
import { identifyUserWithSentry, initializeSentry } from './sentry/sentry-initializer.ts'
import * as Sentry from '@sentry/react'
import { checkIsTestUser } from '../utils/test-users-utils.ts'

export const AnalyticsInitializer = () => {
  const userId = useSelector(selectUserId)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)
  const referral = useSelector(selectReferral)
  const email = useSelector(selectEmail)
  const isTestUser = checkIsTestUser(email)

  useEffect(() => {
    if (userId && !isTestUser && isBackendUserInfoLoaded) {
      if (getConfig().posthogToken) {
        identifyUserForPosthog(userId, referral)
      }
    }
    // we need isBackendUserInfoLoaded so that we know the real referral of the user
  }, [isBackendUserInfoLoaded, userId, referral, isTestUser])

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
