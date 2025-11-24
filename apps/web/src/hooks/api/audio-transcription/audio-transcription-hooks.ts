import { useMutation } from '@tanstack/react-query'
import { SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { orpcClient } from '@/transport/our-backend/orpc-client'
import { getTranscription } from '@template-app/core/exercises/exercise-utils'
import { useLingui } from '@lingui/react/macro'

export const useTranscribeAudioToText = (
  studyLanguage: SupportedStudyLanguage,
  currentText: string,
  setTextValue: (text: string) => void,
  resetAudioRecorder: () => void
) => {
  const { t } = useLingui()

  return useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const response = await orpcClient.audioTranscription.transcribeAudio({
        langCode: studyLanguage,
        audio: new File([audioBlob], 'user-audio.mp3', { type: audioBlob.type || 'audio/mpeg' }),
      })
      return response.data
    },
    onSuccess: (result) => {
      const transcription = getTranscription(result)
      const text = transcription.map((t) => t.actualWord).join(' ')
      const newText = currentText ? `${currentText} ${text}` : text
      setTextValue(newText)
      resetAudioRecorder()
    },
    meta: {
      errorMessage: t`Error transcribing audio.`,
      showErrorToast: false,
    },
  })
}
