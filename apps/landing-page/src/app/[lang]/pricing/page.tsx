'use server'

import { TranslatedPricingSection } from '@/app/[lang]/(components)/(pricing)/translated-pricing-section'
import { LangProps } from '@/types/lang-props'
import { PricingFaqItems } from '@/app/[lang]/(components)/(faq-section)/pricing-faq-items'
import { Card } from '@/design-system/card'
import { Metadata } from 'next'
import { Trans } from '@lingui/react/macro'
import { setI18n } from '@lingui/react/server'
import { getLinguiInstance } from '@/i18n/get-lingui-instance'
import { msg } from '@lingui/core/macro'

export const generateMetadata = async (props: { params: Promise<LangProps> }): Promise<Metadata> => {
  const params = await props.params
  const { lang } = params
  const { i18n } = await getLinguiInstance(lang)

  return {
    title: i18n._(msg`Pricing | YourBestAccent`),
    description: i18n._(
      msg`Choose the perfect plan for your accent training journey. Flexible pricing options to help you achieve your perfect accent with AI-powered voice training.`
    ),
    alternates: {
      canonical: 'https://www.yourbestaccent.com/pricing',
    },
  }
}

const Pricing = async ({ params }: { params: Promise<LangProps> }) => {
  const { lang } = await params
  const { i18n } = await getLinguiInstance(lang)
  setI18n(i18n)

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-y-4 px-1 py-4 md:gap-y-8 md:px-4 md:py-8'>
      <TranslatedPricingSection />
      <Card className='max-w-2xl shadow'>
        <h2 className='mb-2 text-center text-3xl font-bold text-gray-900 md:mb-8'>
          <Trans>Frequently Asked Questions</Trans>
        </h2>
        <PricingFaqItems />
      </Card>
    </div>
  )
}

export default Pricing
