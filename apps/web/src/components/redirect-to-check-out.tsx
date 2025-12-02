import { selectIsBackendUserInfoLoaded, selectReferral } from '@/state/slices/account-slice'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { buildPricingFreeTrialPath, ROUTE_PATHS } from '@/routing/route-paths'
import { FullViewLoader } from './loader/full-view-loader.tsx'
import { useCheckoutMutation } from '@/hooks/api/checkout/checkout-hooks'

// This component is reached after the route /from-landing.
// We want to redirect users who clicked on the premium button on the landing page to be directed to the checkout page
// right after signing up. We need this additional route because Supabase login will strip search params from the url,
// so we have to send the user to a new route that uses a query param in order to preserve the priceId.
export const RedirectToCheckOut = () => {
  const navigate = useNavigate()
  const params = useParams<{ planInterval: string }>()
  const referral = useSelector(selectReferral)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)

  const { mutate } = useCheckoutMutation()

  useEffect(() => {
    if (isBackendUserInfoLoaded) {
      if (params.planInterval) {
        const calculatedPlanInterval: 'month' | 'year' = params.planInterval === 'month' ? 'month' : 'year'
        if (referral) {
          navigate(buildPricingFreeTrialPath(calculatedPlanInterval))
        } else {
          mutate({
            successPathAndHash: ROUTE_PATHS.CHECKOUT_SUCCESS,
            cancelPathAndHash: ROUTE_PATHS.PRICING,
            planInterval: calculatedPlanInterval,
          })
        }
      } else {
        navigate(ROUTE_PATHS.DASHBOARD)
      }
    }
  }, [params.planInterval, mutate, isBackendUserInfoLoaded, referral, navigate])

  return <FullViewLoader />
}
