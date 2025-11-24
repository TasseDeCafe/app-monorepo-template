import { useCallback } from 'react'
import { Text } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { SpeedPicker } from '@/components/ui/speed-picker/speed-picker'
import type { AudioSpeedType } from '@template-app/api-client/orpc-contracts/user-settings-contract'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { useUpdateAudioSpeedMutation } from '@/hooks/api/user-settings/user-settings-hooks'
import { useLingui } from '@lingui/react/macro'

interface SpeedPickerSheetContentProps {
  currentSpeed: number
  onSpeedChange: (speed: string) => void
  audioSpeedType?: AudioSpeedType
}

export const SpeedPickerSheetContent = ({
  currentSpeed,
  onSpeedChange,
  audioSpeedType,
}: SpeedPickerSheetContentProps) => {
  const { t } = useLingui()
  const updateAudioSpeedMutation = useUpdateAudioSpeedMutation()
  const bottomSheetPadding = useBottomSheetPadding()

  const saveSpeedToBackend = useCallback(
    (speed: number) => {
      if (audioSpeedType) {
        updateAudioSpeedMutation.mutate({
          newSpeed: speed,
          audioSpeedType,
        })
      }
    },
    [audioSpeedType, updateAudioSpeedMutation]
  )

  const handleSpeedChange = useCallback(
    (rateString: string) => {
      const newSpeed = parseFloat(rateString)
      if (Number.isNaN(newSpeed)) return
      onSpeedChange(rateString)
      saveSpeedToBackend(newSpeed)
    },
    [onSpeedChange, saveSpeedToBackend]
  )

  return (
    <BottomSheetView className='items-center px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='mb-4 text-lg font-semibold text-gray-800'>{t`Playback Speed`}</Text>
      <SpeedPicker value={currentSpeed} onValueChange={handleSpeedChange} minValue={0.75} maxValue={1.25} />
    </BottomSheetView>
  )
}
