import { PlanInterval } from '@template-app/core/constants/pricing-constants.ts'

export const ROUTE_PATHS = {
  DASHBOARD: '/dashboard',
  PRICING: '/pricing',
  PRICING_FREE_TRIAL: '/pricing/free-trial',

  LOGIN: '/login',
  LOGIN_EMAIL: '/login/email',
  LOGIN_EMAIL_SENT: '/login/email/sent',
  LOGIN_EMAIL_VERIFY: '/login/email/verify',

  ACCOUNT_REMOVED: '/account/removed',
  ADMIN_SETTINGS: '/top-secret-admin-settings',
  REDIRECT_TO_CHECK_OUT: '/redirect-to-check-out/:planInterval',
  FROM_LANDING: '/from-landing',
  CHECKOUT_SUCCESS: '/checkout-success',
}

export const buildCheckOutRightAfterSignUpPath = (planInterval: string) => {
  return `/redirect-to-check-out/${planInterval}`
}

export const buildPricingFreeTrialPath = (plan: PlanInterval) => {
  return `${ROUTE_PATHS.PRICING_FREE_TRIAL}?planInterval=${plan}`
}
