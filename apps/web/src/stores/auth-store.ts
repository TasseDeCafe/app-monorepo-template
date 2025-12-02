import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client'
import { queryClient } from '@/config/react-query-config'
import { clearSentryUser } from '@/analytics/sentry/sentry-initializer'
import posthog from 'posthog-js'

type AuthStore = {
  session: Session | null
  isLoading: boolean
  isUserSetupComplete: boolean
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setUserSetupComplete: (complete: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isLoading: true,
  isUserSetupComplete: false,

  setSession: (session) => {
    // Reset user setup when session changes (new login or logout)
    set({ session, isLoading: false, isUserSetupComplete: !session ? false : undefined })
  },

  setLoading: (isLoading) => set({ isLoading }),

  setUserSetupComplete: (isUserSetupComplete) => set({ isUserSetupComplete }),

  signOut: async () => {
    set({ isLoading: true })
    clearSentryUser()

    try {
      // supabase signs you out of all devices by default
      // so we use scope: 'local' to only sign out of the current device
      await getSupabaseClient().auth.signOut({ scope: 'local' })
    } catch {
      // Continue with local cleanup even if Supabase fails
    }

    set({ session: null, isLoading: false, isUserSetupComplete: false })
    queryClient.clear()
    posthog.reset()
    window.localStorage.clear()
  },
}))

// Selector functions for deriving user details from session
export const getIsSignedIn = (state: AuthStore) => !!state.session?.access_token
export const getUserEmail = (state: AuthStore) => state.session?.user?.user_metadata?.email ?? ''
export const getUserName = (state: AuthStore) => state.session?.user?.user_metadata?.name ?? ''
export const getFullName = (state: AuthStore) => state.session?.user?.user_metadata?.full_name ?? ''
export const getUserId = (state: AuthStore) => state.session?.user?.id ?? ''
export const getAccessToken = (state: AuthStore) => state.session?.access_token ?? ''
export const getImageUrl = (state: AuthStore) => state.session?.user?.user_metadata?.avatar_url ?? ''
