import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

type LanguageCardProps = {
  lang: LangCode
  handleClick: (lang: LangCode) => void
  isSelected: boolean
}

export const LanguageCard = ({ lang, handleClick, isSelected }: LanguageCardProps) => {
  const { i18n } = useLingui()
  return (
    <button
      className={cn(
        'flex h-12 items-center justify-center rounded-xl border bg-white shadow focus:outline-none',
        { 'bg-gradient-to-r from-orange-300 to-yellow-300': isSelected },
        { 'hover:bg-gray-100': !isSelected }
      )}
      onClick={() => handleClick(lang)}
    >
      <div className='flex items-center'>
        <CustomCircularFlag languageOrDialectCode={lang} className={'h-5 bg-transparent'} />
        <span className={cn('ml-2 text-xl', { 'text-gray-700': isSelected }, { 'text-gray-500': !isSelected })}>
          {i18n._(langNameMessages[lang])}
        </span>
      </div>
    </button>
  )
}
