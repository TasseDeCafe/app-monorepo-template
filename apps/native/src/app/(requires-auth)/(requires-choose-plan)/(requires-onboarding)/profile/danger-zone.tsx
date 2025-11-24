import { Text, View } from 'react-native'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { BigCard } from '@/components/ui/big-card'
import { SettingsItem } from '@/components/ui/settings-item'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import { useLingui } from '@lingui/react/macro'

export default function DangerZoneScreen() {
  const { t } = useLingui()

  const { defaultedUserData } = useGetUser()
  const hasVoice = defaultedUserData.hasVoice

  const openSheet = useBottomSheetStore((state) => state.open)

  return (
    <View className='flex-1 bg-red-50'>
      <View className='mt-8 px-4'>
        {/* Warning text section */}
        <View className='mb-6 px-2'>
          <Text className='mb-2 text-lg font-medium text-red-800'>{t`Warning`}</Text>
          <Text className='text-red-600'>{t`Actions in this section can lead to permanent data loss.`}</Text>
        </View>

        {/* Danger Zone options */}
        <BigCard>
          <SettingsItem
            title={t`Delete my account`}
            value=''
            onPress={() => {
              openSheet(IndividualSheetName.DELETE_ACCOUNT)
            }}
            variant='destructive'
          />

          {hasVoice && (
            <SettingsItem
              title={t`Delete my voice`}
              value=''
              onPress={() => {
                openSheet(IndividualSheetName.DELETE_VOICE)
              }}
              variant='destructive'
            />
          )}
        </BigCard>
      </View>
    </View>
  )
}
