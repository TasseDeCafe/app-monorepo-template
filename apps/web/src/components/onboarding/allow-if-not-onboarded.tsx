import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsBackendUserInfoLoaded, selectMissingOnboardingStep } from '@/state/slices/account-slice.ts'
import { FullViewSquaresLoader } from '../loader/full-view-squares-loader.tsx'

// this component is needed to prevent people from going back to onboarding if they have already completed it
// for example a user won't be able to paste an onboarding link into the search bar
export const AllowIfNotOnboarded = () => {
  const missingOnboardingStep: string | null = useSelector(selectMissingOnboardingStep)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)

  if (!isBackendUserInfoLoaded) {
    return <FullViewSquaresLoader />
  } else if (missingOnboardingStep) {
    return <Outlet />
  }
  return <FullViewSquaresLoader />
}
