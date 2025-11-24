import * as Sentry from '@sentry/react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import { getConfig } from '@/config/environment-config'

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: Constants.executionEnvironment === ExecutionEnvironment.StoreClient,
})

export const initializeSentry = () => {
  const config = getConfig()

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.environmentName,
    ...config.sentry.options,
    integrations: [
      // See https://docs.sentry.io/platforms/react-native/tracing/instrumentation/expo-router/
      navigationIntegration,
      // See https://docs.sentry.io/platforms/react-native/session-replay
      Sentry.mobileReplayIntegration({
        maskAllText: false,
        maskAllImages: false,
        maskAllVectors: false,
      }),
    ],
  })
}

export const identifyUserWithSentry = (userId: string) => {
  Sentry.setUser({ id: userId })
}

export const clearSentryUser = () => {
  Sentry.setUser(null)
}
