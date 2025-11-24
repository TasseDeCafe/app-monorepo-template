import { useAuthStore } from '@/stores/auth-store'
import { SUPPORTED_STRIPE_CURRENCY } from '@template-app/core/constants/pricing-constants'
import { POLISH_LOCALE } from '@template-app/i18n/i18n-config'
import { useLocaleStore } from '@/stores/locale-store'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'

export const useNeedsSubscription = () => {
  const session = useAuthStore((state) => state.session)
  const locale = useLocaleStore((state) => state.locale)

  const currency = locale === POLISH_LOCALE ? SUPPORTED_STRIPE_CURRENCY.PLN : SUPPORTED_STRIPE_CURRENCY.EUR

  const isSubscriptionQueryEnabled = !!session

  const {
    data: subscriptionDetailsData,
    isPending: isSubscriptionDetailsPending,
    isFetching: isSubscriptionDetailsFetching,
    isError: isSubscriptionDetailsError,
  } = useGetSubscriptionDetails(currency, {
    enabled: isSubscriptionQueryEnabled,
  })

  const isFetching = isSubscriptionDetailsPending || isSubscriptionDetailsFetching

  const needsSubscription =
    !subscriptionDetailsData?.isPremiumUser && !subscriptionDetailsData?.isSpecialUserWithFullAccess

  return {
    needsSubscription,
    isFetching,
    isError: isSubscriptionDetailsError,
    subscriptionData: subscriptionDetailsData,
  }
}
