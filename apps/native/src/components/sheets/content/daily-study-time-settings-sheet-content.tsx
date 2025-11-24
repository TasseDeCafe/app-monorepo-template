import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Text } from 'react-native'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { DailyStudyMinutesSelector } from '@/components/ui/daily-study-minutes-selector'
import { useLingui } from '@lingui/react/macro'

interface DailyStudyTimeSettingsSheetContentProps {
  initialMinutes: number | null
  onMinutesChange: (minutes: number) => void
}

export const DailyStudyTimeSettingsSheetContent = ({
  initialMinutes,
  onMinutesChange,
}: DailyStudyTimeSettingsSheetContentProps) => {
  const { t } = useLingui()

  const bottomSheetPadding = useBottomSheetPadding()

  const handleMinutesChange = (minutes: number) => {
    onMinutesChange(minutes)
    // Don't auto-close like other sheets since this is a continuous adjustment
  }

  return (
    <BottomSheetView className='gap-6 px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='text-center text-2xl font-semibold'>{t`Daily Study Time`}</Text>
      <DailyStudyMinutesSelector initialMinutes={initialMinutes} onMinutesChange={handleMinutesChange} />
    </BottomSheetView>
  )
}
