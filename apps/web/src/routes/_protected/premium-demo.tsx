import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useLingui } from '@lingui/react/macro'
import { Button } from '@/components/shadcn/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card'
import { ArrowLeft } from 'lucide-react'
import { useNeedsSubscription } from '@/hooks/use-needs-subscription'
import { useModalStore } from '@/stores/modal-store'
import { PRICING_MODAL_ID } from '@/components/modal/modal-ids'
import { FullViewLoader } from '@/components/loader/full-view-loader'
import { Route as dashboardRoute } from '@/routes/_protected/_tabs/dashboard'

const PremiumDemoView = () => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { needsSubscription, isFetching } = useNeedsSubscription()
  const openModal = useModalStore((state) => state.openModal)

  useEffect(() => {
    if (!isFetching && needsSubscription) {
      openModal(PRICING_MODAL_ID)
      navigate({ to: dashboardRoute.to })
    }
  }, [needsSubscription, isFetching, openModal, navigate])

  if (isFetching) {
    return <FullViewLoader />
  }

  if (needsSubscription) {
    return <FullViewLoader />
  }

  return (
    <div className='flex min-h-screen flex-col bg-indigo-50'>
      {/* Header */}
      <header className='sticky top-0 z-10 flex h-14 items-center border-b border-indigo-100 bg-indigo-50 px-4'>
        <button
          onClick={() => navigate({ to: dashboardRoute.to })}
          className='flex h-10 w-10 items-center justify-center rounded-lg hover:bg-indigo-100'
        >
          <ArrowLeft className='h-6 w-6' />
        </button>
        <h1 className='ml-2 text-lg font-semibold'>{t`Premium Demo`}</h1>
      </header>

      {/* Main content */}
      <main className='flex flex-1 items-center justify-center p-4'>
        <Card className='w-full max-w-md text-center'>
          <CardHeader>
            <CardTitle className='text-2xl text-indigo-600'>{t`Premium Features`}</CardTitle>
            <CardDescription>
              {t`This screen is only accessible to subscribed users. You can showcase premium features here.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant='outline' onClick={() => navigate({ to: dashboardRoute.to })}>
              {t`Go Back`}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/_protected/premium-demo')({
  component: PremiumDemoView,
})
