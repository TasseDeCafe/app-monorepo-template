import { PlanInterval } from '@template-app/core/constants/pricing-constants.ts'

export const ROUTE_PATHS = {
  DASHBOARD: '/dashboard',
  PRICING: '/pricing',
  PRICING_FREE_TRIAL: '/pricing/free-trial',

  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SIGN_IN_EMAIL: '/sign-in/email',
  SIGN_UP_EMAIL: '/sign-up/email',
  SIGN_IN_EMAIL_VERIFICATION_SENT: '/sign-in/email/verification-sent',
  SIGN_UP_EMAIL_VERIFICATION_SENT: '/sign-up/email/verification-sent',
  SIGN_IN_UP_EMAIL_VERIFY: '/sign-in-up/email/verify',

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
