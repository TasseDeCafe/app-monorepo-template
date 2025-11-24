import { useSelector } from 'react-redux'
import {
  selectAccountAccessToken,
  selectIsBackendUserInfoLoaded,
  selectParamsThatHadOriginallyCameFromLanding,
} from '@/state/slices/account-slice.ts'
import { useEffect, useState } from 'react'
import { useCreateOrUpdateUser } from '@/hooks/api/user/user-hooks'
import { useShouldReceiveMarketingEmails } from '@/hooks/api/user-marketing-preferences/user-marketing-preferences-hooks'

export const UserRetrieving = () => {
  const accessToken = useSelector(selectAccountAccessToken)
  const paramsThatHadOriginallyCameFromLanding = useSelector(selectParamsThatHadOriginallyCameFromLanding)
  const isBackendUserInfoLoaded = useSelector(selectIsBackendUserInfoLoaded)

  const [shouldFetchMarketingPreferences, setShouldFetchMarketingPreferences] = useState(false)

  const { mutate: getOrCreateUserData, isPending: isFetchingUserData } = useCreateOrUpdateUser()

  // todo react-query: consider logging errors for this query now that global meta handling is in place
  useShouldReceiveMarketingEmails(shouldFetchMarketingPreferences)

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

  useEffect(() => {
    if (!accessToken) {
      setShouldFetchMarketingPreferences(false)
      return
    }

    if (isFetchingUserData) {
      setShouldFetchMarketingPreferences(false)
      return
    }

    // related to GRAM-1320 https://www.notion.so/grammarians/Marketing-preferences-bug-s-1a3168e7b01a8018949df740993672bb
    // this is dirty, it turns out that customer.io is not synchronous. Even though they return a 200 response
    // for a new customer creation (it's called "identify" in their convention), this data is not immediately retrievable
    // I guess internally creating a customer makes their infrastructure just put a task on a queue
    // this is why we need this ugly setTimeout
    const fiveSeconds = 5000
    const timeoutId = setTimeout(() => {
      setShouldFetchMarketingPreferences(true)
    }, fiveSeconds)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [accessToken, isFetchingUserData])

  return <></>
}
