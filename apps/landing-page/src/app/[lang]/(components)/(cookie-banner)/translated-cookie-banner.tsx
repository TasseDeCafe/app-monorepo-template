'use server'

import React from 'react'
import { Trans } from '@lingui/react/macro'
import { CookieBanner } from '@/app/[lang]/(components)/(cookie-banner)/cookie-banner'

export const TranslatedCookieBanner = async () => {
  return (
    <CookieBanner
      message={
        <Trans>
          We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.
        </Trans>
      }
      acceptLabel={<Trans>Accept</Trans>}
      moreLabel={<Trans>More</Trans>}
      lessLabel={<Trans>Less</Trans>}
      essentialTitle={<Trans>Essential Cookies</Trans>}
      essentialDescription={<Trans>Required for the website to function properly. These cannot be disabled.</Trans>}
      analyticsTitle={<Trans>Analytics Cookies</Trans>}
      analyticsDescription={
        <Trans>Help us understand how visitors interact with our website. This data is anonymized.</Trans>
      }
    />
  )
}
