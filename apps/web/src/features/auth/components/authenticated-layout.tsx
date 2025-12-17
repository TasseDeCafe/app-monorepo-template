import { Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { getIsSignedIn, useAuthStore } from '@/stores/auth-store'
import { useIsUserSetupComplete } from '@/features/user/api/user-hooks'
import { useRef } from 'react'
import { FullViewLoader } from '@/components/ui/full-view-loader'

export const AuthenticatedLayout = () => {
  const isSignedIn = useAuthStore(getIsSignedIn)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isSigningOut = useAuthStore((state) => state.isSigningOut)
  const isUserSetupComplete = useIsUserSetupComplete()
  const location = useLocation()

  // Capture the original pathname on first render, before any redirect happens
  const originalPathRef = useRef(location.pathname)

  if (isLoading) {
    return <FullViewLoader />
  }

  if (!isSignedIn) {
    // Don't add redirect param if user is intentionally signing out
    if (isSigningOut) {
      return <Navigate to='/login' />
    }
    return <Navigate to='/login' search={{ redirect: originalPathRef.current }} />
  }

  if (!isUserSetupComplete) {
    return <FullViewLoader />
  }

  return <Outlet />
}
