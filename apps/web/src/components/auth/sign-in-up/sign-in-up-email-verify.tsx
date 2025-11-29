import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client.ts'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useNavigate } from 'react-router-dom'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { Button } from '../../design-system/button.tsx'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../../design-system/card.tsx'
import { TitleWithGradient } from '../../design-system/typography/title-with-gradient.tsx'
import { useLingui } from '@lingui/react/macro'

// the user lands here after clicking on the sign in/up magic link in the email.
// The email template is defined:
// dev:        backend/supabase/supabase-dev/supabase/templates/magic-link-verification.html
// dev-tunnel: backend/supabase/supabase-dev/supabase/templates/magic-link-verification.html
// prod:       https://supabase.com/dashboard/project/krtllimmygzciwxngbmd/auth/templates
export const SignInUpEmailVerify = () => {
  const { t } = useLingui()

  const [isError, setIsError] = useState(false)
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search)
  const hash = searchParams.get('token_hash')

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { mutate: verifyOtp, isPending } = useMutation({
    mutationFn: async () => {
      // as described in https://supabase.com/docs/guides/auth/auth-email-passwordless#signing-in-with-magic-link
      // in PKCE flow section. Note that the user can use the magic link only once (security), but he can use any device,
      // not necessarily the one he used for requesting the magic link
      //
      // the comments below might not be 100% accurate, but it should help when looking for errors
      // we need to use Supabase PKCE flow because it's more secure than the implicit flow.
      // even if the user intercepts the magic link sent by supabase,
      // after it is verified below (there's a call in the background to the supabase api) the
      // link is no longer valid, and the attacker can't hijack the user's session
      // Supabase PKCE differs from regular PKCE (often used for mobile native apps). In the normal PKCE a secret pair is generated
      // on the client side
      if (!hash) {
        POSTHOG_EVENTS.noTokenHashProvided()
        throw new Error('No token hash provided')
      }
      const { error } = await getSupabaseClient().auth.verifyOtp({ token_hash: hash, type: 'magiclink' })
      if (error) {
        POSTHOG_EVENTS.magicLinkFailureOrExpiration()
        throw new Error('token verification failed')
      }
    },
    onSuccess: () => {
      navigate(ROUTE_PATHS.DASHBOARD, { replace: true })
    },
    onError: () => {
      setIsError(true)
    },
  })

  const handleVerifyEmailClick = () => {
    POSTHOG_EVENTS.click('verify_email_button')
    verifyOtp()
  }

  const handleReturnToSignIn = () => {
    POSTHOG_EVENTS.click('return_to_sign_in_button')
    navigate(ROUTE_PATHS.SIGN_IN, { replace: true })
  }

  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center px-2'>
      <Card className='gap-y-8'>
        {isError ? (
          <>
            <div className='text-center'>
              <TitleWithGradient>{t`Email link is invalid or has expired`}</TitleWithGradient>
            </div>
            <Button
              onClick={handleReturnToSignIn}
              className='flex h-12 w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-indigo-500'
            >
              {t`Return to Sign In`}
            </Button>
          </>
        ) : (
          <>
            <div className='text-center'>
              <TitleWithGradient>{t`Verify Your Email`}</TitleWithGradient>
            </div>
            <Button
              onClick={handleVerifyEmailClick}
              disabled={isPending}
              className='flex h-12 w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-indigo-500 disabled:bg-indigo-400'
            >
              {isPending ? t`Verifying...` : t`Verify`}
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
