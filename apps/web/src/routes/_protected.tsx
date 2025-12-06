import { useRef } from 'react'
import { createFileRoute, Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { FullViewLoader } from '@/components/loader/full-view-loader.tsx'
import { useAuthStore, getIsSignedIn } from '@/stores/auth-store'
import { useIsUserSetupComplete } from '@/hooks/api/user/user-hooks'

const ProtectedLayout = () => {
  const isSignedIn = useAuthStore(getIsSignedIn)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isUserSetupComplete = useIsUserSetupComplete()
  const location = useLocation()

  // Capture the original pathname on first render, before any redirect happens
  const originalPathRef = useRef(location.pathname)

  if (isLoading) {
    return <FullViewLoader />
  }

  if (!isSignedIn) {
    return <Navigate to='/login' search={{ redirect: originalPathRef.current }} />
  }

  if (!isUserSetupComplete) {
    return <FullViewLoader />
  }

  return <Outlet />
}

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})
