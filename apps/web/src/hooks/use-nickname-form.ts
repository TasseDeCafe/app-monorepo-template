import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { useCheckNicknameAvailability, usePatchNickname, useUserNickname } from '@/hooks/api/user/user-hooks'
import { useLingui } from '@lingui/react/macro'

export const useNicknameForm = (onSuccessCallback?: () => void) => {
  const { t } = useLingui()
  const queryClient = useQueryClient()

  const { data: currentNickname } = useUserNickname()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      nickname: '',
    },
  })

  const nickname = watch('nickname')

  useEffect(() => {
    if (currentNickname) {
      reset({ nickname: currentNickname })
    }
  }, [currentNickname, reset])

  const {
    data: nicknameAvailabilityData,
    isLoading: isCheckingNicknameAvailability,
    refetch: refetchNicknameAvailability,
  } = useCheckNicknameAvailability(nickname, currentNickname ?? null)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (nickname) {
        refetchNicknameAvailability().then(() => {})
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [nickname, refetchNicknameAvailability])

  const { mutate: submitNickname, isPending: isSubmitting } = usePatchNickname({
    onSuccess: (response) => {
      queryClient.setQueryData([QUERY_KEYS.USER_NICKNAME], {
        data: {
          nickname: response.data.nickname,
        },
      })
      onSuccessCallback?.()
    },
    onError: () => {
      setError('nickname', {
        type: 'manual',
        message: t`Failed to update nickname. Please try again.`,
      })
    },
  })

  const onSubmit = handleSubmit(() => {
    if (nickname === currentNickname) {
      onSuccessCallback?.()
      return
    }

    if (nicknameAvailabilityData?.isAvailable) {
      submitNickname({
        nickname,
      })
    }
  })

  const isButtonEnabled =
    !!nickname &&
    // the button should be enabled when the backend returns an error that is not a validation error
    (!errors.nickname || errors.nickname.type === 'manual') &&
    !isCheckingNicknameAvailability &&
    (nickname === currentNickname || !!nicknameAvailabilityData?.isAvailable) &&
    !isSubmitting

  return {
    register,
    onSubmit,
    errors,
    nickname,
    currentNickname,
    isButtonEnabled,
    isSubmitting,
    nicknameAvailabilityData,
    isCheckingNicknameAvailability,
    reset,
  }
}
