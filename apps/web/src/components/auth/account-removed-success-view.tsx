import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useEffect } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useAuthStore, getIsSignedIn } from '@/stores/auth-store'
import { Button } from '../shadcn/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card.tsx'

export const AccountRemovedSuccessView = () => {
  const navigate = useNavigate()
  const isSignedIn = useAuthStore(getIsSignedIn)
  const { t } = useLingui()

  useEffect(() => {
    if (isSignedIn) {
      navigate(ROUTE_PATHS.DASHBOARD)
    }
  }, [isSignedIn, navigate])

  const handleTakeToSignIn = () => {
    navigate(ROUTE_PATHS.LOGIN, { replace: true })
  }

  return (
    <div className='mx-auto flex w-full max-w-md flex-col items-center gap-4 p-4'>
      <Card className='w-full text-center'>
        <CardHeader>
          <CardTitle>{t`Account Removed`}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p className='text-muted-foreground'>{t`We're sorry to see you go. Your account has been successfully removed.`}</p>
          <p className='text-sm text-muted-foreground'>{t`If you'd like to create a new account, sign up again below.`}</p>
          <Button onClick={handleTakeToSignIn} className='w-full'>
            {t`Sign up`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
