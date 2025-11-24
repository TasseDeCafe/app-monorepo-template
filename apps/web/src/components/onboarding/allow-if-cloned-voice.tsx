import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsBackendUserInfoLoaded, selectMissingCloningStep } from '@/state/slices/account-slice.ts'
import { FullViewSquaresLoader } from '../loader/full-view-squares-loader.tsx'

export const AllowIfClonedVoice = () => {
  const missingOnboardingStep: string | null = useSelector(selectMissingCloningStep)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)

  if (!isBackendUserInfoLoaded) {
    return <FullViewSquaresLoader />
  } else if (missingOnboardingStep) {
    return <Navigate to={missingOnboardingStep} replace />
  }
  return <Outlet />
}
