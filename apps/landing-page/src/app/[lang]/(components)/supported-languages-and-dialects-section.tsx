import React from 'react'
import { Trans } from '@lingui/react/macro'
import { SupportedLanguagesAndDialectsClient } from '@/app/[lang]/(components)/supported-languages-and-dialects-client'

export const SupportedLanguagesAndDialectsSection = async () => {
  return (
    <SupportedLanguagesAndDialectsClient
      title={<Trans>Supported Languages</Trans>}
      description={
        <Trans>
          Our platform supports a wide range of languages and dialects to cater to users from around the world.
        </Trans>
      }
      dialectTitle={<Trans>Supported Dialects</Trans>}
    />
  )
}
