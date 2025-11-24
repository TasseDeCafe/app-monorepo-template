import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsBackendUserInfoLoaded, selectMissingCloningStep } from '@/state/slices/account-slice.ts'
import { FullViewSquaresLoader } from '../loader/full-view-squares-loader.tsx'

// this component is needed to prevent people from going back to cloning steps if they have already completed them
// for example a user won't be able to paste a cloned voice link into the search bar
export const AllowIfNotClonedVoice = () => {
  const missingCloningStep: string | null = useSelector(selectMissingCloningStep)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)

  if (!isBackendUserInfoLoaded) {
    return <FullViewSquaresLoader />
  } else if (missingCloningStep) {
    return <Outlet />
  }
  return <FullViewSquaresLoader />
}
