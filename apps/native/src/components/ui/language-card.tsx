import { Text, TouchableOpacity, View } from 'react-native'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { CustomCircularFlag } from '@/components/ui/custom-circular-flag'
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
    <TouchableOpacity
      className={cn('h-14 flex-row items-center justify-center rounded-xl border p-3', {
        'border-indigo-500 bg-indigo-500/10': isSelected,
        'border-gray-200 bg-white': !isSelected,
      })}
      onPress={() => handleClick(lang)}
    >
      <View className='flex-row items-center'>
        <View className='flex h-7 w-7 items-center justify-center'>
          <CustomCircularFlag languageOrDialectCode={lang} size={24} />
        </View>
        <Text className={`ml-4 text-xl font-medium leading-6 ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
          {i18n._(langNameMessages[lang])}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
