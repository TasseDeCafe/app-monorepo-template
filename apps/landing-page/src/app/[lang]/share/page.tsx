import { Metadata } from 'next'
import { getConfig } from '@/config/environment-config'
import { LangProps } from '@/types/lang-props'
import { EXERCISE_TEXT_SEARCH_PARAM_NAME } from '@yourbestaccent/core/constants/search-params'
import ShareRedirect from '@/app/[lang]/share/(components)/share'
import { getLinguiInstance } from '@/i18n/get-lingui-instance'
import { msg } from '@lingui/core/macro'

// we need this page on landing so that are exercises have previews on social media when shared
export const generateMetadata = async (props: {
  params: Promise<LangProps>
  searchParams: Promise<{ [_: string]: string | string[] | undefined }>
}): Promise<Metadata> => {
  const searchParams = await props.searchParams
  const params = await props.params

  const { lang } = params

  const { i18n } = await getLinguiInstance(lang)

  const rawText = searchParams[EXERCISE_TEXT_SEARCH_PARAM_NAME]
  const text: string = typeof rawText === 'string' ? rawText : ''

  return {
    title: i18n._(msg`Can you pronounce this better than me?`),
    description: text,
    metadataBase: new URL(getConfig().landingPageUrl),
  }
}

export default ShareRedirect
