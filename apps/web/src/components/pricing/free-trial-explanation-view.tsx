import { Button } from '../design-system/button.tsx'
import { Card } from '../design-system/card.tsx'
import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { buildPricingFreeTrialPath, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useSearchParams } from 'react-router-dom'
import {
  NUMBER_OF_DAYS_IN_FREE_TRIAL,
  PlanInterval,
  REFUND_PERIOD_IN_DAYS,
} from '@template-app/core/constants/pricing-constants.ts'
import { useCheckoutMutation } from '@/hooks/api/checkout/checkout-hooks'
import { useLingui } from '@lingui/react/macro'

const TimelineItem = ({ day, description }: { day: string; description: string }) => {
  return (
    <div className='relative flex h-16 items-start gap-3 pl-8'>
      <div className='absolute left-0 top-[6px] flex h-3 w-3 items-center justify-center rounded-full bg-indigo-600'></div>
      <div className='flex-1'>
        <p className='text-lg font-semibold text-indigo-700'>{day}</p>
        <p className='mt-1 text-sm text-gray-600'>{description}</p>
      </div>
    </div>
  )
}

export const FreeTrialExplanationView = () => {
  const { t } = useLingui()

  const { mutate, isPending: isPendingCheckoutMutation } = useCheckoutMutation()
  const [searchParams] = useSearchParams()
  const planInterval: string | null = searchParams.get('planInterval')

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
    <div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-y-4 px-1 py-2 md:gap-y-8 md:px-4 md:py-8'>
      <Card className='max-w-2xl p-4 shadow'>
        <div className='py-4 md:py-8'>
          <h2 className='w-full text-center text-xl font-bold text-stone-800 md:text-3xl'>
            {t`How your free trial works`}
          </h2>
        </div>

        <div className='flex flex-col gap-y-12 px-0 pb-6 md:px-6'>
          <div className='relative space-y-2'>
            <div className='absolute left-[5px] top-4 h-48 w-0.5 bg-indigo-100'></div>
            <div className='flex flex-col gap-8'>
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

          <div className='mt-6 space-y-4'>
            <Button className='h-12 w-full bg-green-500 text-lg text-white' onClick={handleClick}>
              {isPendingCheckoutMutation ? t`Loading...` : t`START ${NUMBER_OF_DAYS_IN_FREE_TRIAL}-DAY FREE TRIAL`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
