import { DialectCode, LangCode } from '@template-app/core/constants/lang-codes'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { CircleFlag, CircleFlagLanguage } from 'react-circle-flags'
import Image from 'next/image'

type FlagProps = {
  languageOrDialectCode: LangCode | DialectCode
  className?: string
}

const CUSTOM_FLAG_MAP: Record<string, string> = {
  [DialectCode.ANDALUSIAN_SPANISH]: '/images/flags/flag-of-andalusia.png',
  [DialectCode.AFRICAN_AMERICAN_VERNACULAR_ENGLISH]: '/images/flags/flag-of-louisiana.png',
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
      <div className={cn('relative inline-block items-center justify-center overflow-hidden rounded-full', className)}>
        <Image src={customFlagUrl} alt={`${languageOrDialectCode} flag`} fill className='object-cover' />
      </div>
    )
  }

  if (Object.values(DialectCode).includes(languageOrDialectCode as DialectCode)) {
    const countryCode = getCountryCode(languageOrDialectCode as DialectCode)
    return <CircleFlag countryCode={countryCode.toLowerCase()} className={className} />
  }

  return <CircleFlagLanguage languageCode={languageOrDialectCode} className={className} />
}
