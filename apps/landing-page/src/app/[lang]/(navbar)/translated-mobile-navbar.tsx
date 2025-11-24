'use server'
import { LangProps } from '@/types/lang-props'
import { Trans } from '@lingui/react/macro'
import MobileNavbar from '@/app/[lang]/(navbar)/mobile-navbar'

const TranslatedMobileNavbar = ({ lang }: LangProps) => {
  return (
    <MobileNavbar
      featuresText={<Trans>Features</Trans>}
      pricingText={<Trans>Pricing</Trans>}
      aboutText={<Trans>About</Trans>}
      affiliatesText={<Trans>Affiliates</Trans>}
      signInText={<Trans>Sign in</Trans>}
      lang={lang}
    />
  )
}

export default TranslatedMobileNavbar
