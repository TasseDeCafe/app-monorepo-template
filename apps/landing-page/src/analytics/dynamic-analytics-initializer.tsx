'use client'

import { useEffect } from 'react'
import { initializePosthog } from '@/analytics/posthog/posthog-initializer'
import { initializeOurAnalytics } from '@/analytics/our-analytics/our-analytics-initializer'

export const DynamicAnalyticsInitializer = () => {
  useEffect(() => {
    const checkAndInitializeAnalytics = async () => {
      await initializePosthog()
      initializeOurAnalytics()
    }
    checkAndInitializeAnalytics()
  }, [])

  return null
}
