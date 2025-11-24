import { Button } from '@/components/ui/button'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { LangCode } from '@template-app/core/constants/lang-codes'
import { LanguageCard } from '@/components/ui/language-card'
import { SearchInput } from '@/components/ui/search-input'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft } from 'lucide-react-native'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { createMotherLanguageFilter } from '@template-app/i18n/lang-filter-utils'
import { withOpacity } from '@template-app/core/utils/tailwind-utils'
import colors from 'tailwindcss/colors'
import { usePatchMotherLanguage } from '@/hooks/api/user/user-hooks'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import { useRedirectToNextOnboardingStep } from '@/hooks/use-onboarding-navigation-cleanup'

import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { useLingui } from '@lingui/react/macro'

export default function MotherLanguageSelection() {
  const { t, i18n } = useLingui()

  const filterMotherLanguagesByInput = useMemo(() => createMotherLanguageFilter(i18n), [i18n])

  const router = useRouter()
  const storedMotherLanguage = useUserOnboardingStore((state) => state.motherLanguage)
  const [motherLanguage, setMotherLanguage] = useState<LangCode | null>(storedMotherLanguage)
  const [searchText, setSearchText] = useState('')
  const filteredLanguages = filterMotherLanguagesByInput(searchText)
  const [canGoBack, setCanGoBack] = useState(false)

  const setStoredMotherLanguage = useUserOnboardingStore((state) => state.setMotherLanguage)

  const { mutate, isPending } = usePatchMotherLanguage({
    meta: {
      showSuccessToast: false,
    },
  })
  useRedirectToNextOnboardingStep()

  useEffect(() => {
    setCanGoBack(router.canGoBack())
  }, [router])

  const handleContinue = () => {
    if (motherLanguage) {
      mutate(
        { motherLanguage },
        {
          onSuccess: () => {
            setStoredMotherLanguage(motherLanguage)
            POSTHOG_EVENTS.motherLanguageChanged(motherLanguage)
          },
        }
      )
    }
  }

  const handleSkip = () => {
    mutate(
      { motherLanguage: LangCode.ENGLISH },
      {
        onSuccess: () => {
          setStoredMotherLanguage(LangCode.ENGLISH)
          router.push(ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE)
          POSTHOG_EVENTS.motherLanguageChanged(LangCode.ENGLISH)
        },
      }
    )
  }

  const handleBack = () => {
    POSTHOG_EVENTS.click('go_back')
    router.back()
  }

  const handleLanguageSelect = (lang: LangCode) => {
    setMotherLanguage(lang)
  }

  const handleChooseEnglish = () => {
    mutate(
      { motherLanguage: LangCode.ENGLISH },
      {
        onSuccess: () => {
          setStoredMotherLanguage(LangCode.ENGLISH)
          POSTHOG_EVENTS.motherLanguageChanged(LangCode.ENGLISH)
        },
      }
    )
  }

  const shouldShowNoResults = searchText.trim() !== '' && filteredLanguages.length === 0

  const handleButtonPress = () => {
    if (shouldShowNoResults) {
      handleChooseEnglish()
    } else {
      handleContinue()
    }
  }

  const getButtonText = () => {
    if (isPending) {
      return t`Loading...`
    }
    if (shouldShowNoResults) {
      return t`Continue with English`
    }
    return t`Next`
  }

  const isButtonDisabled = !shouldShowNoResults && !motherLanguage

  return (
    <OnboardingLayout>
      {/* Header with Back and Skip buttons */}
      <View className='w-full flex-row-reverse justify-between p-4'>
        <TouchableOpacity onPress={handleSkip} disabled={isPending}>
          <Text className='mr-4 text-xl text-gray-500'>{t`Skip`}</Text>
        </TouchableOpacity>
        {canGoBack && (
          <TouchableOpacity onPress={handleBack} disabled={isPending}>
            <ArrowLeft size={24} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>
      <View className='flex-1 px-4'>
        {/* Title */}
        <View className='mb-6 px-4'>
          <Text className='mb-2 text-center text-4xl font-bold text-stone-900'>{t`What's your native language?`}</Text>
          <Text className='text-center text-lg text-gray-500'>{t`(You can always change it later)`}</Text>
        </View>

        {/* Search Input */}
        <SearchInput
          placeholder={t`Type your native language`}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={false}
        />

        {/* Language List or No Results */}
        <View style={{ flex: 1, position: 'relative' }}>
          {shouldShowNoResults ? (
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
                    <LanguageCard lang={item} handleClick={handleLanguageSelect} isSelected={motherLanguage === item} />
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
            onPress={handleButtonPress}
            disabled={isButtonDisabled || isPending}
            loading={isPending}
            className='bg-indigo-600'
            textClassName='text-2xl'
          >
            {getButtonText()}
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  )
}
