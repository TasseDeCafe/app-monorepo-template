import { DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { dialectNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

type Props = {
  dialect: DialectCode
  handleClick: (dialect: DialectCode) => void
  isSelected: boolean
}

export const DialectCard = ({ dialect, handleClick, isSelected }: Props) => {
  const { i18n } = useLingui()
  return (
    <button
      className={cn(
        'flex h-12 items-center justify-center rounded-xl border bg-white shadow focus:outline-none',
        { 'bg-gradient-to-r from-orange-300 to-yellow-300': isSelected },
        { 'hover:bg-gray-100': !isSelected }
      )}
      onClick={() => handleClick(dialect)}
    >
      <div className='flex items-center'>
        <CustomCircularFlag languageOrDialectCode={dialect} className={'h-5 w-5 bg-transparent'} />
        <span className={cn('ml-2 text-xl', { 'text-gray-700': isSelected }, { 'text-gray-500': !isSelected })}>
          {i18n._(dialectNameMessages[dialect])}
        </span>
      </div>
    </button>
  )
}
