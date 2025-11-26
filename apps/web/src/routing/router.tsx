import { Navigate, Route, Routes } from 'react-router-dom'

import { ROUTE_PATHS } from './route-paths.ts'
import { SignInUp } from '@/components/auth/sign-in-up/sign-in-up'
import { ProtectedRoute } from '@/components/auth/protected-route.tsx'
import { PricingView } from '@/components/pricing/pricing-view.tsx'
import { AccountRemovedSuccessView } from '@/components/auth/account-removed-success-view.tsx'
import { AdminSettings } from '@/components/views/admin-settings.tsx'
import { RedirectToCheckOut } from '@/components/redirect-to-check-out.tsx'
import { FromLanding } from '@/components/auth/from-landing.tsx'
import { SignInUpEmail } from '@/components/auth/sign-in-up/sign-in-up-email.tsx'
import { SignInUpEmailVerificationSentView } from '@/components/auth/sign-in-up/sign-in-up-email-verification-sent-view.tsx'
import { SignInUpEmailVerify } from '@/components/auth/sign-in-up/sign-in-up-email-verify.tsx'
import { RequirePremiumPlanRoute } from '@/components/auth/payment/require-premium-plan-route.tsx'
import { CheckoutSuccessView } from '@/components/checkout/checkout-success-view'
import { DashboardView } from '@/components/dashboard/dashboard-view.tsx'
import { FreeTrialExplanationView } from '@/components/pricing/free-trial-explanation-view.tsx'

export const Router = () => {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.SIGN_IN} element={<SignInUp isSignIn={true} />} />
      <Route path={ROUTE_PATHS.SIGN_UP} element={<SignInUp isSignIn={false} />} />
      <Route path={ROUTE_PATHS.SIGN_IN_EMAIL} element={<SignInUpEmail isSignIn={true} />} />
      <Route path={ROUTE_PATHS.SIGN_UP_EMAIL} element={<SignInUpEmail isSignIn={false} />} />
      <Route
        path={ROUTE_PATHS.SIGN_IN_EMAIL_VERIFICATION_SENT}
        element={<SignInUpEmailVerificationSentView isSignIn={true} />}
      />
      <Route
        path={ROUTE_PATHS.SIGN_UP_EMAIL_VERIFICATION_SENT}
        element={<SignInUpEmailVerificationSentView isSignIn={false} />}
      />
      <Route path={ROUTE_PATHS.ACCOUNT_REMOVED} element={<AccountRemovedSuccessView />} />
      <Route path={ROUTE_PATHS.ADMIN_SETTINGS} element={<AdminSettings />} />
      <Route path={ROUTE_PATHS.FROM_LANDING} element={<FromLanding />} />
      <Route path={ROUTE_PATHS.SIGN_IN_UP_EMAIL_VERIFY} element={<SignInUpEmailVerify />} />
      <Route path={ROUTE_PATHS.CHECKOUT_SUCCESS} element={<CheckoutSuccessView />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTE_PATHS.PRICING} element={<PricingView />} />
        <Route path={ROUTE_PATHS.PRICING_FREE_TRIAL} element={<FreeTrialExplanationView />} />
        <Route path={ROUTE_PATHS.REDIRECT_TO_CHECK_OUT} element={<RedirectToCheckOut />} />
        <Route element={<RequirePremiumPlanRoute />}>
          <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardView />} />

          <Route path={'*'} element={<Navigate replace to={ROUTE_PATHS.DASHBOARD} />} />
        </Route>
        <Route path={'*'} element={<Navigate replace to={ROUTE_PATHS.DASHBOARD} />} />
      </Route>
    </Routes>
  )
}
