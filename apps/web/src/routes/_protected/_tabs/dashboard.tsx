import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLingui } from '@lingui/react/macro'
import { Button } from '@/components/shadcn/button'
import { useNeedsSubscription } from '@/hooks/use-needs-subscription'
import { useModalStore } from '@/stores/modal-store'
import { PRICING_MODAL_ID } from '@/components/modal/modal-ids'
import { Route as premiumDemoRoute } from '@/routes/_protected/premium-demo'

const DashboardView = () => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { needsSubscription, isPending } = useNeedsSubscription()
  const openModal = useModalStore((state) => state.openModal)

  const isSubscribed = !needsSubscription && !isPending

  const handlePremiumPress = () => {
    if (isSubscribed) {
      navigate({ to: premiumDemoRoute.to })
    } else {
      openModal(PRICING_MODAL_ID)
    }
  }

  const getHeading = () => {
    if (isPending) return t`Premium`
    return isSubscribed ? t`Premium Features` : t`Unlock Premium`
  }

  const getDescription = () => {
    if (isPending) return t`Loading subscription status...`
    return isSubscribed
      ? t`Access exclusive premium features available to subscribers.`
      : t`Subscribe to unlock premium features and get the most out of the app.`
  }

  const getButtonText = () => {
    if (isPending) return t`Loading...`
    return isSubscribed ? t`View Premium Demo` : t`Subscribe Now`
  }

  return (
    <div className='flex flex-col gap-4 px-4 py-2'>
      <h1 className='text-xl font-bold'>{t`Dashboard`}</h1>

      <div className='rounded-lg p-4'>
        <h2 className='mb-2 text-lg font-semibold'>{getHeading()}</h2>
        <p className='mb-4 text-gray-600'>{getDescription()}</p>
        <Button onClick={handlePremiumPress} disabled={isPending}>
          {getButtonText()}
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_protected/_tabs/dashboard')({
  component: DashboardView,
})
