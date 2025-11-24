import { PostHog } from 'posthog-node'
import { getConfig } from '../../../config/environment-config'

const POSTHOG_HOST = 'https://us.i.posthog.com'

const createPosthogClient = (): PostHog => {
  const config = getConfig()
  return new PostHog(config.posthogApiKey, {
    host: POSTHOG_HOST,
    enableExceptionAutocapture: true,
  })
}

export const posthogClient = createPosthogClient()

let hasRegisteredShutdownHandlers = false

const shutdownPosthogClient = async (): Promise<void> => {
  try {
    await posthogClient.shutdown()
  } catch (error) {
    console.warn('Failed to shutdown PostHog client gracefully', error)
  }
}

export const registerPosthogShutdownHandlers = (): void => {
  if (hasRegisteredShutdownHandlers) {
    return
  }

  hasRegisteredShutdownHandlers = true

  process.once('beforeExit', () => {
    void shutdownPosthogClient()
  })
  ;['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.once(signal as NodeJS.Signals, () => {
      void shutdownPosthogClient()
    })
  })
}
