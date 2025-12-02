import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useLingui } from '@lingui/react/macro'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { Button } from '@/components/shadcn/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn/card'

export const CheckoutSuccessView = () => {
  const navigate = useNavigate()
  const { t } = useLingui()

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  return (
    <div className='flex w-full flex-1 items-center justify-center p-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto mb-4'>
            <CheckCircle className='h-16 w-16 text-green-500' />
          </div>
          <CardTitle className='text-2xl'>{t`Subscription Successful!`}</CardTitle>
          <CardDescription>{t`You are now subscribed to Premium!`}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>{t`Enjoy unlimited access to all our premium features and content.`}</p>
        </CardContent>
        <CardFooter>
          <Button className='w-full' onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
            {t`Go to Dashboard`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
