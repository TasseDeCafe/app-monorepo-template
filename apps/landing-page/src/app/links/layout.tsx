import { Nunito } from 'next/font/google'
import '../[lang]/globals.css'
import { ReactNode } from 'react'
import Navbar from '@/app/[lang]/(navbar)/navbar'
import Footer from '@/app/[lang]/(footer)/footer'
import { LinguiClientProvider } from '@/i18n/lingui-client-provider'
import { getLinguiInstance } from '@/i18n/get-lingui-instance'
import { POLISH_LOCALE } from '@/i18n/i18n-config'
import { setI18n } from '@lingui/react/server'

const nunito = Nunito({ subsets: ['latin'] })

const LinksRootLayout = async ({ children }: { children: ReactNode }) => {
  // All the links in this folder were created for wykop campaigns,
  // which is why we redirect to the Polish version.
  const { i18n, linguiLocale, messages } = await getLinguiInstance(POLISH_LOCALE)
  setI18n(i18n)

  return (
    <html lang={linguiLocale} className={nunito.className}>
      <body className='flex h-dvh w-full flex-col justify-between bg-gray-50'>
        <LinguiClientProvider initialLocale={linguiLocale} initialMessages={messages}>
          <Navbar lang={linguiLocale} />
          {children}
          <Footer lang={linguiLocale} />
        </LinguiClientProvider>
      </body>
    </html>
  )
}

export default LinksRootLayout
