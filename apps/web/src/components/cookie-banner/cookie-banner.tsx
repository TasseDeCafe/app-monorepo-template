import { useEffect, useState } from 'react'
import { Button } from '../design-system/button'
import { ChevronUp } from 'lucide-react'
import { Toggle } from '../design-system/toggle'
import { useDispatch, useSelector } from 'react-redux'
import {
  accountActions,
  selectAnalyticsCookiesAccepted,
  selectEssentialCookiesAccepted,
} from '@/state/slices/account-slice.ts'
import { getConfig } from '@/config/environment-config.ts'
import {
  AGREED_TO_ALL_COOKIE,
  AGREED_TO_ESSENTIALS_ONLY_COOKIE,
  COOKIE_EXPIRATION_TIME_IN_SECONDS,
} from '@yourbestaccent/core/constants/cookie-constants'
import { useLingui } from '@lingui/react/macro'

export const CookieBanner = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const analyticsCookiesAccepted: boolean = useSelector(selectAnalyticsCookiesAccepted)
  const essentialCookiesAccepted: boolean = useSelector(selectEssentialCookiesAccepted)

  useEffect(() => {
    if (!analyticsCookiesAccepted && !essentialCookiesAccepted) {
    }
  }, [dispatch, analyticsCookiesAccepted, essentialCookiesAccepted])

  const acceptCookies = () => {
    if (analyticsEnabled) {
      document.cookie = `${AGREED_TO_ALL_COOKIE}; max-age=${COOKIE_EXPIRATION_TIME_IN_SECONDS}; path=/; domain=.${getConfig().domain}`
      dispatch(accountActions.setAllCookiesAccepted())
    } else {
      document.cookie = `${AGREED_TO_ESSENTIALS_ONLY_COOKIE}; max-age=${COOKIE_EXPIRATION_TIME_IN_SECONDS}; path=/; domain=.${getConfig().domain}`
      dispatch(accountActions.setEssentialCookiesAccepted())
    }
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/20 backdrop-blur-0' />
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-lg transition-all duration-300 ease-in-out md:p-10'>
        <div className='mx-auto flex max-w-7xl flex-col gap-4'>
          <div className='flex flex-row items-center justify-between gap-4'>
            <div className='text-sm text-gray-600'>{t`We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.`}</div>
            <div className='flex flex-col items-center gap-2 md:flex-row md:gap-4'>
              <Button
                onClick={() => acceptCookies()}
                className='whitespace-nowrap bg-indigo-600 px-4 py-2 text-xl text-white hover:bg-indigo-500 md:px-8'
              >
                {t`Accept`}
              </Button>
              <Button onClick={() => setIsExpanded(!isExpanded)} className='text-xs text-gray-500 hover:text-gray-700'>
                {isExpanded ? (
                  <>
                    {t`Less`}
                    <ChevronUp className='ml-1 h-3 w-3' />
                  </>
                ) : (
                  <>{t`More`}</>
                )}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className='space-y-4 border-t pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>{t`Essential Cookies`}</h3>
                  <p className='text-xs text-gray-500'>{t`Required for the website to function properly. These cannot be disabled.`}</p>
                </div>
                <Toggle isToggled={true} onClick={() => {}} disabled={true} />
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>{t`Analytics Cookies`}</h3>
                  <p className='text-xs text-gray-500'>{t`Help us understand how visitors interact with our website. This data is anonymized.`}</p>
                </div>
                <Toggle isToggled={analyticsEnabled} onClick={setAnalyticsEnabled} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
