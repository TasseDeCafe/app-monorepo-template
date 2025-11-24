import { useEffect } from 'react'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client.ts'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useDispatch } from 'react-redux'
import { accountActions, SetUserDetailsPayload } from '@/state/slices/account-slice.ts'

export const SilentSignInOut = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const startListeningToAuthEvents = () => {
      // taken from https://supabase.com/docs/reference/javascript/auth-onauthstatechange?example=listen-to-auth-changes
      getSupabaseClient().auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          const userMetadata = session?.user?.user_metadata
          const user = session?.user
          const accessToken = session?.access_token
          if (user && userMetadata && accessToken) {
            const payload: SetUserDetailsPayload = {
              id: user.id,
              accessToken: session?.access_token,
              email: userMetadata.email,
              name: userMetadata.name,
              fullName: userMetadata.full_name,
              imageUrl: userMetadata.avatar_url,
            }
            dispatch(accountActions.setSupabaseAuthUserDetails(payload))
          } else {
            dispatch(accountActions.setIsSupabaseSignInStateLoaded(true))
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch(accountActions.clearUserDetails())
        }
      })
    }
    startListeningToAuthEvents()
    return () => {
      getSupabaseClient().auth.onAuthStateChange(() => {})
    }
  }, [dispatch])

  return <></>
}
