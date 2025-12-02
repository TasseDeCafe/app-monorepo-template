import { Navigate, Outlet } from 'react-router-dom'
import { FullViewLoader } from '../../loader/full-view-loader.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { getConfig } from '@/config/environment-config.ts'
import { shouldShowPaywall } from '@/components/auth/payment/require-credit-card-route.utils.ts'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'
import { useTrackingStore, getHasAllowedReferral } from '@/stores/tracking-store'
import { useAuthStore } from '@/stores/auth-store'

export const RequirePremiumPlanRoute = () => {
  const hasAllowedReferral = useTrackingStore(getHasAllowedReferral)
  const isUserSetupComplete = useAuthStore((state) => state.isUserSetupComplete)
  const { data: subscriptionData, isPending } = useGetSubscriptionDetails()

  if (isPending || !isUserSetupComplete) {
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
