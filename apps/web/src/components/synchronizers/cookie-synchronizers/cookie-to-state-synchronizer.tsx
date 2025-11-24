import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { accountActions } from '@/state/slices/account-slice.ts'
import {
  AGREED_TO_ALL_COOKIE,
  AGREED_TO_ESSENTIALS_ONLY_COOKIE,
} from '@yourbestaccent/core/constants/cookie-constants.ts'

// we need this to sync the cookie consent state with redux at startup
export const CookieToStateSynchronizer = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (document.cookie.includes(AGREED_TO_ALL_COOKIE)) {
      dispatch(accountActions.setAllCookiesAccepted())
    } else if (document.cookie.includes(AGREED_TO_ESSENTIALS_ONLY_COOKIE)) {
      dispatch(accountActions.setEssentialCookiesAccepted())
    } else {
      dispatch(accountActions.setCookiesAreEmpty())
    }
  }, [dispatch])

  return <></>
}
