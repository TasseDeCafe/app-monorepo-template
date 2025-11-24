import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routing/route-paths'
import { Button } from '../design-system/button'
import { Card } from '../design-system/card'
import { TitleWithGradient } from '../design-system/typography/title-with-gradient'
import { POSTHOG_EVENTS } from '../../analytics/posthog/posthog-events.ts'
import { useEffect } from 'react'
import { useLingui } from '@lingui/react/macro'

export const CheckoutSuccessView = () => {
  const navigate = useNavigate()
  const { t } = useLingui()

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center px-2'>
      <Card className='gap-y-8'>
        <div className='text-center'>
          <TitleWithGradient>{t`Subscription Successful!`}</TitleWithGradient>
        </div>
        <div className='flex flex-col items-center justify-center space-y-6'>
          <div className='animate-bounce-slow'>
            <CheckCircle className='h-20 w-20 text-indigo-500' />
          </div>
          <h2 className='text-center text-2xl font-bold text-gray-800'>{t`You are now subscribed to Premium!`}</h2>
          <p className='text-center text-gray-600'>{t`Enjoy unlimited access to all our premium features and content.`}</p>
          <Button
            className='w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
          >
            {t`Start Practicing`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
