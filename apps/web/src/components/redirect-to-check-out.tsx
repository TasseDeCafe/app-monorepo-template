import { selectIsBackendUserInfoLoaded, selectReferral } from '../state/slices/account-slice.ts'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { buildPricingFreeTrialPath, ROUTE_PATHS } from '../routing/route-paths.ts'
import { FullViewSquaresLoader } from './loader/full-view-squares-loader.tsx'
import { POLISH_LOCALE } from '@yourbestaccent/i18n/i18n-config'
import { SUPPORTED_STRIPE_CURRENCY } from '@yourbestaccent/core/constants/pricing-constants'
import { useCheckoutMutation } from '@/hooks/api/checkout/checkout-hooks'
import { getBrowserLocale } from '@/i18n/i18n'

// This component is reached after the route /from-landing.
// We want to redirect users who clicked on the premium button on the landing page to be directed to the checkout page
// right after signing up. We need this additional route because Supabase login will strip search params from the url,
// so we have to send the user to a new route that uses a query param in order to preserve the priceId.
export const RedirectToCheckOut = () => {
  const navigate = useNavigate()
  const params = useParams<{ planInterval: string }>()
  const referral = useSelector(selectReferral)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)
  const currency: SUPPORTED_STRIPE_CURRENCY =
    getBrowserLocale() === POLISH_LOCALE ? SUPPORTED_STRIPE_CURRENCY.PLN : SUPPORTED_STRIPE_CURRENCY.EUR

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
            currency,
          })
        }
      } else {
        navigate(ROUTE_PATHS.DASHBOARD)
      }
    }
  }, [params.planInterval, mutate, isBackendUserInfoLoaded, referral, navigate, currency])

  return <FullViewSquaresLoader />
}
