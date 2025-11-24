import { ActivityIndicator, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { BigCard } from '@/components/ui/big-card'
import { useTabBarHeight } from '@/hooks/use-tab-bar-height'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { Calendar, Globe, TrendingUp, Trophy } from 'lucide-react-native'
import { LeaderboardEntry } from '@yourbestaccent/api-client/orpc-contracts/leaderboard-contract'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import colors from 'tailwindcss/colors'
import { Button } from '@/components/ui/button'
import { ScrollView } from 'react-native-gesture-handler'
import {
  LanguageFilterValue,
  TimePeriodFilterValue,
  useGetLeaderboard,
} from '@/hooks/api/leaderboard/leaderboard-hooks'
import { useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => {
  const { t } = useLingui()

  const { defaultedUserData } = useGetUser()
  const nickname = defaultedUserData.nickname

  const getTrophyForPosition = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy size={20} color={colors.yellow[500]} />
      case 1:
        return <Trophy size={20} color={colors.slate[400]} />
      case 2:
        return <Trophy size={20} color={colors.amber[700]} />
      default:
        return null
    }
  }

  if (!entries || entries.length === 0) {
    return (
      <Text className='py-8 text-center text-slate-400'>{t`No entries yet. Be the first one to make it to the leaderboard!`}</Text>
    )
  }

  return (
    <View className='gap-3'>
      {entries.map((entry, index) => {
        const isCurrentUser = nickname && entry.nickname === nickname
        return (
          <View
            key={index}
            className={`flex-row items-center justify-between rounded-2xl border px-6 py-4 ${
              isCurrentUser ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-white'
            }`}
          >
            <View className='w-full flex-row items-center gap-4'>
              {index < 3 ? (
                <View className='min-w-[32px]'>{getTrophyForPosition(index)}</View>
              ) : (
                <Text className='min-w-[32px] font-medium text-slate-400'>{index + 1}</Text>
              )}
              <View className='flex-1 flex-row items-center'>
                <Text className={`font-medium ${isCurrentUser ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {entry.nickname || t`Anonymous User`}
                </Text>
              </View>
              <View className='flex-row items-center gap-2'>
                <Text className='font-semibold text-indigo-600'>{entry.xp}</Text>
                <Text className='text-slate-400'>xp</Text>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const UserPosition = ({ entries }: { entries: LeaderboardEntry[] }) => {
  const { t } = useLingui()

  const { defaultedUserData } = useGetUser()
  const nickname = defaultedUserData.nickname
  const userPosition = entries.findIndex((entry) => entry.nickname === nickname)

  if (userPosition >= 0 && userPosition < 3) {
    return null
  }

  return (
    <View className='flex-row items-center gap-4 rounded-xl border border-slate-200 bg-white p-4'>
      <View className='h-10 w-10 items-center justify-center rounded-lg bg-indigo-50'>
        {userPosition === -1 ? (
          <TrendingUp size={20} color={colors.indigo[500]} />
        ) : (
          <Trophy size={20} color={colors.indigo[500]} />
        )}
      </View>
      <View className='flex-col'>
        <Text className='text-sm font-medium text-slate-600'>{t`Your Position`}</Text>
        {userPosition === -1 ? (
          <Text className='text-sm text-slate-500'>{t`You're not on the leaderboard yet. Practice some exercises to start competing with others!`}</Text>
        ) : (
          <View className='flex-row items-baseline gap-2'>
            <Text className='text-lg font-bold text-slate-800'>#{userPosition + 1}</Text>
            <Text className='text-sm text-slate-500'>
              {t`of`} {entries.length}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function LeaderboardScreen() {
  const { t, i18n } = useLingui()

  const tabBarHeight = useTabBarHeight()
  const { defaultedUserData } = useGetUser()
  const hasNickname = !!defaultedUserData.nickname
  const openSheet = useBottomSheetStore((state) => state.open)

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilterValue>(undefined)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodFilterValue>('allTime')

  const { entries, isLoading } = useGetLeaderboard(selectedLanguage, selectedTimePeriod)

  const handleSetNickname = () => {
    openSheet(IndividualSheetName.NICKNAME_REQUIRED)
  }

  const handleOpenTimePeriodSelector = () => {
    openSheet(IndividualSheetName.LEADERBOARD_TIME_PERIOD_SELECTOR, {
      onTimePeriodSelect: handleTimePeriodSelect,
      initialTimePeriod: selectedTimePeriod,
    })
  }

  const handleOpenLanguageSelector = () => {
    openSheet(IndividualSheetName.LEADERBOARD_LANGUAGE_SELECTOR, {
      onLanguageSelect: handleLanguageSelect,
      initialLanguage: selectedLanguage,
    })
  }

  const getTimePeriodLabel = () => {
    switch (selectedTimePeriod) {
      case 'allTime':
        return t`All Time`
      case 'weekly':
        return t`This Week`
      default:
        return t`All Time`
    }
  }

  const getLanguageLabel = () => {
    if (!selectedLanguage) {
      return t`All languages`
    }
    return i18n._(langNameMessages[selectedLanguage])
  }

  const handleTimePeriodSelect = (timePeriod: TimePeriodFilterValue) => {
    setSelectedTimePeriod(timePeriod)
  }

  const handleLanguageSelect = (language: LanguageFilterValue) => {
    setSelectedLanguage(language)
  }

  return (
    <View className='flex-1'>
      <Stack.Screen
        options={{
          title: t`Leaderboard`,
        }}
      />
      <ScrollView
        className='flex-1 px-4 py-2'
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
      >
        {!hasNickname && (
          <BigCard className='mb-4 flex-col items-center justify-center gap-4 p-6'>
            <Text className='text-center text-gray-600'>
              To appear on the leaderboard and track your progress against other learners, please set a nickname first.
            </Text>
            <Button onPress={handleSetNickname} size='default' className='w-full'>
              Set a Nickname
            </Button>
          </BigCard>
        )}

        <BigCard className='flex-col items-start gap-6 p-6'>
          <View className='w-full items-center'>
            <Trophy size={32} color={colors.indigo[500]} />
          </View>
          <View className='w-full flex-col items-center gap-2'>
            <Text className='text-center text-slate-400'>{t`See how you rank against other learners`}</Text>
          </View>

          {/* Filter Section */}
          <View className='w-full'>
            <Text className='mb-3 text-sm font-medium text-slate-600'>{t`Filter Results`}</Text>
            <View className='flex-row gap-2'>
              {/* Time Period Filter */}
              <View className='flex-1'>
                <Button
                  onPress={handleOpenTimePeriodSelector}
                  variant='outline'
                  className='h-auto rounded-2xl border-slate-200 bg-white p-0 shadow-sm'
                >
                  <View className='flex-col items-center gap-2 px-4 py-3'>
                    <View className='rounded-full bg-indigo-100 p-2'>
                      <Calendar size={18} color={colors.indigo[600]} />
                    </View>
                    <View className='flex-col items-center gap-1'>
                      <Text className='text-xs font-medium text-slate-500'>Period</Text>
                      <Text className='text-sm font-semibold text-slate-800' numberOfLines={1}>
                        {getTimePeriodLabel()}
                      </Text>
                    </View>
                  </View>
                </Button>
              </View>

              {/* Language Filter */}
              <View className='flex-1'>
                <Button
                  onPress={handleOpenLanguageSelector}
                  variant='outline'
                  className='h-auto rounded-2xl border-slate-200 bg-white p-0 shadow-sm'
                >
                  <View className='flex-col items-center gap-2 px-4 py-3'>
                    <View className='rounded-full bg-indigo-100 p-2'>
                      <Globe size={18} color={colors.indigo[600]} />
                    </View>
                    <View className='flex-col items-center gap-1'>
                      <Text className='text-xs font-medium text-slate-500'>Language</Text>
                      <Text className='text-sm font-semibold text-slate-800' numberOfLines={1}>
                        {getLanguageLabel()}
                      </Text>
                    </View>
                  </View>
                </Button>
              </View>
            </View>
          </View>

          <View className='w-full gap-3'>
            {!isLoading && entries.length > 0 && hasNickname && <UserPosition entries={entries} />}

            {isLoading ? (
              <View className='items-center justify-center py-8'>
                <ActivityIndicator size='large' color={colors.indigo[600]} />
              </View>
            ) : (
              <LeaderboardTable entries={entries} />
            )}
          </View>
        </BigCard>
      </ScrollView>
    </View>
  )
}
