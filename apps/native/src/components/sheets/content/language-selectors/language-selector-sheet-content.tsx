import { ListRenderItemInfo, Pressable, Text, View } from 'react-native'
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { LangCode } from '@template-app/core/constants/lang-codes'
import { Check, Search } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { CustomCircularFlag } from '@/components/ui/custom-circular-flag'
import colors from 'tailwindcss/colors'
import { langNameMessages } from '@template-app/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

export type LanguageSelectorSheetContentProps = {
  close: () => void
  onLanguageSelect?: (language: LangCode) => void
  initialLanguage?: LangCode
  languageFilter: (userInput: string) => LangCode[]
  title: string
  description: string
  searchPlaceholder: string
}

export const LanguageSelectorSheetContent = ({
  close,
  onLanguageSelect,
  initialLanguage,
  languageFilter,
  title,
  description,
  searchPlaceholder,
}: LanguageSelectorSheetContentProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LangCode>(initialLanguage || LangCode.ENGLISH)
  const [searchQuery, setSearchQuery] = useState('')

  const bottomSheetPadding = useBottomSheetPadding()

  const handleLanguageSelect = (language: LangCode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
    setSelectedLanguage(language)

    if (onLanguageSelect) {
      onLanguageSelect(language)
    }
    close()
  }

  const filteredLanguages = languageFilter(searchQuery)

  const { i18n } = useLingui()

  return (
    <View className='flex-1 px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='mb-2 text-center text-2xl font-semibold'>{title}</Text>
      <Text className='mb-2 text-center text-gray-500'>{description}</Text>
      <View className='flex flex-row items-center rounded-xl border border-gray-200 px-4'>
        <Search size={20} color={colors.gray[500]} />
        <BottomSheetTextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          className='h-14 w-full border-gray-300 px-4 py-3'
          placeholderTextColor={colors.gray[500]}
          returnKeyType='done'
        />
      </View>
      <BottomSheetFlatList
        data={filteredLanguages}
        keyExtractor={(item: LangCode) => item}
        className='flex-1'
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }: ListRenderItemInfo<LangCode>) => (
          <Pressable
            onPress={() => handleLanguageSelect(item)}
            className='flex-row items-center justify-between border-b border-gray-100 py-4'
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
          >
            {({ pressed }) => {
              return (
                <View
                  style={{ opacity: pressed ? 0.5 : 1 }}
                  className='flex-1 flex-row items-center justify-between px-4'
                >
                  <View className='flex flex-row gap-4'>
                    <View className='flex h-7 w-7 items-center justify-center'>
                      <CustomCircularFlag languageOrDialectCode={item} size={24} />
                    </View>
                    <Text className='text-base'>{i18n._(langNameMessages[item])}</Text>
                  </View>
                  {selectedLanguage === item && <Check size={20} color={colors.indigo[500]} />}
                </View>
              )
            }}
          </Pressable>
        )}
      />
    </View>
  )
}
