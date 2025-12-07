import { useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Route as checkoutSuccessRoute } from '@/routes/_protected/pricing/checkout-success'
import { Route as pricingRoute } from '@/routes/_protected/pricing/index'
import { Route as pricingFreeTrialRoute } from '@/routes/_protected/pricing/free-trial'
import { FullViewLoader } from './loader/full-view-loader.tsx'
import { useCheckoutMutation } from '@/hooks/api/checkout/checkout-hooks'
import { useTrackingStore } from '@/stores/tracking-store'
import { useIsUserSetupComplete } from '@/hooks/api/user/user-hooks'

// This component is reached after the route /from-landing.
// We want to redirect users who clicked on the premium button on the landing page to be directed to the checkout page
// right after signing up. We need this additional route because Supabase login will strip search params from the url,
// so we have to send the user to a new route that uses a query param in order to preserve the priceId.
export const RedirectToCheckOut = () => {
  const navigate = useNavigate()
  const { planInterval } = useParams({ from: '/_protected/redirect-to-check-out/$planInterval' })
  const referral = useTrackingStore((state) => state.referral)
  const isUserSetupComplete = useIsUserSetupComplete()

  const { mutate, isPending } = useCheckoutMutation()

  useEffect(() => {
    if (!isUserSetupComplete || isPending) {
      return
    }

    if (referral) {
      navigate({ to: pricingFreeTrialRoute.to, search: { planInterval } })
    } else {
      mutate({
        successPathAndHash: checkoutSuccessRoute.to,
        cancelPathAndHash: pricingRoute.to,
        planInterval: planInterval,
      })
    }
  }, [planInterval, mutate, isPending, isUserSetupComplete, referral, navigate])

  return <FullViewLoader />
}
