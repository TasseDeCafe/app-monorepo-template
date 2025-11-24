import React from 'react'
import { setI18n } from '@lingui/react/server'
import { TranslatedAlternatingFeaturesSection } from '@/app/[lang]/(components)/(alternating-feature-section)/translated-alternating-features-section'
import { TestimonialSection } from '@/app/[lang]/(components)/testimonial-section'
import { FeatureCardsSection } from '@/app/[lang]/(components)/feature-cards-section'
import { HeroSection } from '@/app/[lang]/(components)/hero-section'
import { LangProps } from '@/types/lang-props'
import FAQSection from '@/app/[lang]/(components)/(faq-section)/faq-section'
import { TranslatedPricingSection } from '@/app/[lang]/(components)/(pricing)/translated-pricing-section'
import { TranslatedVideoSection } from '@/app/[lang]/(video)/translated-video-section'
import { TranslatedCTASection } from '@/app/[lang]/(components)/translated-cta-section'
import { SupportedLanguagesAndDialectsSection } from '@/app/[lang]/(components)/supported-languages-and-dialects-section'
import { WebViewDetector } from '@/app/[lang]/(components)/web-view-detector'
import { VideoGridSection } from '@/app/[lang]/(components)/(video-grid-section)/video-grid-section'
import { getLinguiInstance } from '@/i18n/get-lingui-instance'

export const Home = async ({ params }: { params: Promise<LangProps> }) => {
  const { lang } = await params
  const { i18n } = await getLinguiInstance(lang)
  setI18n(i18n)

  return (
    <>
      <HeroSection />

      <FeatureCardsSection />
      <div className='h-10 sm:h-20' />

      <TranslatedAlternatingFeaturesSection />
      <div className='h-10 sm:h-20' />

      <SupportedLanguagesAndDialectsSection />
      <div className='h-10 sm:h-20' />

      <VideoGridSection />
      <div className='h-10 sm:h-20' />

      <TestimonialSection />
      <div className='h-10 sm:h-20' />

      <FAQSection />
      <div className='h-10 sm:h-20' />

      <TranslatedVideoSection />
      <div className='h-10 sm:h-20' />

      <TranslatedPricingSection />
      <div className='h-10 sm:h-20' />

      <TranslatedCTASection />
      <div className='h-10 sm:h-20' />

      <WebViewDetector />
    </>
  )
}
