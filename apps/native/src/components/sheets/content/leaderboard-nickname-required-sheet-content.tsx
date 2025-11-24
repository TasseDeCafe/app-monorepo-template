import { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { useCheckNicknameAvailability, usePatchNickname } from '@/hooks/api/user/user-hooks'
import { Button } from '@/components/ui/button'
import { useBottomSheetPadding } from '@/hooks/use-bottom-sheet-padding'
import { Trophy } from 'lucide-react-native'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'

interface LeaderboardNicknameRequiredSheetContentProps {
  close: () => void
}

export const LeaderboardNicknameRequiredSheetContent = ({ close }: LeaderboardNicknameRequiredSheetContentProps) => {
  const { t } = useLingui()

  const [nickname, setNickname] = useState('')

  const { mutate: patchNickname, isPending: isSubmitting } = usePatchNickname()
  const {
    data: availabilityData,
    isLoading: isChecking,
    refetch: checkAvailability,
  } = useCheckNicknameAvailability(nickname, null)

  // Debounced check for nickname availability
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nickname) {
        checkAvailability().then(() => {})
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [nickname, checkAvailability])

  const handleSaveNickname = useCallback(() => {
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
  }, [nickname, availabilityData?.isAvailable, patchNickname, close])

  const handleCancel = useCallback(() => {
    close()
  }, [close])

  const isButtonEnabled = useMemo(
    () => !!nickname && availabilityData?.isAvailable && !isChecking && !isSubmitting,
    [nickname, availabilityData?.isAvailable, isChecking, isSubmitting]
  )

  const bottomSheetPadding = useBottomSheetPadding()

  return (
    <BottomSheetView className='px-6 pt-4' style={{ paddingBottom: bottomSheetPadding }}>
      <View className='mb-4 items-center'>
        <Trophy size={40} color={colors.indigo[500]} />
      </View>
      <Text className='mb-2 text-center text-2xl font-semibold'>{t`Set a Nickname for Leaderboard`}</Text>
      <Text className='mb-6 text-center text-gray-500'>{t`Your nickname will be displayed on the leaderboard and allows you to compete with other learners.`}</Text>
      <Text className='mb-3 text-gray-500'>{t`Choose a nickname`}</Text>
      <BottomSheetTextInput
        value={nickname}
        onChangeText={setNickname}
        placeholder={t`Enter a nickname`}
        className='mb-6 h-16 w-full rounded-lg border border-gray-300 px-4 py-3'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <View className='mb-6 min-h-[20px]'>
        {nickname && (
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
        {isSubmitting ? t`Saving...` : t`Join Leaderboard`}
      </Button>
      <Button variant='outline' onPress={handleCancel} disabled={isSubmitting}>
        {t`Maybe Later`}
      </Button>
    </BottomSheetView>
  )
}
