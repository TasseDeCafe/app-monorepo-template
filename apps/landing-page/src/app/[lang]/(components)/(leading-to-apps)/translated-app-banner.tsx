'use server'

import React from 'react'
import { Trans } from '@lingui/react/macro'
import { AppBanner } from '@/app/[lang]/(components)/(leading-to-apps)/app-banner'

export const TranslatedAppBanner = async () => {
  return (
    <AppBanner
      appName={<Trans>TemplateApp</Trans>}
      category={<Trans>Education</Trans>}
      purchases={<Trans>In-App Purchases</Trans>}
    />
  )
}
