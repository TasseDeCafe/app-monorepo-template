import { Navigate, Route, Routes } from 'react-router-dom'

import { ROUTE_PATHS } from './route-paths.ts'
import { AuthView } from '@/components/auth/sign-in-up/auth-view.tsx'
import { ProtectedRoute } from '@/components/auth/protected-route.tsx'
import { PricingView } from '@/components/pricing/pricing-view.tsx'
import { AccountRemovedSuccessView } from '@/components/auth/account-removed-success-view.tsx'
import { AdminSettings } from '@/components/views/admin-settings.tsx'
import { RedirectToCheckOut } from '@/components/redirect-to-check-out.tsx'
import { FromLanding } from '@/components/auth/from-landing.tsx'
import { AuthEmailView } from '@/components/auth/sign-in-up/auth-email-view.tsx'
import { AuthEmailSentView } from '@/components/auth/sign-in-up/auth-email-sent-view.tsx'
import { AuthEmailVerifyView } from '@/components/auth/sign-in-up/auth-email-verify-view.tsx'
import { RequirePremiumPlanRoute } from '@/components/auth/payment/require-premium-plan-route.tsx'
import { CheckoutSuccessView } from '@/components/checkout/checkout-success-view'
import { DashboardView } from '@/components/dashboard/dashboard-view.tsx'
import { FreeTrialExplanationView } from '@/components/pricing/free-trial-explanation-view.tsx'

export const Router = () => {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.LOGIN} element={<AuthView />} />
      <Route path={ROUTE_PATHS.LOGIN_EMAIL} element={<AuthEmailView />} />
      <Route path={ROUTE_PATHS.LOGIN_EMAIL_SENT} element={<AuthEmailSentView />} />
      <Route path={ROUTE_PATHS.LOGIN_EMAIL_VERIFY} element={<AuthEmailVerifyView />} />
      <Route path={ROUTE_PATHS.ACCOUNT_REMOVED} element={<AccountRemovedSuccessView />} />
      <Route path={ROUTE_PATHS.ADMIN_SETTINGS} element={<AdminSettings />} />
      <Route path={ROUTE_PATHS.FROM_LANDING} element={<FromLanding />} />
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
