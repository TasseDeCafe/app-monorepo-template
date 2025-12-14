import { useRef } from 'react'
import { createFileRoute, Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { FullViewLoader } from '@/components/ui/full-view-loader.tsx'
import { useAuthStore, getIsSignedIn } from '@/stores/auth-store'
import { useIsUserSetupComplete } from '@/features/user/api/user-hooks'

const AuthenticatedLayout = () => {
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

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})
