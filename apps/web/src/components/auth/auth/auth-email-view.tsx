import { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { Button } from '../../shadcn/button.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useSendVerificationEmail } from '@/hooks/api/authentication/authentication-hooks'
import { useLingui } from '@lingui/react/macro'
import { useTrackingStore } from '@/stores/tracking-store'
import { useShallow } from 'zustand/react/shallow'

export const AuthEmailView = () => {
  const { t } = useLingui()

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const trackingParams = useTrackingStore(
    useShallow((state) => ({
      referral: state.referral,
      utmSource: state.utmSource,
      utmMedium: state.utmMedium,
      utmCampaign: state.utmCampaign,
      utmTerm: state.utmTerm,
      utmContent: state.utmContent,
    }))
  )

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { mutate: sendVerificationEmail, isPending } = useSendVerificationEmail({
    onSuccess: () => {
      navigate({ to: ROUTE_PATHS.LOGIN_EMAIL_SENT, search: { email } })
    },
  })

  const handleContinue = async () => {
    if (!validateEmail(email)) {
      setEmailError(t`Please enter a valid email address`)
      return
    }

    POSTHOG_EVENTS.click('continue_with_email_button')
    sendVerificationEmail({
      email,
      referral: trackingParams.referral,
      platform: 'web',
      utmSource: trackingParams.utmSource,
      utmMedium: trackingParams.utmMedium,
      utmCampaign: trackingParams.utmCampaign,
      utmTerm: trackingParams.utmTerm,
      utmContent: trackingParams.utmContent,
    })
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setEmailError('')
  }

  return (
    <div className='flex w-full flex-1 items-center justify-center'>
      <div className='flex w-full max-w-md flex-col gap-y-4 p-4'>
        <div className='w-full space-y-1'>
          <input
            type='email'
            id='email'
            name='email'
            autoComplete='username email'
            placeholder={t`Email address`}
            value={email}
            onChange={handleEmailChange}
            className='h-10 w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
          />
          {emailError && <p className='text-xs text-red-500'>{t`Please enter a valid email address`}</p>}
        </div>
        <Button disabled={isPending} onClick={handleContinue}>
          {isPending ? t`Sending...` : t`Continue`}
        </Button>
      </div>
    </div>
  )
}
