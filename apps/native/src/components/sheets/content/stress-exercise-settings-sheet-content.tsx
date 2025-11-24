import { useCallback } from 'react'
import { Text } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import cloneDeep from 'lodash.clonedeep'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { CefrLevelSelector } from '@/components/ui/cefr-level-selector'
import { Button } from '@/components/ui/button'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useFrequencySliderPosition, useUpdateSettings } from '@/hooks/api/user-settings/user-settings-hooks'
import { useLingui } from '@lingui/react/macro'

interface StressExerciseSettingsSheetContentProps {
  close: () => void
}

export const StressExerciseSettingsSheetContent = ({ close }: StressExerciseSettingsSheetContentProps) => {
  const { t } = useLingui()
  const { defaultedUserData } = useGetUser()
  const studyLanguage = defaultedUserData.studyLanguage
  const position = useFrequencySliderPosition(studyLanguage)
  const { mutate } = useUpdateSettings(studyLanguage)

  const handlePositionChange = useCallback(
    (newPosition: number) => {
      if (defaultedUserData.settings) {
        const updatedSettings = cloneDeep(defaultedUserData.settings)
        updatedSettings.preferences.exercises.frequencyList.position.byLanguage.forEach((lang) => {
          if (lang.language === studyLanguage) {
            lang.position = newPosition
          }
        })

        mutate(updatedSettings)
      }
    },
    [defaultedUserData.settings, mutate, studyLanguage]
  )

  const bottomSheetPadding = useBottomSheetPadding()

  return (
    <BottomSheetView className='px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='mb-2 text-center text-2xl font-semibold'>{t`Exercise Settings`}</Text>
      <Text className='mb-6 text-center text-gray-500'>{t`Adjust the difficulty level of your exercises`}</Text>

      <CefrLevelSelector initialPosition={position} onPositionCommit={handlePositionChange} />

      <Button variant='outline' onPress={close} className='mt-6'>
        {t`Done`}
      </Button>
    </BottomSheetView>
  )
}
