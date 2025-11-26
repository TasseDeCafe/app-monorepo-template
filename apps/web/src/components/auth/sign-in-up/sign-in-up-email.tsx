import { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { Button } from '../../design-system/button.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { Card } from '../../design-system/card.tsx'
import { TitleWithGradient } from '../../design-system/typography/title-with-gradient.tsx'
import { selectParamsThatHadOriginallyCameFromLanding } from '@/state/slices/account-slice.ts'
import { useSelector } from 'react-redux'
import { useSendVerificationEmail } from '@/hooks/api/authentication/authentication-hooks'
import { NavbarContactButton } from '../../navbar/navbar-contact-button'
import { useLingui } from '@lingui/react/macro'

export const SignInUpEmail = ({ isSignIn = true }: { isSignIn?: boolean }) => {
  const { t } = useLingui()

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const paramsThatHadOriginallyCameFromLanding = useSelector(selectParamsThatHadOriginallyCameFromLanding)

  const currentOperation = isSignIn ? t`Sign in` : t`Sign up`

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { mutate: sendVerificationEmail, isPending } = useSendVerificationEmail({
    onSuccess: () => {
      navigate(ROUTE_PATHS.SIGN_IN_EMAIL_VERIFICATION_SENT, { state: { email } })
    },
  })

  const handleSignInUp = async () => {
    if (!paramsThatHadOriginallyCameFromLanding) {
      return
    } else {
      if (!validateEmail(email)) {
        setEmailError(t`Please enter a valid email address`)
        return
      }

      POSTHOG_EVENTS.click('sign_in_up_with_email_button')
      sendVerificationEmail({
        email,
        referral: paramsThatHadOriginallyCameFromLanding.referral,
        platform: 'web',
        utmSource: paramsThatHadOriginallyCameFromLanding.utmSource,
        utmMedium: paramsThatHadOriginallyCameFromLanding.utmMedium,
        utmCampaign: paramsThatHadOriginallyCameFromLanding.utmCampaign,
        utmTerm: paramsThatHadOriginallyCameFromLanding.utmTerm,
        utmContent: paramsThatHadOriginallyCameFromLanding.utmContent,
      })
    }
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setEmailError('')
  }

  return (
    <div className='flex w-full flex-1'>
      <div className='absolute right-4 top-4'>
        <NavbarContactButton />
      </div>
      <div className='flex w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-2 md:px-8 lg:w-1/2'>
        <Card className='w-full max-w-md gap-y-8'>
          <div className='text-center'>
            <TitleWithGradient>{isSignIn ? t`Sign in with Email` : t`Sign up with Email`}</TitleWithGradient>
          </div>

          <div className='flex flex-col gap-y-4'>
            <div className='w-full space-y-1'>
              <input
                type='email'
                id='email'
                name='email'
                autoComplete='username email'
                placeholder={t`Email address`}
                value={email}
                onChange={handleEmailChange}
                className='h-12 w-full rounded-xl border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              />
              {emailError && <p className='h-4 text-xs text-red-500'>{t`Please enter a valid email address`}</p>}
            </div>
            <Button
              disabled={isPending}
              onClick={handleSignInUp}
              className='flex h-12 w-full items-center justify-center gap-x-4 bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm'
            >
              <span className='font-medium'>{isPending ? t`Sending an email` : currentOperation}</span>
            </Button>
          </div>
          <div>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center'>
                <span className='bg-white px-2 text-gray-500'>{t`Or`}</span>
              </div>
            </div>

            <div className='mt-6 text-center text-gray-500'>
              {isSignIn ? t`Don't have an account?` : t`Have an account?`}{' '}
              <a
                className='cursor-pointer font-medium text-indigo-600 hover:text-indigo-500'
                onClick={() => {
                  navigate(isSignIn ? ROUTE_PATHS.SIGN_UP_EMAIL : ROUTE_PATHS.SIGN_IN_EMAIL)
                }}
              >
                {isSignIn ? t`Sign up` : t`Sign in`}
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
