import { useCallback } from 'react'
import { Text } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/button'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { useLingui } from '@lingui/react/macro'

interface VoiceRemovedSuccessSheetContentProps {
  close: () => void
}

export const VoiceRemovedSuccessSheetContent = ({ close }: VoiceRemovedSuccessSheetContentProps) => {
  const { t } = useLingui()
  const router = useRouter()

  const handleClose = useCallback(() => {
    close()
    if (router.canGoBack()) {
      router.back()
    }
  }, [close, router])

  const bottomSheetPadding = useBottomSheetPadding()

  return (
    <BottomSheetView className='px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='mb-2 text-center text-xl font-semibold'>{t`Voice removed`}</Text>
      <Text className='mb-4 text-center text-gray-500'>
        {t`You have successfully removed your voice. You have to recreate your voice if you want to keep using the app.`}
      </Text>

      <Button onPress={handleClose} variant='default'>
        {t`Got it`}
      </Button>
    </BottomSheetView>
  )
}
