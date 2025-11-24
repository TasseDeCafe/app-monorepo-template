import { useCallback, useEffect } from 'react'
import { Text } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useDeleteVoice } from '@/hooks/api/removals/removals-hooks'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import { Button } from '@/components/ui/button'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { useLingui } from '@lingui/react/macro'

interface DeleteVoiceSheetContentProps {
  close: () => void
}

export const DeleteVoiceSheetContent = ({ close }: DeleteVoiceSheetContentProps) => {
  const { t } = useLingui()

  const openSheet = useBottomSheetStore((state) => state.open)

  const deleteVoiceMutation = useDeleteVoice()

  useEffect(() => {
    if (deleteVoiceMutation.isSuccess) {
      close()
      openSheet(IndividualSheetName.VOICE_REMOVED_SUCCESS)
    }
  }, [deleteVoiceMutation.isSuccess, close, openSheet])

  const handleDeleteVoice = useCallback(() => {
    deleteVoiceMutation.mutate({ type: 'voice' })
  }, [deleteVoiceMutation])

  const handleCancel = useCallback(() => {
    close()
  }, [close])

  const bottomSheetPadding = useBottomSheetPadding()

  return (
    <BottomSheetView className='px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='mb-2 text-center text-2xl font-semibold'>{t`Are you absolutely sure?`}</Text>
      <Text className='mb-6 text-center text-gray-500'>
        {t`This action cannot be undone. This will permanently delete your voice from our servers.`}
      </Text>
      <Button
        onPress={handleDeleteVoice}
        className='mb-3'
        variant='destructive'
        loading={deleteVoiceMutation.isPending}
        disabled={deleteVoiceMutation.isPending}
      >
        {deleteVoiceMutation.isPending ? t`Sending...` : 'Confirm deletion'}
      </Button>
      <Button variant='outline' onPress={handleCancel} disabled={deleteVoiceMutation.isPending}>
        Cancel
      </Button>
    </BottomSheetView>
  )
}
