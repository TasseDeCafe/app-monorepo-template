import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { FullViewLoader } from '@/components/loader/full-view-loader.tsx'
import { getConfig } from '@/config/environment-config.ts'
import { shouldShowPaywall } from '@/components/payment/require-credit-card-route.utils.ts'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'
import { useTrackingStore, getHasAllowedReferral } from '@/stores/tracking-store'
import { useIsUserSetupComplete } from '@/hooks/api/user/user-hooks'

const PremiumLayout = () => {
  const hasAllowedReferral = useTrackingStore(getHasAllowedReferral)
  const isUserSetupComplete = useIsUserSetupComplete()
  const { data: subscriptionData, isPending } = useGetSubscriptionDetails()

  if (isPending || !isUserSetupComplete) {
    return <FullViewLoader />
  }

  if (
    shouldShowPaywall(
      hasAllowedReferral,
      getConfig().featureFlags.isCreditCardRequiredForAll(),
      getConfig().featureFlags.shouldAppBeFreeForEveryone(),
      !!subscriptionData?.isPremiumUser
    )
  ) {
    return <Navigate to='/pricing' />
  }

  return <Outlet />
}

export const Route = createFileRoute('/_protected/_premium')({
  component: PremiumLayout,
})
