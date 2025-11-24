import { Pressable, Text, View } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { Check, Calendar, Clock } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { TimePeriodKey } from '@template-app/api-client/orpc-contracts/leaderboard-contract'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'

export type TimePeriodFilterValue = TimePeriodKey

export type TimePeriodSelectorSheetContentProps = {
  close: () => void
  onTimePeriodSelect?: (timePeriod: TimePeriodFilterValue) => void
  initialTimePeriod?: TimePeriodFilterValue
}

type TimePeriodOption = {
  label: string
  value: TimePeriodFilterValue
  icon: typeof Calendar
}

export const LeaderboardTimePeriodSelectorSheetContent = ({
  close,
  onTimePeriodSelect,
  initialTimePeriod = 'allTime',
}: TimePeriodSelectorSheetContentProps) => {
  const { t } = useLingui()

  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodFilterValue>(initialTimePeriod)

  const bottomSheetPadding = useBottomSheetPadding()

  const timePeriodOptions: TimePeriodOption[] = [
    {
      label: t`All Time`,
      value: 'allTime',
      icon: Calendar,
    },
    {
      label: t`This Week`,
      value: 'weekly',
      icon: Clock,
    },
  ]

  const handleTimePeriodSelect = (timePeriod: TimePeriodFilterValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
    setSelectedTimePeriod(timePeriod)

    if (onTimePeriodSelect) {
      onTimePeriodSelect(timePeriod)
    }
    close()
  }

  return (
    <BottomSheetView className='gap-6 px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='text-center text-2xl font-semibold'>{t`Select Time Period`}</Text>
      <Text className='text-center text-gray-500'>{t`Choose the time period for the leaderboard rankings`}</Text>
      <View className='gap-0'>
        {timePeriodOptions.map((item) => {
          const IconComponent = item.icon
          return (
            <Pressable
              key={item.value}
              onPress={() => handleTimePeriodSelect(item.value)}
              className='flex-row items-center justify-between border-b border-gray-100 py-4'
              android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            >
              {({ pressed }) => (
                <View
                  style={{ opacity: pressed ? 0.5 : 1 }}
                  className='flex-1 flex-row items-center justify-between px-4'
                >
                  <View className='flex flex-row items-center gap-4'>
                    <View className='flex h-7 w-7 items-center justify-center'>
                      <IconComponent size={20} color={colors.gray[500]} />
                    </View>
                    <Text className='text-base'>{item.label}</Text>
                  </View>
                  {selectedTimePeriod === item.value && <Check size={20} color='#4f46e5' />}
                </View>
              )}
            </Pressable>
          )
        })}
      </View>
    </BottomSheetView>
  )
}
