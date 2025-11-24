import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { RefreshButton } from '../refresh-button.tsx'
import { useEffect, useState } from 'react'
import { useLingui } from '@lingui/react/macro'

const COUNTDOWN_TIME = 15 // seconds

export const RateLimitingModalContent = () => {
  const { t } = useLingui()

  const [countdown, setCountdown] = useState(COUNTDOWN_TIME)
  const [isRetryEnabled, setIsRetryEnabled] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsRetryEnabled(true)
    }
  }, [countdown])

  return (
    <>
      <DialogContent className='w-11/12 rounded-xl bg-white p-8 sm:max-w-md'>
        <DialogHeader className='mb-5'>
          <DialogTitle>{t`Too Many Requests`}</DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <p className='text-sm text-gray-500'>{t`Too many requests. Please use the app in only one tab and device at a time and try again later.`}</p>
          <div className='flex h-6 items-center justify-center'>
            {!isRetryEnabled && <p className='text-sm text-gray-500'>{t`You can try again in ${countdown} seconds`}</p>}
          </div>
        </div>
        <DialogFooter>
          <RefreshButton disabled={!isRetryEnabled} />
        </DialogFooter>
      </DialogContent>
    </>
  )
}
