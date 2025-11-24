import { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { useCheckNicknameAvailability, usePatchNickname } from '@/hooks/api/user/user-hooks'
import { Button } from '@/components/ui/button'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { useLingui } from '@lingui/react/macro'

interface NicknameSheetContentProps {
  close: () => void
  currentNickname: string
}

export const NicknameSheetContent = ({ close, currentNickname }: NicknameSheetContentProps) => {
  const { t } = useLingui()

  const [nickname, setNickname] = useState(currentNickname)

  const { mutate: patchNickname, isPending: isSubmitting } = usePatchNickname()
  const {
    data: availabilityData,
    isLoading: isChecking,
    refetch: checkAvailability,
  } = useCheckNicknameAvailability(nickname, currentNickname)

  // Debounced check for nickname availability
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nickname && nickname !== currentNickname) {
        checkAvailability().then(() => {})
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [nickname, currentNickname, checkAvailability])

  const handleSaveNickname = useCallback(() => {
    if (nickname === currentNickname) {
      close()
      return
    }

    if (availabilityData?.isAvailable) {
      patchNickname(
        {
          nickname,
        },
        {
          onSuccess: () => {
            close()
          },
        }
      )
    }
  }, [nickname, currentNickname, availabilityData?.isAvailable, patchNickname, close])

  const handleCancel = useCallback(() => {
    close()
  }, [close])

  const isButtonEnabled = useMemo(
    () =>
      !!nickname && (nickname === currentNickname || (availabilityData?.isAvailable && !isChecking)) && !isSubmitting,
    [nickname, currentNickname, availabilityData?.isAvailable, isChecking, isSubmitting]
  )

  const bottomSheetPadding = useBottomSheetPadding()

  return (
    <BottomSheetView className='px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <Text className='mb-2 text-center text-2xl font-semibold'>{t`Choose your nickname`}</Text>
      <Text className='mb-6 text-center text-gray-500'>{t`This nickname will be public. You can always change it later.`}</Text>
      <Text className='mb-3 text-gray-500'>{t`Public nickname`}</Text>
      <BottomSheetTextInput
        defaultValue={nickname}
        onChangeText={setNickname}
        placeholder={t`Type your nickname`}
        className='mb-6 h-16 w-full rounded-lg border border-gray-300 px-4 py-3'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <View className='mb-6 min-h-[20px]'>
        {nickname && nickname !== currentNickname && (
          <>
            {isChecking ? (
              <Text className='text-sm text-gray-500'>Checking availability...</Text>
            ) : availabilityData ? (
              <Text className={availabilityData.isAvailable ? 'text-sm text-green-500' : 'text-sm text-red-500'}>
                {availabilityData.message}
              </Text>
            ) : null}
          </>
        )}
      </View>
      <Button
        onPress={handleSaveNickname}
        className='mb-3'
        variant={isButtonEnabled ? 'default' : 'inactive'}
        disabled={!isButtonEnabled}
        loading={isSubmitting}
      >
        {isSubmitting ? t`Saving...` : t`Join Leaderboard`}
      </Button>
      <Button variant='outline' onPress={handleCancel} disabled={isSubmitting}>
        {t`Cancel`}
      </Button>
    </BottomSheetView>
  )
}
