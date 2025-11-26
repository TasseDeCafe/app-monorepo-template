import { useSelector } from 'react-redux'
import {
  selectAccountAccessToken,
  selectIsBackendUserInfoLoaded,
  selectParamsThatHadOriginallyCameFromLanding,
} from '@/state/slices/account-slice.ts'
import { useEffect } from 'react'
import { useCreateOrUpdateUser } from '@/hooks/api/user/user-hooks'

export const UserRetrieving = () => {
  const accessToken = useSelector(selectAccountAccessToken)
  const paramsThatHadOriginallyCameFromLanding = useSelector(selectParamsThatHadOriginallyCameFromLanding)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)

  const { mutate: getOrCreateUserData } = useCreateOrUpdateUser()

  useEffect(() => {
    if (accessToken && !isBackendUserInfoLoaded && paramsThatHadOriginallyCameFromLanding) {
      // TODO: this mutation fires multiple times when multiple windows are open. This might because of the local storage
      // being shared between windows, or some other reason. See this PR: GRAM-1561/fix/insertuser-duplicate-key-value-violates-unique-constraint-users_pkey
      getOrCreateUserData({
        referral: paramsThatHadOriginallyCameFromLanding.referral,
        utmSource: paramsThatHadOriginallyCameFromLanding.utmSource,
        utmMedium: paramsThatHadOriginallyCameFromLanding.utmMedium,
        utmCampaign: paramsThatHadOriginallyCameFromLanding.utmCampaign,
        utmTerm: paramsThatHadOriginallyCameFromLanding.utmTerm,
        utmContent: paramsThatHadOriginallyCameFromLanding.utmContent,
      })
    }
  }, [accessToken, getOrCreateUserData, isBackendUserInfoLoaded, paramsThatHadOriginallyCameFromLanding])

  return <></>
}
