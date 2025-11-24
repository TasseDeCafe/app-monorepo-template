'use server'

import React from 'react'
import { Trans } from '@lingui/react/macro'
import CTASection from './CTA-section'

export const TranslatedCTASection = async () => {
  return (
    <CTASection
      titleLine1={<Trans>Ready to transform</Trans>}
      titleLine2={<Trans>your language learning</Trans>}
      titleLine3={<Trans>journey?</Trans>}
      description={
        <Trans>
          Join thousands of language enthusiasts who have already improved their accent and fluency with our AI-powered
          platform.
        </Trans>
      }
      buttonText={<Trans>Get Started Now</Trans>}
    />
  )
}
