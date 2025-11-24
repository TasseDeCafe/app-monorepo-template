import { Pressable, Text, View } from 'react-native'
import { DialectCode } from '@template-app/core/constants/lang-codes'
import { CustomCircularFlag } from './custom-circular-flag'
import { dialectNameMessages } from '@template-app/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

type DialectCardProps = {
  dialect: DialectCode
  handleClick: (dialect: DialectCode) => void
  isSelected: boolean
}

export const DialectCard = ({ dialect, handleClick, isSelected }: DialectCardProps) => {
  const { i18n } = useLingui()

  return (
    <Pressable
      className={`h-14 flex-row items-center justify-center rounded-xl border p-3 ${
        isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-gray-200 bg-white'
      }`}
      onPress={() => handleClick(dialect)}
    >
      <View className='flex-row items-center'>
        <View className='flex h-7 w-7 items-center justify-center'>
          <CustomCircularFlag languageOrDialectCode={dialect} size={24} />
        </View>
        <Text className={`ml-4 text-xl font-medium leading-6 ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
          {i18n._(dialectNameMessages[dialect])}
        </Text>
      </View>
    </Pressable>
  )
}
