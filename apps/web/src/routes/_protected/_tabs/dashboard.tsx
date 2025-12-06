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
  const { needsSubscription, isFetching } = useNeedsSubscription()
  const openModal = useModalStore((state) => state.openModal)

  const isSubscribed = !needsSubscription && !isFetching

  const handlePremiumPress = () => {
    if (isSubscribed) {
      navigate({ to: premiumDemoRoute.to })
    } else {
      openModal(PRICING_MODAL_ID)
    }
  }

  return (
    <div className='flex flex-col gap-4 px-4 py-2'>
      <h1 className='text-xl font-bold'>{t`Dashboard`}</h1>

      <div className='rounded-lg bg-indigo-100 p-4'>
        <h2 className='mb-2 text-lg font-semibold text-indigo-700'>
          {isSubscribed ? t`Premium Features` : t`Unlock Premium`}
        </h2>
        <p className='mb-4 text-gray-600'>
          {isSubscribed
            ? t`Access exclusive premium features available to subscribers.`
            : t`Subscribe to unlock premium features and get the most out of the app.`}
        </p>
        <Button onClick={handlePremiumPress}>{isSubscribed ? t`View Premium Demo` : t`Subscribe Now`}</Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_protected/_tabs/dashboard')({
  component: DashboardView,
})
