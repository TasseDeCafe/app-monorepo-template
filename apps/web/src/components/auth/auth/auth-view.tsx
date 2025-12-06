import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client.ts'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { AuthError } from '@supabase/supabase-js'
import { toast } from 'sonner'
import googleSvg from '../../../images/svg/google.svg'
import appleSvg from '../../../images/svg/apple.svg'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { Button } from '../../shadcn/button.tsx'
import { Mail } from 'lucide-react'
import { shouldShowSignInWithGoogle } from './auth-utils.ts'
import { useLingui } from '@lingui/react/macro'
import { useAuthStore, getIsSignedIn } from '@/stores/auth-store'

export const AuthView = () => {
  const { t } = useLingui()

  const { redirect } = useSearch({ from: '/login/' })
  const navigate = useNavigate()
  const redirectTo = redirect || ROUTE_PATHS.DASHBOARD
  const isSignedIn = useAuthStore(getIsSignedIn)

  useEffect(() => {
    if (isSignedIn) {
      navigate({ to: redirectTo })
    }
  }, [navigate, isSignedIn, redirectTo])

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const continueWithGoogle = async () => {
    const { error }: { error: AuthError | null } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
        },
        redirectTo: window.location.origin + redirectTo,
      },
    })
    if (error) {
      toast.error(t`Authentication failed`)
    }
  }

  const continueWithApple = async () => {
    const { error }: { error: AuthError | null } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin + redirectTo,
      },
    })
    if (error) {
      toast.error(t`Authentication failed`)
    }
  }

  const handleContinueWithGoogleClick = () => {
    POSTHOG_EVENTS.click('continue_with_google_button')
    continueWithGoogle().then()
  }

  const handleContinueWithAppleClick = () => {
    POSTHOG_EVENTS.click('continue_with_apple_button')
    continueWithApple().then()
  }

  const handleContinueWithEmailClick = () => {
    POSTHOG_EVENTS.click('continue_with_email_button')
    navigate({ to: ROUTE_PATHS.LOGIN_EMAIL })
  }

  if (!isSignedIn) {
    return (
      <div className='flex w-full flex-1 items-center justify-center'>
        <div className='flex w-full max-w-md flex-col gap-y-4 p-4'>
          <Button variant='outline' onClick={handleContinueWithEmailClick}>
            <Mail height={20} width={20} />
            <span>{t`Continue with Email`}</span>
          </Button>
          {shouldShowSignInWithGoogle() && (
            <Button onClick={handleContinueWithGoogleClick}>
              <img src={googleSvg} alt='google' height={20} width={20} />
              <span>{t`Continue with Google`}</span>
            </Button>
          )}
          <Button variant='secondary' onClick={handleContinueWithAppleClick}>
            <img src={appleSvg} alt='apple' height={18} width={18} />
            <span>{t`Continue with Apple`}</span>
          </Button>
        </div>
      </div>
    )
  }
}
