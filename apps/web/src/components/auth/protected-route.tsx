import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { FullViewLoader } from '../loader/full-view-loader.tsx'
import { useAuthStore, getIsSignedIn } from '@/stores/auth-store'
import { useIsUserSetupComplete } from '@/hooks/api/user/user-hooks'

export const ProtectedRoute = () => {
  const location = useLocation()
  const isSignedIn = useAuthStore(getIsSignedIn)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isUserSetupComplete = useIsUserSetupComplete()

  if (isLoading) {
    return <FullViewLoader />
  } else if (!isSignedIn) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />
  } else if (!isUserSetupComplete) {
    return <FullViewLoader />
  }

  return <Outlet />
}
