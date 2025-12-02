import { useEffect } from 'react'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client.ts'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/auth-store'

export const SilentSignInOut = () => {
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    const startListeningToAuthEvents = () => {
      // taken from https://supabase.com/docs/reference/javascript/auth-onauthstatechange?example=listen-to-auth-changes
      getSupabaseClient().auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          setSession(session)
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
        }
      })
    }
    startListeningToAuthEvents()
    return () => {
      getSupabaseClient().auth.onAuthStateChange(() => {})
    }
  }, [setSession])

  return <></>
}
