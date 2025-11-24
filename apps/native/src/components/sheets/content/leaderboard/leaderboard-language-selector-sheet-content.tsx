import { LangCode, SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import { useState } from 'react'
import { ListRenderItemInfo, Pressable, Text, View } from 'react-native'
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { Check, Globe, Search } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { CustomCircularFlag } from '@/components/ui/custom-circular-flag'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

export type LeaderboardLanguageFilterValue = LangCode | undefined

export type LeaderboardLanguageSelectorSheetContentProps = {
  close: () => void
  onLanguageSelect?: (language: LeaderboardLanguageFilterValue) => void
  initialLanguage?: LeaderboardLanguageFilterValue
}

type LanguageOption = {
  label: string
  value: LeaderboardLanguageFilterValue
}

export const LeaderboardLanguageSelectorSheetContent = ({
  close,
  onLanguageSelect,
  initialLanguage,
}: LeaderboardLanguageSelectorSheetContentProps) => {
  const { t, i18n } = useLingui()

  const [selectedLanguage, setSelectedLanguage] = useState<LeaderboardLanguageFilterValue>(initialLanguage)
  const [searchQuery, setSearchQuery] = useState('')

  const bottomSheetPadding = useBottomSheetPadding()

  const languageOptions: LanguageOption[] = [
    {
      label: t`All languages`,
      value: undefined,
    },
    ...SUPPORTED_STUDY_LANGUAGES.map((langCode) => ({
      label: i18n._(langNameMessages[langCode]),
      value: langCode,
    })),
  ]

  const filteredLanguageOptions = languageOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLanguageSelect = (language: LeaderboardLanguageFilterValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
    setSelectedLanguage(language)

    if (onLanguageSelect) {
      onLanguageSelect(language)
    }
    close()
  }

  return (
    <View className='flex-1 px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='mb-2 text-center text-2xl font-semibold'>{t`Select Language`}</Text>
      <Text className='mb-2 text-center text-gray-500'>{t`Filter leaderboard by specific language or show all languages`}</Text>
      <View className='flex flex-row items-center rounded-xl border border-gray-200 px-4'>
        <Search size={20} color={colors.gray[500]} />
        <BottomSheetTextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t`Search language...`}
          className='h-14 w-full border-gray-300 px-4 py-3'
          placeholderTextColor={colors.gray[500]}
          returnKeyType='done'
        />
      </View>
      <BottomSheetFlatList
        data={filteredLanguageOptions}
        keyExtractor={(item: LanguageOption) => item.value || 'all'}
        className='flex-1'
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }: ListRenderItemInfo<LanguageOption>) => (
          <Pressable
            onPress={() => handleLanguageSelect(item.value)}
            className='flex-row items-center justify-between border-b border-gray-100 py-4'
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
          >
            {({ pressed }) => {
              return (
                <View
                  style={{ opacity: pressed ? 0.5 : 1 }}
                  className='flex-1 flex-row items-center justify-between px-4'
                >
                  <View className='flex flex-row items-center gap-4'>
                    <View className='flex h-7 w-7 items-center justify-center'>
                      {item.value ? (
                        <CustomCircularFlag languageOrDialectCode={item.value} size={24} />
                      ) : (
                        <Globe size={24} color={colors.slate[600]} />
                      )}
                    </View>
                    <Text className='text-base'>{item.label}</Text>
                  </View>
                  {selectedLanguage === item.value && <Check size={20} color={colors.indigo[500]} />}
                </View>
              )
            }}
          </Pressable>
        )}
      />
    </View>
  )
}
