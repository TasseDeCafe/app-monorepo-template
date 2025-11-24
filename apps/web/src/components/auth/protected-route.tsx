import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectIsBackendUserInfoLoading,
  selectIsSignedIn,
  selectIsSupabaseSignInStateLoading,
} from '../../state/slices/account-slice.ts'
import { ROUTE_PATHS } from '../../routing/route-paths.ts'
import { FullViewSquaresLoader } from '../loader/full-view-squares-loader.tsx'

export const ProtectedRoute = () => {
  const location = useLocation()
  const isSignedIn = useSelector(selectIsSignedIn)
  const isSupabaseSignInStateLoading = useSelector(selectIsSupabaseSignInStateLoading)
  const isBackendUserInfoLoading = useSelector(selectIsBackendUserInfoLoading)

  if (isSupabaseSignInStateLoading) {
    return <FullViewSquaresLoader />
  } else if (!isSignedIn) {
    return <Navigate to={ROUTE_PATHS.SIGN_IN} state={{ from: location }} replace />
  } else if (isBackendUserInfoLoading) {
    return <FullViewSquaresLoader />
  }

  return <Outlet />
}
