import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectIsBackendUserInfoLoading,
  selectIsSignedIn,
  selectIsSupabaseSignInStateLoading,
} from '@/state/slices/account-slice'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { FullViewLoader } from '../loader/full-view-loader.tsx'

export const ProtectedRoute = () => {
  const location = useLocation()
  const isSignedIn = useSelector(selectIsSignedIn)
  const isSupabaseSignInStateLoading = useSelector(selectIsSupabaseSignInStateLoading)
  const isBackendUserInfoLoading = useSelector(selectIsBackendUserInfoLoading)

  if (isSupabaseSignInStateLoading) {
    return <FullViewLoader />
  } else if (!isSignedIn) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />
  } else if (isBackendUserInfoLoading) {
    return <FullViewLoader />
  }

  return <Outlet />
}
