import { useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { DialectCode, LANGUAGES_TO_DIALECT_MAP } from '@template-app/core/constants/lang-codes'
import { useGetUser, usePatchStudyDialect } from '@/hooks/api/user/user-hooks'
import { Check } from 'lucide-react-native'
import { dialectNameMessages } from '@template-app/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

export default function DialectScreen() {
  const { defaultedUserData } = useGetUser()
  const { mutate } = usePatchStudyDialect()
  const [selectedDialect, setSelectedDialect] = useState<DialectCode>(defaultedUserData.studyDialect)

  const availableDialects = LANGUAGES_TO_DIALECT_MAP[defaultedUserData.studyLanguage]

  const handleDialectSelect = (dialect: DialectCode) => {
    setSelectedDialect(dialect)
    mutate({
      studyDialect: dialect,
    })
  }

  return (
    <FlatList
      data={availableDialects}
      renderItem={({ item }) => (
        <DialectItem dialect={item} isSelected={item === selectedDialect} onSelect={handleDialectSelect} />
      )}
      keyExtractor={(item) => item}
    />
  )
}

const DialectItem = ({
  dialect,
  isSelected,
  onSelect,
}: {
  dialect: DialectCode
  isSelected: boolean
  onSelect: (dialect: DialectCode) => void
}) => {
  const { i18n } = useLingui()
  return (
    <Pressable
      onPress={() => onSelect(dialect)}
      className='flex-row items-center justify-between border-b border-gray-100 px-6 py-4'
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
    >
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.5 : 1 }} className='flex-1 flex-row items-center justify-between'>
          <Text className='text-base'>{i18n._(dialectNameMessages[dialect])}</Text>
          {isSelected && <Check size={20} color='#4f46e5' />}
        </View>
      )}
    </Pressable>
  )
}
