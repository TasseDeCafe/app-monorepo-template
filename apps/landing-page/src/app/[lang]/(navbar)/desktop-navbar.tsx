'use server'

import Link from 'next/link'
import Image from 'next/image'
import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links'
import { LangProps } from '@/types/lang-props'
import { Trans } from '@lingui/react/macro'
import { DiscordIcon } from '@/app/[lang]/(navbar)/discord-icon'
import { ButtonLeadingToWebapp } from '@/app/[lang]/(components)/(leading-to-apps)/button-leading-to-webapp'
import DesktopLanguageSwitcher from '@/app/[lang]/(components)/desktop-language-switcher'

const DesktopNavbar = ({ lang }: LangProps) => {
  return (
    <>
      <Link href={`/${lang}`} className='relative flex flex-row items-center'>
        <Image src='/images/logo-full.svg' alt='TemplateApp logo' width={33} height={33} priority />
        <div className='font-nunito ml-1 hidden flex-col items-center font-semibold text-indigo-600 md:flex'>
          <span className='text-xl leading-4'>YourBest</span>
          <span className='text-xl leading-4'>Accent</span>
        </div>
        <span className='font-nunito absolute left-[37px] top-0 text-sm text-indigo-600 md:-top-[5px] md:left-[121px] md:text-xs'>
          beta
        </span>
      </Link>

      <div className='hidden lg:block'>
        <div className='flex items-center space-x-6'>
          <Link
            href={EXTERNAL_LINKS.DISCORD_SERVER}
            target='_blank'
            className='flex items-center text-lg text-gray-600 hover:text-gray-900'
          >
            <DiscordIcon />
            <span className='ml-2'>Discord</span>
          </Link>
          <Link href={`/${lang}/features`} className='text-lg text-gray-600 hover:text-gray-900'>
            <Trans>Features</Trans>
          </Link>
          <Link href={`/${lang}/pricing`} className='text-lg text-gray-600 hover:text-gray-900'>
            <Trans>Pricing</Trans>
          </Link>
          <Link href={`/${lang}/about`} className='text-lg text-gray-600 hover:text-gray-900'>
            <Trans>About</Trans>
          </Link>
          <Link
            href={EXTERNAL_LINKS.AFFILIATE_PROGRAM_PAGE}
            target='_blank'
            className='text-lg text-gray-600 hover:text-gray-900'
          >
            <Trans>Affiliates</Trans>
          </Link>
          <DesktopLanguageSwitcher lang={lang} />
        </div>
      </div>

      <div className='hidden lg:block'>
        <ButtonLeadingToWebapp
          analyticsClickName='sign_in_button_in_desktop_navbar'
          className='flex min-w-36 items-center justify-center rounded-xl border-2 border-stone-600 px-8 py-2 text-lg font-medium text-stone-900 hover:bg-gray-50 active:bg-gray-100'
          buttonText={<Trans>Sign in</Trans>}
        />
      </div>
    </>
  )
}

export default DesktopNavbar
