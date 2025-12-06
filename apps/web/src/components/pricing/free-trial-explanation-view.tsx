import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { buildPricingFreeTrialPath, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useSearch } from '@tanstack/react-router'
import {
  NUMBER_OF_DAYS_IN_FREE_TRIAL,
  PlanInterval,
  REFUND_PERIOD_IN_DAYS,
} from '@template-app/core/constants/pricing-constants.ts'
import { useCheckoutMutation } from '@/hooks/api/checkout/checkout-hooks'
import { useLingui } from '@lingui/react/macro'
import { Button } from '../shadcn/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card.tsx'

const TimelineItem = ({ day, description }: { day: string; description: string }) => {
  return (
    <div className='relative flex items-start gap-3 pl-6'>
      <div className='absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary'></div>
      <div className='flex-1'>
        <p className='font-semibold'>{day}</p>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}

export const FreeTrialExplanationView = () => {
  const { t } = useLingui()

  const { mutate, isPending: isPendingCheckoutMutation } = useCheckoutMutation()
  const { planInterval } = useSearch({ from: '/_protected/pricing/free-trial' })

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])
  const handleClick = () => {
    POSTHOG_EVENTS.click('subscribe_button')

    const interval: PlanInterval = planInterval === 'month' ? 'month' : 'year'
    mutate({
      successPathAndHash: ROUTE_PATHS.CHECKOUT_SUCCESS,
      cancelPathAndHash: buildPricingFreeTrialPath(interval),
      planInterval: interval,
    })
  }

  const REFUND_PERIOD_PLUS_FREE_TRIAL_DAYS = REFUND_PERIOD_IN_DAYS + NUMBER_OF_DAYS_IN_FREE_TRIAL

  return (
    <div className='mx-auto flex w-full max-w-md flex-col items-center gap-4 p-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-center'>{t`How your free trial works`}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <div className='relative'>
            <div className='absolute bottom-3 left-[4px] top-3 w-0.5 bg-border'></div>
            <div className='flex flex-col gap-6'>
              <TimelineItem day={t`Today`} description={t`Introduce your card details and get instant access`} />
              <TimelineItem
                day={t`${NUMBER_OF_DAYS_IN_FREE_TRIAL} days`}
                description={t`Last day to cancel before first charge`}
              />
              <TimelineItem
                day={t`${REFUND_PERIOD_PLUS_FREE_TRIAL_DAYS} days`}
                description={t`Even if you get charged you can request an unconditional refund. Just let us know by clicking the "Contact Us" button above.`}
              />
            </div>
          </div>

          <Button onClick={handleClick} disabled={isPendingCheckoutMutation}>
            {isPendingCheckoutMutation ? t`Loading...` : t`START ${NUMBER_OF_DAYS_IN_FREE_TRIAL}-DAY FREE TRIAL`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
