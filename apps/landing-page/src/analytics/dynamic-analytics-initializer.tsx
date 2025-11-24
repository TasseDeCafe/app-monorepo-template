'use client'

import { useEffect } from 'react'
import { initializePosthog } from '@/analytics/posthog/posthog-initializer'
import { COOKIE_CONSENT_EVENT_NAME } from '@/constants/document-event-names'
import { AGREED_TO_ALL_COOKIE } from '@yourbestaccent/core/constants/cookie-constants'
import { initializeOurAnalytics } from '@/analytics/our-analytics/our-analytics-initializer'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'

export const DynamicAnalyticsInitializer = () => {
  useEffect(() => {
    const checkAndInitializeAnalytics = async () => {
      const hasAcceptedAnalytics = document.cookie.includes(AGREED_TO_ALL_COOKIE)
      // todo posthog: go through these docs: https://posthog.com/docs/libraries/js/persistence and make sure it's correct
      if (hasAcceptedAnalytics) {
        await initializePosthog()
        POSTHOG_EVENTS.viewPage()
      }
      // consider this doing only after accepting analytics cookies
      initializeOurAnalytics()
    }

    // we have to check the cookie at the application start...
    checkAndInitializeAnalytics().then()

    const cookieChangeHandler = () => {
      checkAndInitializeAnalytics().then()
    }

    // ... and then again when the cookie changes
    document.addEventListener(COOKIE_CONSENT_EVENT_NAME, cookieChangeHandler)

    return () => {
      document.removeEventListener(COOKIE_CONSENT_EVENT_NAME, cookieChangeHandler)
    }
  }, [])

  return null
}
