import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

export const useConvertAudioToMp3 = () => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.audio.convertAudioToMp3.mutationOptions({
      meta: {
        errorMessage: t`Failed to convert audio`,
      },
    })
  )
}
