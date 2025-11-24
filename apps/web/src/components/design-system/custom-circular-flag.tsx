import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { CircleFlag, CircleFlagLanguage } from 'react-circle-flags'

type FlagProps = {
  languageOrDialectCode: LangCode | DialectCode
  className?: string
}

const CUSTOM_FLAG_MAP: Record<string, string> = {
  [DialectCode.ANDALUSIAN_SPANISH]: '/flags/flag-of-andalusia.png',
  [DialectCode.AFRICAN_AMERICAN_VERNACULAR_ENGLISH]: '/flags/flag-of-louisiana.png',
}

// Extract country code from dialect code (e.g., 'en-US' → 'US', 'pt-BR' → 'BR')
const getCountryCode = (dialect: DialectCode): string => {
  const index = dialect.indexOf('-')
  return dialect.slice(index + 1)
}

export const CustomCircularFlag = ({ languageOrDialectCode, className }: FlagProps) => {
  const customFlagUrl = CUSTOM_FLAG_MAP[languageOrDialectCode]

  if (customFlagUrl) {
    return (
      <div className={cn('inline-block items-center justify-center overflow-hidden rounded-full', className)}>
        <img src={customFlagUrl} alt={`${languageOrDialectCode} flag`} className='h-full w-full object-cover' />
      </div>
    )
  }

  if (Object.values(DialectCode).includes(languageOrDialectCode as DialectCode)) {
    const countryCode = getCountryCode(languageOrDialectCode as DialectCode)
    return <CircleFlag countryCode={countryCode.toLowerCase()} className={className} />
  }

  return <CircleFlagLanguage languageCode={languageOrDialectCode} className={className} />
}
