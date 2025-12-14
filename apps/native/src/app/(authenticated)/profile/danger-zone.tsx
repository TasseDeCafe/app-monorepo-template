import { Text, View } from 'react-native'
import { BigCard } from '@/components/ui/big-card'
import { useBottomSheetStore } from '@/features/sheets/stores/bottom-sheet-store'
import { SheetId } from '@/features/sheets/components/bottom-sheet-ids'
import { useLingui } from '@lingui/react/macro'
import { SettingsItem } from '@/components/ui/settings-item'

export default function DangerZoneScreen() {
  const { t } = useLingui()
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
              openSheet(SheetId.DELETE_ACCOUNT)
            }}
            variant='destructive'
          />
        </BigCard>
      </View>
    </View>
  )
}
