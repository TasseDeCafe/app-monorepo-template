import { getConfig } from '@/config/environment-config.ts'
import posthog from 'posthog-js'

export const initializePosthog = () => {
  posthog.init(getConfig().posthogToken, {
    api_host: 'https://us.i.posthog.com',
    persistence: 'localStorage+cookie',
  })
}

export const identifyUserForPosthog = (userId: string, referral: string | null) => {
  // todo posthog: use $setonce for referral
  // https://posthog.com/docs/product-analytics/identify
  posthog.identify(userId, {}, { referral })
}
