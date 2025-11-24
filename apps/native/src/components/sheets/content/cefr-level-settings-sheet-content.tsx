import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Text } from 'react-native'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { CefrLevelSelector } from '@/components/ui/cefr-level-selector'
import { useLingui } from '@lingui/react/macro'

interface CefrLevelSettingsSheetContentProps {
  initialPosition: number
  onPositionCommit: (newPosition: number) => void
}

export const CefrLevelSettingsSheetContent = ({
  initialPosition,
  onPositionCommit,
}: CefrLevelSettingsSheetContentProps) => {
  const { t } = useLingui()

  const bottomSheetPadding = useBottomSheetPadding()

  return (
    <BottomSheetView className='gap-8 px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='text-center text-2xl font-semibold'>{t`CEFR Level`}</Text>
      <CefrLevelSelector initialPosition={initialPosition} onPositionCommit={onPositionCommit} />
    </BottomSheetView>
  )
}
