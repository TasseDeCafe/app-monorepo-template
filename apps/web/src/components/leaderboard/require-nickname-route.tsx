import { Navigate, Outlet } from 'react-router-dom'
import { FullViewSquaresLoader } from '../loader/full-view-squares-loader.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useUserNickname } from '@/hooks/api/user/user-hooks'

export const RequireNicknameRoute = () => {
  const { data: nickname, isLoading, isFetching, isError } = useUserNickname()

  if (isLoading || (isFetching && typeof nickname === 'undefined')) {
    return <FullViewSquaresLoader />
  }

  if (isError) {
    return <Navigate to={ROUTE_PATHS.CHOOSE_NICKNAME} replace />
  }

  if (!nickname) {
    return <Navigate to={ROUTE_PATHS.CHOOSE_NICKNAME} replace />
  }

  return <Outlet />
}
