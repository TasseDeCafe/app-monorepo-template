import { StripeCustomerId } from '../../transport/third-party/stripe/stripe-api'
import { PlanInterval, SUPPORTED_STRIPE_CURRENCY } from '@template-app/core/constants/pricing-constants'

export interface StripeServiceInterface {
  createCheckoutSession: (
    userId: string,
    userEmail: string,
    successPathAndHash: string,
    cancelPathAndHash: string,
    plan: PlanInterval,
    currency?: SUPPORTED_STRIPE_CURRENCY
  ) => Promise<string | null>

  createStripeCustomer: (userId: string, userEmail: string, referral: string | null) => Promise<StripeCustomerId | null>
}
