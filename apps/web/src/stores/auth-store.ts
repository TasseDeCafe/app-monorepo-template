import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client'
import { queryClient } from '@/config/react-query-config'
import { clearSentryUser } from '@/analytics/sentry/sentry-initializer'
import posthog from 'posthog-js'

type AuthStore = {
  session: Session | null
  isLoading: boolean
  isSigningOut: boolean
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isLoading: true,
  isSigningOut: false,

  setSession: (session) => {
    set({ session, isLoading: false })
  },

  setLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    set({ isLoading: true, isSigningOut: true })
    clearSentryUser()

    try {
      // supabase signs you out of all devices by default
      // so we use scope: 'local' to only sign out of the current device
      await getSupabaseClient().auth.signOut({ scope: 'local' })
    } catch {
      // Continue with local cleanup even if Supabase fails
    }

    set({ session: null, isLoading: false, isSigningOut: false })
    queryClient.clear()
    posthog.reset()
    window.localStorage.clear()
  },
}))

export const getIsSignedIn = (state: AuthStore) => !!state.session?.access_token
export const getUserEmail = (state: AuthStore) => state.session?.user?.user_metadata?.email ?? ''
export const getUserName = (state: AuthStore) => state.session?.user?.user_metadata?.name ?? ''
export const getFullName = (state: AuthStore) => state.session?.user?.user_metadata?.full_name ?? ''
export const getUserId = (state: AuthStore) => state.session?.user?.id ?? ''
export const getAccessToken = (state: AuthStore) => state.session?.access_token ?? ''
