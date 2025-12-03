import { PostHog } from 'posthog-react-native'
import { getConfig } from '@/config/environment-config'

// https://posthog.com/docs/libraries/react-native
export const posthog = new PostHog(getConfig().posthogToken, {
  host: getConfig().posthogHost,
  enableSessionReplay: true,
})

posthog.debug(true)
