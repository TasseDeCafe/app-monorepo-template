import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '../../../analytics/posthog/posthog-events.ts'
import { Card } from '../../design-system/card.tsx'
import { TitleWithGradient } from '../../design-system/typography/title-with-gradient.tsx'
import { Testimonial } from './testimonial'
import benGelb from '../../../assets/images/ben-gelb.jpg'
import { NavbarContactButton } from '../../navbar/navbar-contact-button'
import { useLingui } from '@lingui/react/macro'

export const SignInUpEmailVerificationSentView = ({ isSignIn }: { isSignIn: boolean }) => {
  const { t } = useLingui()

  const location = useLocation()
  const email = location.state?.email || t`your email address`

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  return (
    <div className='flex w-full flex-1'>
      <div className='absolute right-4 top-4'>
        <NavbarContactButton />
      </div>
      <div className='flex w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-8 lg:w-1/2'>
        <Card className='w-full max-w-md gap-y-8'>
          <div className='flex flex-col items-center gap-y-4'>
            <div className='text-center'>
              <TitleWithGradient>{t`Email Verification Sent`}</TitleWithGradient>
            </div>
            <div className='space-y-2 text-center'>
              <p className='text-gray-700'>{t`We've sent a verification email to:`}</p>
              <p className='font-medium text-gray-900'>{email}</p>
            </div>
            <div className='space-y-2 text-center'>
              <p className='text-gray-700'>
                {isSignIn
                  ? t`Please check your inbox and click the verification link to sign in.`
                  : t`Please check your inbox and click the verification link to complete your sign up.`}
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className='hidden h-full lg:block lg:w-1/2'>
        <Testimonial
          quote={t`This app completely transformed how I learn languages. In a few days, I understood how to nail my southern Spanish accent. I'm not a gringo anymore when I travel to my beloved Sevilla!`}
          author='Ben Gelb'
          role={t`Product Manager at Sage`}
          image={benGelb}
        />
      </div>
    </div>
  )
}
