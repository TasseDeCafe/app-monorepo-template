import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectHasAllowedReferral, selectIsBackendUserInfoLoaded } from '@/state/slices/account-slice.ts'
import { FullViewSquaresLoader } from '../../loader/full-view-squares-loader.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { getConfig } from '@/config/environment-config.ts'
import { shouldShowPaywall } from '@/components/auth/payment/require-credit-card-route.utils.ts'
import { SUPPORTED_STRIPE_CURRENCY } from '@template-app/core/constants/pricing-constants'
import { POLISH_LOCALE } from '@template-app/i18n/i18n-config'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'
import { getBrowserLocale } from '@/i18n/i18n'

export const RequirePremiumPlanRoute = () => {
  const hasAllowedReferral = useSelector(selectHasAllowedReferral)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)
  const currency: SUPPORTED_STRIPE_CURRENCY =
    getBrowserLocale() === POLISH_LOCALE ? SUPPORTED_STRIPE_CURRENCY.PLN : SUPPORTED_STRIPE_CURRENCY.EUR

  const { data: subscriptionData, isPending } = useGetSubscriptionDetails(currency)

  if (isPending || !isBackendUserInfoLoaded) {
    return <FullViewSquaresLoader />
  } else {
    if (
      shouldShowPaywall(
        hasAllowedReferral,
        getConfig().featureFlags.isCreditCardRequiredForAll(),
        getConfig().featureFlags.shouldAppBeFreeForEveryone(),
        !!subscriptionData?.isPremiumUser
      )
    ) {
      return <Navigate to={ROUTE_PATHS.PRICING} replace />
    }
  }

  return <Outlet />
}
