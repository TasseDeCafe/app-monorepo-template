'use server'

import React from 'react'
import { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import { setI18n } from '@lingui/react/server'
import { getLinguiInstance } from '@/i18n/get-lingui-instance'
import { msg } from '@lingui/core/macro'
import { LangProps } from '@/types/lang-props'

export const generateMetadata = async (props: { params: Promise<LangProps> }): Promise<Metadata> => {
  const params = await props.params
  const { lang } = params
  const { i18n } = await getLinguiInstance(lang)

  return {
    title: i18n._(msg`Contact | YourBestAccent`),
    description: i18n._(msg`Contact the team behind YourBestAccent. We would love to hear from you!`),
    alternates: {
      canonical: 'https://www.yourbestaccent.com/contact',
    },
  }
}

const Page = async ({ params }: { params: Promise<LangProps> }) => {
  const { lang } = await params
  const { i18n } = await getLinguiInstance(lang)
  setI18n(i18n)
  return (
    <main
      className='flex w-full flex-1 flex-col items-center justify-center transition-all duration-300 ease-in-out'
      id='main-content'
    >
      <div className='container mx-auto px-4 py-8 md:py-16'>
        <div className='mb-16 flex flex-col items-center justify-center lg:flex-row'>
          <div className='mb-8 w-full lg:mb-0 lg:w-1/2 lg:pr-8'>
            <h1 className='mb-6 text-6xl font-bold text-stone-900'>
              <Trans>Contact Us</Trans>
            </h1>
            <p className='mb-8 text-lg text-stone-900 sm:text-xl'>
              <Trans>
                Have questions, feedback, or just want to say hello? We would love to hear from you! Feel free to reach
                out to us by email.
              </Trans>
            </p>

            <div className='mb-8 rounded-lg bg-indigo-50 p-6'>
              <div className='flex items-center'>
                <Mail className='mr-3 h-6 w-6 text-indigo-600' />
                <p className='text-xl font-medium text-stone-900'>contact@yourbestaccent.com</p>
              </div>
              <p className='mt-4 text-stone-700'>
                <Trans>We typically respond within 1-2 business days. Looking forward to hearing from you!</Trans>
              </p>
            </div>

            <p className='text-lg text-stone-900 sm:text-xl'>
              <Trans>
                Thank you for your interest in YourBestAccent. Your feedback helps us improve our language learning
                platform.
              </Trans>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page
