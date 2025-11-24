import { Text, TouchableOpacity, View } from 'react-native'
import { BigCard } from '@/components/ui/big-card'
import {
  useGetUser,
  usePatchDailyStudyMinutes,
  usePatchMotherLanguage,
  usePatchStudyLanguageAndDialect,
  usePatchTopics,
} from '@/hooks/api/user/user-hooks'
import { getCurrentLevel } from '@template-app/core/utils/cefr-level-selector-utils'
import { SettingsItem } from '@/components/ui/settings-item'
import { ToggleSettingsItem } from '@/app/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/(drawer)/(tabs)/profile'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import {
  DEFAULT_DIALECTS,
  DialectCode,
  LangCode,
  LANGUAGES_TO_DIALECT_MAP,
  SupportedStudyLanguage,
} from '@template-app/core/constants/lang-codes'
import * as Haptics from 'expo-haptics'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import React, { useState } from 'react'
import { toast } from 'sonner-native'
import cloneDeep from 'lodash.clonedeep'
import { CircleHelp } from 'lucide-react-native'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import colors from 'tailwindcss/colors'
import { Topic } from '@template-app/core/constants/topics'
import { topicMessages } from '@template-app/i18n/topic-translation-utils'
import { CustomCircularFlag } from '@/components/ui/custom-circular-flag'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import {
  useFrequencySliderPosition,
  useFrequencyWordLength,
  useUpdateSettings,
} from '@/hooks/api/user-settings/user-settings-hooks'
import { usePreferencesStore } from '@/stores/preferences-store'
import { isLanguageWithTransliteration } from '@template-app/core/utils/lang-codes-utils'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages, dialectNameMessages } from '@template-app/i18n/lang-code-translation-utils'

