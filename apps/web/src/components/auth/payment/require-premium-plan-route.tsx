import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectHasAllowedReferral, selectIsBackendUserInfoLoaded } from '@/state/slices/account-slice.ts'
import { FullViewLoader } from '../../loader/full-view-loader.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { getConfig } from '@/config/environment-config.ts'
import { shouldShowPaywall } from '@/components/auth/payment/require-credit-card-route.utils.ts'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'

export const RequirePremiumPlanRoute = () => {
  const hasAllowedReferral = useSelector(selectHasAllowedReferral)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)
  const { data: subscriptionData, isPending } = useGetSubscriptionDetails()

  if (isPending || !isBackendUserInfoLoaded) {
    return <FullViewLoader />
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
