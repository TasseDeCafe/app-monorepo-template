'use server'

import { LangProps } from '@/types/lang-props'
import DesktopNavbar from '@/app/[lang]/(navbar)/desktop-navbar'
import TranslatedMobileNavbar from '@/app/[lang]/(navbar)/translated-mobile-navbar'

const Navbar = ({ lang }: LangProps) => {
  return (
    <nav className='relative z-40 flex w-full items-center justify-between bg-gray-50 px-4 py-4 md:px-8'>
      <DesktopNavbar lang={lang} />
      <TranslatedMobileNavbar lang={lang} />
    </nav>
  )
}

export default Navbar
