'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { Toggle } from '@/design-system/toggle'
import { getConfig } from '@/config/environment-config'
import { Button } from '@/design-system/button'
import {
  AGREED_TO_ALL_COOKIE,
  AGREED_TO_ESSENTIALS_ONLY_COOKIE,
  COOKIE_EXPIRATION_TIME_IN_SECONDS,
} from '@template-app/core/constants/cookie-constants'
import { COOKIE_CONSENT_EVENT_NAME } from '@/constants/document-event-names'

import { ReactNode } from 'react'

interface CookieBannerProps {
  message: ReactNode
  acceptLabel: ReactNode
  moreLabel: ReactNode
  lessLabel: ReactNode
  essentialTitle: ReactNode
  essentialDescription: ReactNode
  analyticsTitle: ReactNode
  analyticsDescription: ReactNode
}

export const CookieBanner = ({
  message,
  acceptLabel,
  moreLabel,
  lessLabel,
  essentialTitle,
  essentialDescription,
  analyticsTitle,
  analyticsDescription,
}: CookieBannerProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  useEffect(() => {
    const hasAcceptedAllCookies = document.cookie.includes(AGREED_TO_ALL_COOKIE)
    if (hasAcceptedAllCookies) {
      setAnalyticsEnabled(true)
      setIsVisible(false)
      return
    }
    if (document.cookie.includes(AGREED_TO_ESSENTIALS_ONLY_COOKIE)) {
      setAnalyticsEnabled(false)
      setIsVisible(false)
      return
    } else {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    if (analyticsEnabled) {
      document.cookie = `${AGREED_TO_ALL_COOKIE}; max-age=${COOKIE_EXPIRATION_TIME_IN_SECONDS}; path=/; domain=.${getConfig().domain}`
    } else {
      document.cookie = `${AGREED_TO_ESSENTIALS_ONLY_COOKIE}; max-age=${COOKIE_EXPIRATION_TIME_IN_SECONDS}; path=/; domain=.${getConfig().domain}`
    }
    // we could use another event system in the future, maybe even redux, so that it resembles frontend
    document.dispatchEvent(new Event(COOKIE_CONSENT_EVENT_NAME))
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
            <div className='text-sm text-gray-600'>{message}</div>
            <div className='flex flex-col items-center gap-2 md:flex-row md:gap-4'>
              <Button
                onClick={() => acceptCookies()}
                className='whitespace-nowrap bg-indigo-600 px-4 py-2 text-xl text-white hover:bg-indigo-500 md:px-8'
              >
                {acceptLabel}
              </Button>
              <Button onClick={() => setIsExpanded(!isExpanded)} className='text-xs text-gray-500 hover:text-gray-700'>
                {isExpanded ? (
                  <>
                    {lessLabel}
                    <ChevronUp className='ml-1 h-3 w-3' />
                  </>
                ) : (
                  <>{moreLabel}</>
                )}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className='space-y-4 border-t pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>{essentialTitle}</h3>
                  <p className='text-xs text-gray-500'>{essentialDescription}</p>
                </div>
                <Toggle isToggled={true} onClick={() => {}} disabled={true} />
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>{analyticsTitle}</h3>
                  <p className='text-xs text-gray-500'>{analyticsDescription}</p>
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
