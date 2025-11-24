import React from 'react'
import Image from 'next/image'
import { Trans } from '@lingui/react/macro'
import { ButtonLeadingToWebapp } from '@/app/[lang]/(components)/(leading-to-apps)/button-leading-to-webapp'
import { NUMBER_OF_DAYS_IN_FREE_TRIAL } from '@yourbestaccent/core/constants/pricing-constants'
import { Check } from 'lucide-react'
import { QRCodeButton } from '@/app/[lang]/(components)/qr-code-button'
import { getConfig } from '@/config/environment-config'

type ImageWithEdgeGradientProps = { src: string; alt: string; width: number; height: number }

export const HeroSection = () => {
  return (
    <section className='container mx-auto mt-8 px-4 sm:px-10 md:mt-16'>
      <div className='mb-16 flex flex-col items-center justify-between lg:flex-row'>
        <div className='mb-8 w-full lg:mb-0 lg:w-1/2 lg:pr-8'>
          <h1 className='mb-6 text-6xl font-bold text-stone-900'>
            <Trans>Master Your Accent</Trans>
          </h1>
          <p className='mb-8 text-lg text-stone-900 sm:text-xl'>
            <Trans>
              Master your accent and pronunciation in any language with AI-powered voice cloning technology. Practice
              with your own voice and achieve native-like pronunciation.
            </Trans>
          </p>

          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            {getConfig().featureFlags.shouldInformAboutIosNativeApp() ? (
              <>
                <QRCodeButton
                  qrText={<Trans>Download the App</Trans>}
                  modalTitle={<Trans>Get the App</Trans>}
                  modalSubtitle={<Trans>Scan the QR code to download the app</Trans>}
                  orCopyLinksTo={<Trans>or copy links to</Trans>}
                  appStore={<Trans>App Store</Trans>}
                  playStore={<Trans>Play Store</Trans>}
                  copied={<Trans>Copied!</Trans>}
                />
                <ButtonLeadingToWebapp
                  analyticsClickName='start_button_in_hero_section'
                  buttonText={<Trans>Use on Web</Trans>}
                  className='hidden h-14 w-72 items-center justify-center gap-2 border border-stone-200 bg-white px-6 text-xl text-stone-700 hover:bg-stone-50 md:flex'
                />
                <ButtonLeadingToWebapp
                  analyticsClickName='start_button_in_hero_section'
                  buttonText={<Trans>Use on Web</Trans>}
                  className='flex h-14 w-72 items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2 text-xl font-medium text-white shadow-lg md:hidden'
                />
              </>
            ) : (
              <ButtonLeadingToWebapp
                analyticsClickName='start_button_in_hero_section'
                buttonText={<Trans>Get Started</Trans>}
                className='flex h-14 w-72 items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2 text-xl font-medium text-white shadow-lg'
              />
            )}
          </div>

          <div className='mt-6 flex flex-col items-start space-y-2 sm:space-y-0'>
            <span className='flex items-center gap-x-1 text-stone-700'>
              <Check className='h-4 w-4' /> <Trans>Trusted by thousands language learners</Trans>
            </span>
            <span className='flex items-center gap-x-1 text-stone-700'>
              <Check className='h-4 w-4' /> <Trans>{NUMBER_OF_DAYS_IN_FREE_TRIAL}-day free trial</Trans>
            </span>
          </div>
        </div>
        <div className='relative w-full lg:w-2/5'>
          <div>
            <ImageWithEdgeGradient
              src='/images/hero-image.jpg'
              alt='accent mastery through AI-powered voice cloning technology'
              width={500}
              height={300}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

const ImageWithEdgeGradient = ({ src, alt, width, height }: ImageWithEdgeGradientProps) => {
  return (
    <div className='relative w-full overflow-hidden rounded-lg'>
      <Image src={src} alt={alt} width={width} height={height} className='h-auto w-full object-cover' />
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-gray-50 to-transparent'></div>
        <div className='absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent'></div>
        <div className='absolute bottom-0 left-0 top-0 w-16 bg-gradient-to-r from-gray-50 to-transparent'></div>
        <div className='absolute bottom-0 right-0 top-0 w-16 bg-gradient-to-l from-gray-50 to-transparent'></div>

        <div className='absolute left-0 top-0 h-32 w-32 rounded-tl-lg bg-gradient-to-br from-gray-50 to-transparent'></div>
        <div className='absolute right-0 top-0 h-32 w-32 rounded-tr-lg bg-gradient-to-bl from-gray-50 to-transparent'></div>
        <div className='absolute bottom-0 left-0 h-32 w-32 rounded-bl-lg bg-gradient-to-tr from-gray-50 to-transparent'></div>
        <div className='absolute bottom-0 right-0 h-32 w-32 rounded-br-lg bg-gradient-to-tl from-gray-50 to-transparent'></div>
      </div>
    </div>
  )
}
