import { CircleFlagLanguage } from 'react-circle-flags'
import { Locale } from '@/i18n/i18n-config'

type FlagProps = {
  locale: Locale
  className?: string
}

export const CustomCircularFlag = ({ locale, className }: FlagProps) => {
  return <CircleFlagLanguage languageCode={locale} className={className} />
}
