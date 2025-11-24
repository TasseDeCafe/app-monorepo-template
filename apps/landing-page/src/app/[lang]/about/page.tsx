'use server'

import React from 'react'
import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links'
import { Metadata } from 'next'
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
    title: i18n._(msg`About | TemplateApp`),
    description: i18n._(
      msg`the creators of template-app.com here. We've been pouring our hearts into developing the beta version of the app and your feedback is crucial for us. We're excited to roll out new features soon, and we're always looking for ways to improve the app.`
    ),
    alternates: {
      canonical: 'https://www.template-app.com/about',
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
              <Trans>About Us</Trans>
            </h1>
            <p className='mb-8 text-lg text-stone-900 sm:text-xl'>
              <Trans>
                Hey there! It&apos;s Kamil and Sébastien here, the creators of template-app.com. We&apos;ve been
                pouring our hearts into developing the beta version of the app and your feedback is crucial for us.
                We&apos;re excited to roll out new features soon, and we&apos;re always looking for ways to improve the
                app.
              </Trans>
            </p>
            <p className='mb-8 text-lg text-stone-900 sm:text-xl'>
              <Trans>Please let us know what you think about the app by filling out our feedback form!</Trans>
            </p>
            <div className='flex items-center justify-center gap-x-2'>
              <a
                href={EXTERNAL_LINKS.BETA_VERSION_FEEDBACK_FORM_IN_ENGLISH}
                rel='noopener noreferrer'
                className='inline-flex cursor-pointer items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              >
                <Trans>Give Feedback</Trans>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page
