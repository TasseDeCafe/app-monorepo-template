import { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { useCheckNicknameAvailability, useGetUser, usePatchNickname } from '@/hooks/api/user/user-hooks'
import { Button } from '@/components/ui/button'
import { useLingui } from '@lingui/react/macro'

interface EditNicknameSheetContentProps {
  close: () => void
}

export const EditNicknameSheetContent = ({ close }: EditNicknameSheetContentProps) => {
  const { t } = useLingui()
  const { defaultedUserData } = useGetUser()
  const currentNickname = defaultedUserData.nickname || ''
  const [nickname, setNickname] = useState(currentNickname)

  const { mutate: patchNickname, isPending: isSubmitting } = usePatchNickname()
  const {
    data: availabilityData,
    isLoading: isChecking,
    refetch: checkAvailability,
  } = useCheckNicknameAvailability(nickname, currentNickname)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nickname && nickname !== currentNickname) {
        checkAvailability()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [nickname, currentNickname, checkAvailability])

  const isButtonEnabled = useMemo(() => {
    return (
      !!nickname && (nickname === currentNickname || (availabilityData?.isAvailable && !isChecking)) && !isSubmitting
    )
  }, [nickname, currentNickname, availabilityData, isChecking, isSubmitting])

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
  }, [nickname, currentNickname, availabilityData, patchNickname, close])

  const handleTextChange = useCallback((text: string) => {
    setNickname(text)
  }, [])

  return (
    <BottomSheetView className='px-6 pb-8 pt-4'>
      <Text className='mb-2 text-center text-2xl font-semibold'>{t`Edit Nickname`}</Text>
      <Text className='mb-6 text-center text-gray-500'>
        {t`Your nickname is visible to other users on the leaderboard. You can change it at any time.`}
      </Text>

      <Text className='mb-3 text-gray-500'>{t`Enter your new nickname`}</Text>

      <BottomSheetTextInput
        defaultValue={nickname}
        onChangeText={handleTextChange}
        placeholder={t`Enter a nickname`}
        className='mb-6 h-16 rounded-lg border border-gray-300 bg-white p-4 text-base'
        style={{ minHeight: 50 }}
        autoCapitalize='none'
        autoCorrect={false}
      />

      <View className='mb-6 min-h-[20px]'>
        {nickname && nickname !== currentNickname && (
          <>
            {isChecking ? (
              <Text className='text-sm text-gray-500'>{t`Checking availability...`}</Text>
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
        {isSubmitting ? t`Saving...` : t`Save`}
      </Button>

      <Button variant='outline' onPress={close} disabled={isSubmitting}>
        {t`Cancel`}
      </Button>
    </BottomSheetView>
  )
}
