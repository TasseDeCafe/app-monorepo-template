'use server'

import { TranslatedAlternatingFeaturesSection } from '@/app/[lang]/(components)/(alternating-feature-section)/translated-alternating-features-section'
import { setI18n } from '@lingui/react/server'
import { getLinguiInstance } from '@/i18n/get-lingui-instance'
import { LangProps } from '@/types/lang-props'

const FeaturesSection = async ({ params }: { params: Promise<LangProps> }) => {
  const { lang } = await params
  const { i18n } = await getLinguiInstance(lang)
  setI18n(i18n)

  return <TranslatedAlternatingFeaturesSection />
}

export default FeaturesSection
