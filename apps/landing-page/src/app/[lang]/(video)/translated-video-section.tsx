'use server'

import React from 'react'
import { Trans } from '@lingui/react/macro'
import DemoVideo from '@/app/[lang]/(video)/demo-video'

export const TranslatedVideoSection = async () => {
  return <DemoVideo title={<Trans>See it in Action</Trans>} iframeTitle='YouTube video player' />
}
