import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client.ts'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsSignedIn } from '@/state/slices/account-slice.ts'
import { useEffect } from 'react'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { AuthError } from '@supabase/supabase-js'
import { toast } from 'sonner'
import googleSvg from '../../../images/svg/google.svg'
import appleSvg from '../../../images/svg/apple.svg'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { Button } from '../../design-system/button.tsx'
import { Mail } from 'lucide-react'
import { Card } from '../../design-system/card.tsx'
import { TitleWithGradient } from '../../design-system/typography/title-with-gradient.tsx'
import { shouldShowSignInWithGoogle } from './sign-in-up-utils.ts'
import { Testimonial } from './testimonial'
import benGelb from '../../../assets/images/ben-gelb.jpg'
import { NavbarContactButton } from '../../navbar/navbar-contact-button.tsx'
import { useLingui } from '@lingui/react/macro'

export const SignInUp = ({ isSignIn = true }: { isSignIn?: boolean }) => {
  const { t } = useLingui()

  const location = useLocation()
  const navigate = useNavigate()
  const routeFromWhichUserGotToSignInUpPage: string = location.state?.from?.pathname
  const isSignedIn: boolean = useSelector(selectIsSignedIn)

  useEffect(() => {
    if (isSignedIn) {
      navigate(routeFromWhichUserGotToSignInUpPage || ROUTE_PATHS.DASHBOARD)
    }
  }, [navigate, isSignedIn, routeFromWhichUserGotToSignInUpPage])

  const signInWithGoogle = async () => {
    const { error }: { error: AuthError | null } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
        },
        redirectTo: window.location.origin + (routeFromWhichUserGotToSignInUpPage || ROUTE_PATHS.DASHBOARD),
      },
    })
    if (error) {
      toast.error(t`Sign in failed`)
    }
  }

  const signInWithApple = async () => {
    const { error }: { error: AuthError | null } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin + (routeFromWhichUserGotToSignInUpPage || ROUTE_PATHS.DASHBOARD),
      },
    })
    if (error) {
      toast.error(t`Sign in failed`)
    }
  }

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const handleSignInWithGoogleClick = () => {
    POSTHOG_EVENTS.click('sign_in_up_with_google_button')
    signInWithGoogle().then(() => {})
  }

  const handleSignInWithAppleClick = () => {
    POSTHOG_EVENTS.click('sign_in_up_with_apple_button')
    signInWithApple().then(() => {})
  }

  const handleSignInWithEmailClick = () => {
    POSTHOG_EVENTS.click('sign_in_up_with_email_button')
    navigate(ROUTE_PATHS.SIGN_IN_EMAIL)
  }

  if (!isSignedIn) {
    return (
      <div className='flex w-full flex-1'>
        <div className='absolute right-4 top-4'>
          <NavbarContactButton />
        </div>
        <div className='flex w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-2 md:px-8 xl:w-1/2'>
          <Card className='w-full max-w-md gap-y-8'>
            <div className='text-center'>
              <TitleWithGradient>
                {t`Start mastering`}
                <br />
                {t`your pronunciation`}
              </TitleWithGradient>
            </div>

            <div className='flex flex-col gap-y-4'>
              <Button
                onClick={handleSignInWithEmailClick}
                className='flex h-12 w-full items-center justify-center gap-x-4 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50'
              >
                <Mail height={20} width={20} />
                <span>{isSignIn ? t`Sign in with Email` : t`Sign up with Email`}</span>
              </Button>
              {shouldShowSignInWithGoogle() && (
                <Button
                  onClick={handleSignInWithGoogleClick}
                  className='flex h-12 w-full items-center justify-center gap-x-4 bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm'
                >
                  <img src={googleSvg} alt='google' height={20} width={20} />
                  <span>{isSignIn ? t`Sign in with Google` : t`Sign up with Google`}</span>
                </Button>
              )}
              <Button
                onClick={handleSignInWithAppleClick}
                className='flex h-12 w-full items-center justify-center gap-x-4 bg-black px-4 py-2 font-medium text-white shadow-sm'
              >
                <img src={appleSvg} alt='apple' height={18} width={18} />
                <span>{isSignIn ? t`Sign in with Apple` : t`Sign up with Apple`}</span>
              </Button>
            </div>

            <div className='text-center text-gray-500'>
              {isSignIn ? t`Don't have an account?` : t`Have an account?`}{' '}
              <a
                className='cursor-pointer font-medium text-indigo-600 hover:text-indigo-500'
                onClick={() => {
                  navigate(isSignIn ? ROUTE_PATHS.SIGN_UP : ROUTE_PATHS.SIGN_IN)
                }}
              >
                {isSignIn ? t`Sign up` : t`Sign in`}
              </a>
            </div>
          </Card>
        </div>
        <div className='hidden h-full xl:block xl:w-1/2'>
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
}