export default function SettingsScreen() {
  const { t, i18n } = useLingui()

  const openSheet = useBottomSheetStore((state) => state.open)
  const { defaultedUserData: user } = useGetUser()
  const { defaultedUserData } = useGetUser()
  const studyLanguage = defaultedUserData.studyLanguage
  const studyDialect = defaultedUserData.studyDialect
  const position = useFrequencySliderPosition(studyLanguage)
  const currentLevel = getCurrentLevel(position)
  const [selectedStudyLanguage, setSelectedStudyLanguage] = useState<SupportedStudyLanguage>(user.studyLanguage)
  const [selectedMotherLanguage, setSelectedMotherLanguage] = useState<LangCode>(user.motherLanguage)
  const { mutate: updateStudyLangAndDialect } = usePatchStudyLanguageAndDialect()
  const { mutate: updateMotherLanguage } = usePatchMotherLanguage()
  const { mutate: updateUserSettings } = useUpdateSettings(studyLanguage)
  const { mutate: updateTopics } = usePatchTopics({ meta: { showSuccessToast: false } })
  const { mutate: updateDailyStudyMinutes } = usePatchDailyStudyMinutes()
  const frequencyExerciseWordLength = useFrequencyWordLength(studyLanguage)
  const frequencyWordLength = useFrequencyWordLength(studyLanguage)
  const currentTopic = user.topics?.[0] ?? null
  const dailyStudyMinutes = defaultedUserData.dailyStudyMinutes

  const shouldShowIpa = usePreferencesStore((state) => state.shouldShowIpa)
  const shouldShowTransliteration = usePreferencesStore((state) => state.shouldShowTransliteration)
  const setShouldShowIpa = usePreferencesStore((state) => state.setShouldShowIpa)
  const setShouldShowTransliteration = usePreferencesStore((state) => state.setShouldShowTransliteration)

  const handleMotherLanguageClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})

    openSheet(IndividualSheetName.MOTHER_LANGUAGE_SETTINGS_SELECTOR, {
      onLanguageSelect: (language: LangCode) => {
        setSelectedMotherLanguage(language)
        updateMotherLanguage({
          motherLanguage: language,
        })
        POSTHOG_EVENTS.motherLanguageChanged(language)
      },
      initialLanguage: selectedMotherLanguage,
    })
  }

  const handleStudyLanguageClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})

    openSheet(IndividualSheetName.STUDY_LANGUAGE_SETTINGS_SELECTOR, {
      onLanguageSelect: (studyLanguage: SupportedStudyLanguage) => {
        setSelectedStudyLanguage(studyLanguage)
        const newDialect = DEFAULT_DIALECTS[studyLanguage]
        updateStudyLangAndDialect({
          studyLanguage: studyLanguage,
          studyDialect: newDialect,
        })
        POSTHOG_EVENTS.studyLanguageChanged(studyLanguage)
      },
      initialLanguage: selectedStudyLanguage,
    })
  }

  const handleDialectClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})

    const dialects: DialectCode[] = LANGUAGES_TO_DIALECT_MAP[studyLanguage]
    if (dialects.length === 1) {
      const languageName = i18n._(langNameMessages[studyLanguage])
      toast.success(t`${languageName} has only one supported dialect`)
    } else {
      openSheet(IndividualSheetName.DIALECT_SETTINGS_SELECTOR, {
        onDialectSelect: (dialect: DialectCode) => {
          updateStudyLangAndDialect({
            studyLanguage: selectedStudyLanguage,
            studyDialect: dialect,
          })
          POSTHOG_EVENTS.studyDialectChanged(dialect)
        },
        initialDialect: defaultedUserData.studyDialect,
        studyLanguage: selectedStudyLanguage,
      })
    }
  }

  const handleDailyStudyTimeClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})

    openSheet(IndividualSheetName.DAILY_STUDY_TIME_SETTINGS, {
      initialMinutes: dailyStudyMinutes,
      onMinutesChange: (minutes: number) => {
        updateDailyStudyMinutes({
          dailyStudyMinutes: minutes,
        })
        POSTHOG_EVENTS.click('daily_study_time_changed')
      },
    })
  }

  return (
    <View className='mt-2 px-4'>
      <BigCard className='mb-1'>
        <SettingsItem
          title={t`Native language`}
          value={
            <View className='flex-row items-center gap-2'>
              <CustomCircularFlag languageOrDialectCode={defaultedUserData.motherLanguage} size={20} />
              <Text className='text-lg text-gray-500'>
                {i18n._(langNameMessages[defaultedUserData.motherLanguage])}
              </Text>
            </View>
          }
          onPress={() => {
            handleMotherLanguageClick()
          }}
        />
        <SettingsItem
          title={t`Study language`}
          value={
            <View className='flex-row items-center gap-2'>
              <CustomCircularFlag languageOrDialectCode={defaultedUserData.studyLanguage} size={20} />
              <Text className='text-lg text-gray-500'>{i18n._(langNameMessages[defaultedUserData.studyLanguage])}</Text>
            </View>
          }
          onPress={() => {
            handleStudyLanguageClick()
          }}
        />
        <SettingsItem
          title='Dialect'
          value={
            <View className='flex-row items-center gap-2'>
              <CustomCircularFlag languageOrDialectCode={studyDialect} size={20} />
              <Text className='text-lg text-gray-500'>{i18n._(dialectNameMessages[studyDialect])}</Text>
            </View>
          }
          onPress={() => handleDialectClick()}
        />
        <SettingsItem
          title={
            <View className='flex-row items-center gap-3'>
              <Text className='text-lg font-medium'>{t`CEFR level`}</Text>
              <Popover>
                <PopoverTrigger asChild>
                  <TouchableOpacity className='text-gray-400' onLongPress={() => {}}>
                    <CircleHelp color={colors.gray[400]} height={16} width={16} />
                  </TouchableOpacity>
                </PopoverTrigger>
                <PopoverContent side='bottom' avoidCollisions={true} className='rounded-lg p-4'>
                  <Text className='text-sm text-slate-600'>{t`CEFR Level is used in the level exercise. Changing it will change the difficulty of the generated sentence.`}</Text>
                  <Text className='text-base font-semibold text-gray-800'>{t`What is CEFR?`}</Text>
                  <Text className='text-sm text-gray-600'>{t`The Common European Framework of Reference (CEFR) defines language proficiency across six levels: A1 and A2 (Basic User), B1 and B2 (Independent User), C1 and C2 (Proficient User). Each level represents increasing language ability, from beginner to near-native fluency. These standardized levels help learners, teachers, and employers understand and compare language skills internationally.`}</Text>
                  <Text className='text-base font-semibold text-gray-800'>{t`Word Frequency`}</Text>
                  <Text className='text-sm text-gray-600'>{t`We will generate sentences with words at around this position in the frequency list. A frequency list shows which words are used most often in a language. The lower the position of the word in a frequency list the more often it appears in the language. Words at a higher position are less frequent which very often means they are more difficult to learn.`}</Text>
                </PopoverContent>
              </Popover>
            </View>
          }
          value={currentLevel.name}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
            openSheet(IndividualSheetName.CEFR_LEVEL_SETTINGS, {
              initialPosition: position,
              onPositionCommit: (newPosition: number) => {
                const newSettings = cloneDeep(user.settings)
                newSettings.preferences.exercises.frequencyList.position.byLanguage.forEach((lang: any) => {
                  if (lang.language === studyLanguage) {
                    lang.position = newPosition
                  }
                })
                updateUserSettings(newSettings)
              },
            })
          }}
        />
        <SettingsItem
          title={
            <View className='flex-row items-center gap-3'>
              <Text className='text-lg font-medium'>{t`Exercise length`}</Text>
              <Popover>
                <PopoverTrigger asChild>
                  <TouchableOpacity className='text-gray-400' onLongPress={() => {}}>
                    <CircleHelp color={colors.gray[400]} height={16} width={16} />
                  </TouchableOpacity>
                </PopoverTrigger>
                <PopoverContent side='bottom' avoidCollisions={true} className='rounded-lg p-4'>
                  <Text className='text-center text-sm text-slate-600'>{t`Exercise length is used in the level exercise. It determines how many words will be included in your practice sessions.`}</Text>
                </PopoverContent>
              </Popover>
            </View>
          }
          value={frequencyWordLength}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
            openSheet(IndividualSheetName.EXERCISE_LENGTH_SETTINGS, {
              initialWordCount: frequencyExerciseWordLength,
              onWordCountCommit: (newWordCount: number) => {
                const newSettings = cloneDeep(user.settings)
                newSettings.preferences.exercises.frequencyList.exerciseLength.byLanguage.forEach((lang: any) => {
                  if (lang.language === studyLanguage) {
                    lang.length = newWordCount
                  }
                })
                updateUserSettings(newSettings)
              },
            })
          }}
        />
        <SettingsItem
          title={
            <View className='flex-row items-center gap-3'>
              <Text className='text-lg font-medium'>Topic</Text>
              <Popover>
                <PopoverTrigger asChild>
                  <TouchableOpacity className='text-gray-400' onLongPress={() => {}}>
                    <CircleHelp color={colors.gray[400]} height={16} width={16} />
                  </TouchableOpacity>
                </PopoverTrigger>
                <PopoverContent side='bottom' avoidCollisions={true} className='rounded-lg p-4'>
                  <Text className='text-center text-sm text-slate-600'>{t`Topic is used in the level exercise. It helps generate sentences focused on specific vocabulary and contexts.`}</Text>
                </PopoverContent>
              </Popover>
            </View>
          }
          value={currentTopic ? i18n._(topicMessages[currentTopic]) : t`No Topic`}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
            openSheet(IndividualSheetName.FREQUENCY_LIST_TOPIC_SELECTOR, {
              currentTopic,
              onTopicSelect: (newTopic: Topic | null) => {
                updateTopics({ topics: newTopic ? [newTopic] : [] })
              },
            })
          }}
        />
        <SettingsItem
          title={
            <View className='flex-row items-center gap-3'>
              <Text className='text-lg font-medium'>{t`Daily Study Time`}</Text>
              <Popover>
                <PopoverTrigger asChild>
                  <TouchableOpacity className='text-gray-400' onLongPress={() => {}}>
                    <CircleHelp color={colors.gray[400]} height={16} width={16} />
                  </TouchableOpacity>
                </PopoverTrigger>
                <PopoverContent side='bottom' avoidCollisions={true} className='rounded-lg p-4'>
                  <Text className='text-center text-sm text-slate-600'>{t`This time will be used to create daily workouts for you`}</Text>
                </PopoverContent>
              </Popover>
            </View>
          }
          value={`${dailyStudyMinutes} min`}
          onPress={() => {
            handleDailyStudyTimeClick()
          }}
        />
        <ToggleSettingsItem
          title={t`Show IPA`}
          value={shouldShowIpa}
          onValueChange={(newValue) => {
            setShouldShowIpa(newValue)
            POSTHOG_EVENTS.click('toggle_ipa_preference')
          }}
        />
        {isLanguageWithTransliteration(studyLanguage) && (
          <ToggleSettingsItem
            title={t`Show Transliteration`}
            value={shouldShowTransliteration}
            onValueChange={(newValue) => {
              setShouldShowTransliteration(newValue)
              POSTHOG_EVENTS.click('toggle_transliteration_preference')
            }}
          />
        )}
      </BigCard>
    </View>
  )
}
