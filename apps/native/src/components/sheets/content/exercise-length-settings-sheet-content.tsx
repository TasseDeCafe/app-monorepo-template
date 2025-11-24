import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Text } from 'react-native'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { ExerciseLengthSlider } from '@/components/ui/exercise-length-slider'
import { useLingui } from '@lingui/react/macro'

interface ExerciseLengthSettingsSheetContentProps {
  initialWordCount: number
  onWordCountCommit: (newWordCount: number) => void
}

export const ExerciseLengthSettingsSheetContent = ({
  initialWordCount,
  onWordCountCommit,
}: ExerciseLengthSettingsSheetContentProps) => {
  const { t } = useLingui()

  const bottomSheetPadding = useBottomSheetPadding()

  return (
    <BottomSheetView className='gap-8 px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='text-center text-2xl font-semibold'>{t`Exercise Length`}</Text>
      <ExerciseLengthSlider initialWordCount={initialWordCount} onWordCountCommit={onWordCountCommit} />
    </BottomSheetView>
  )
}
