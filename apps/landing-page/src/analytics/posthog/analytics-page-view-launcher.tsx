'use client'

import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'

export const AnalyticsPageViewLauncher = () => {
  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  return <></>
}
