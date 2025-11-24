import { Button } from '@/components/ui/button'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'

import { LanguageCard } from '@/components/ui/language-card'
import { SearchInput } from '@/components/ui/search-input'
import { LinearGradient } from 'expo-linear-gradient'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { createStudyLanguageFilter } from '@yourbestaccent/i18n/lang-filter-utils'
import { withOpacity } from '@yourbestaccent/core/utils/tailwind-utils'
import colors from 'tailwindcss/colors'
import { usePatchStudyLanguage } from '@/hooks/api/user/user-hooks'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import { ArrowLeft } from 'lucide-react-native'
import {
  useOnboardingNavigationCleanup,
  useRedirectToNextOnboardingStep,
} from '@/hooks/use-onboarding-navigation-cleanup'
import { useLingui } from '@lingui/react/macro'

export default function StudyLanguageSelection() {
  const { t, i18n } = useLingui()

  const filterStudyLanguagesByInput = useMemo(() => createStudyLanguageFilter(i18n), [i18n])

  const router = useRouter()
  const storedStudyLanguage = useUserOnboardingStore((state) => state.studyLanguage)
  const [studyLanguage, setStudyLanguage] = useState<SupportedStudyLanguage | null>(storedStudyLanguage)
  const [searchText, setSearchText] = useState('')
  const [canGoBack, setCanGoBack] = useState(false)

  const setStoredStudyLanguage = useUserOnboardingStore((state) => state.setStudyLanguage)
  const setStoredMotherLanguage = useUserOnboardingStore((state) => state.setMotherLanguage)

  const filteredLanguages = filterStudyLanguagesByInput(searchText)

  useRedirectToNextOnboardingStep()

  useOnboardingNavigationCleanup(() => {
    setStoredMotherLanguage(null)
  }, [setStoredMotherLanguage])

  useEffect(() => {
    setCanGoBack(router.canGoBack())
  }, [router])

  const { mutate: patchStudyLanguage, isPending } = usePatchStudyLanguage({
    meta: {
      showSuccessToast: false,
    },
  })

  const handleComplete = () => {
    if (studyLanguage) {
      patchStudyLanguage(
        { studyLanguage },
        {
          onSuccess: () => {
            setStoredStudyLanguage(studyLanguage)
          },
        }
      )
    }
  }

  const handleLanguageSelect = (lang: SupportedStudyLanguage) => {
    if (studyLanguage === lang) {
      setStudyLanguage(null)
    } else {
      setStudyLanguage(lang)
    }
  }

  const showNoResults = searchText.trim() !== '' && filteredLanguages.length === 0

  const handleBack = () => {
    router.back()
  }

  return (
    <OnboardingLayout>
      {/* Header with Back button */}
      <View className='flex-row justify-between p-4'>
        {canGoBack && (
          <TouchableOpacity onPress={handleBack} disabled={isPending}>
            <ArrowLeft size={24} color='#6B7280' />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
      </View>
      <View className='flex-1 px-4'>
        {/* Title */}
        <View className='mb-6 px-4'>
          <Text className='mb-2 text-center text-4xl font-bold text-stone-900'>
            {t`Which language do you want to study?`}
          </Text>
          <Text className='text-center text-lg text-gray-500'>{t`(You can always change it later)`}</Text>
        </View>

        {/* Search Input */}
        <SearchInput
          placeholder={t`Type a language`}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={false}
        />

        {/* Language List or No Results */}
        <View style={{ flex: 1, position: 'relative' }}>
          {showNoResults ? (
            <View className='flex-1 items-center justify-center px-4'>
              <Text className='text-center text-lg text-gray-500'>{t`No languages found matching your search`}</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={filteredLanguages}
                numColumns={2}
                keyExtractor={(item) => item}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View className='w-[48%]'>
                    <LanguageCard
                      lang={item}
                      handleClick={() => handleLanguageSelect(item)}
                      isSelected={studyLanguage === item}
                    />
                  </View>
                )}
              />

              {/* Fade effect overlay */}
              <LinearGradient
                colors={[withOpacity(colors.indigo[50], 0), colors.white]}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  pointerEvents: 'none',
                }}
              />
            </>
          )}
        </View>

        {/* Bottom Navigation */}
        <View className='py-4'>
          <Button
            variant='default'
            size='lg'
            onPress={handleComplete}
            disabled={!studyLanguage || isPending}
            loading={isPending}
            className='bg-indigo-600'
            textClassName='text-2xl'
          >
            {isPending ? t`Loading...` : t`Next`}
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  )
}
