import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  selectAnalyticsCookiesAccepted,
  selectEmail,
  selectIsBackendUserInfoLoaded,
  selectReferral,
  selectUserId,
} from '../state/slices/account-slice.ts'
import { getConfig } from '../config/environment-config.ts'
import { initializeFullstory } from './fullstory/fullstory-initializer.ts'
import { identifyUserForPosthog, initializePosthog } from './posthog/posthog-initializer.ts'
import { identifyUserWithSentry, initializeSentry } from './sentry/sentry-initializer.ts'
import * as Sentry from '@sentry/react'
import { checkIsTestUser } from '../utils/test-users-utils.ts'

export const AnalyticsInitializer = () => {
  const userId = useSelector(selectUserId)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)
  const referral = useSelector(selectReferral)
  const email = useSelector(selectEmail)
  const isTestUser = checkIsTestUser(email)
  const analyticsCookiesAccepted = useSelector(selectAnalyticsCookiesAccepted)

  useEffect(() => {
    // todo posthog: go through these docs: https://posthog.com/docs/libraries/js/persistence and make sure it's correct
    if (analyticsCookiesAccepted) {
      if (getConfig().posthogToken) {
        initializePosthog()
      }
    }
  }, [analyticsCookiesAccepted])

  useEffect(() => {
    if (userId && !isTestUser && isBackendUserInfoLoaded && analyticsCookiesAccepted) {
      if (getConfig().posthogToken) {
        identifyUserForPosthog(userId, referral)
      }
    }
    // we need isBackendUserInfoLoaded so that we know the real referral of the user
  }, [isBackendUserInfoLoaded, userId, referral, isTestUser, analyticsCookiesAccepted])

  useEffect(() => {
    if (userId && !isTestUser) {
      if (analyticsCookiesAccepted) {
        // the below are not essential analytics so that we need the user's permission for that
        if (getConfig().fullstoryOrganizationId) {
          initializeFullstory(userId)
        }
      }
    }
  }, [userId, isTestUser, analyticsCookiesAccepted])

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
