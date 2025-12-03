import { useEffect } from 'react'
import { getConfig } from '@/config/environment-config'
import { identifyUserWithSentry, initializeSentry } from './sentry/sentry-initializer.ts'
import * as Sentry from '@sentry/react'
import { getUserId, useAuthStore } from '@/stores/auth-store'

export const AnalyticsInitializer = () => {
  const userId = useAuthStore(getUserId)

  useEffect(() => {
    if (userId) {
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
