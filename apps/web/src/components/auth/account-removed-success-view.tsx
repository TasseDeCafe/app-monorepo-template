import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useEffect } from 'react'
import { selectIsSignedIn } from '@/state/slices/account-slice.ts'
import { useSelector } from 'react-redux'
import { useLingui } from '@lingui/react/macro'

export const AccountRemovedSuccessView = () => {
  const navigate = useNavigate()
  const isSignedIn: boolean = useSelector(selectIsSignedIn)
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
    <div className='mb-40 flex h-full w-full flex-col items-center justify-center space-y-4 px-4 py-12 text-center sm:px-6 md:max-w-sm'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold text-gray-800'>{t`Account Removed`}</h1>
      </div>
      <p className='text-gray-600'>{t`We're sorry to see you go. Your account has been successfully removed.`}</p>
      <div className='w-full space-y-4'>
        <p className='mt-4 text-sm text-gray-500'>{t`If you'd like to create a new account, sign up again below.`}</p>
        <button
          className='w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
          onClick={handleTakeToSignIn}
        >
          {t`Sign up`}
        </button>
      </div>
    </div>
  )
}
