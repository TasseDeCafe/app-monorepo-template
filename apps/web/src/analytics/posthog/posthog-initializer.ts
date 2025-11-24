import { getConfig } from '@/config/environment-config.ts'
import posthog from 'posthog-js'

export const initializePosthog = () => {
  posthog.init(getConfig().posthogToken, {
    api_host: 'https://us.i.posthog.com',
    // we disallow it so that we never fall into the paid tier on posthog
    autocapture: false,
    persistence: 'localStorage+cookie',
  })
  if (getConfig().featureFlags.isPosthogDebugEnabled()) {
    // posthog.debug(true)
  }
}

export const identifyUserForPosthog = (userId: string, referral: string | null) => {
  // todo posthog: use $setonce for referral
  // https://posthog.com/docs/product-analytics/identify
  posthog.identify(userId, {}, { referral })
}
