import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import {
  CustomVoice,
  GetGenerateAudioData,
  VOICE_OF_THE_USER,
  VoiceOption,
} from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { isEmoji } from '@yourbestaccent/core/utils/text-utils'
import { useLingui } from '@lingui/react/macro'

const validateAndCleanText = (text: string | null | undefined): string => {
  if (!text) return ''
  const chars = [...text]
  return chars.filter((char) => !isEmoji(char)).join('')
}

export const useGeneratedAudioIndividualWord = (
  word: string | undefined | null,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  hasVoice: boolean,
  isSelectionMode?: boolean
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.audioGeneration.generateAudioWord.queryOptions({
      input: {
        word: validateAndCleanText(word),
        language,
        dialect,
        voiceOption: VOICE_OF_THE_USER,
      },
      queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD, hasVoice, word, language, dialect],
      enabled: hasVoice && !!word && !isSelectionMode,
      select: (response) => response.data,
      meta: {
        errorMessage: t`There was an error when generating the audio of the word. Please try again.`,
        showErrorToast: true,
      },
    })
  )
}

export const useGeneratedAudioText = (
  text: string,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  hasVoice: boolean
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.audioGeneration.generateAudio.queryOptions({
      input: {
        text: validateAndCleanText(text),
        language,
        dialect,
        voiceOption: VOICE_OF_THE_USER,
      },
      queryKey: [QUERY_KEYS.AUDIO_WITH_ALIGNMENT, hasVoice, text, language, dialect],
      enabled: hasVoice && !!dialect && !!language,
      refetchOnWindowFocus: false,
      select: (response) => response.data,
      meta: {
        errorMessage: t`Error generating audio`,
      },
    })
  )
}

export const useGeneratedAudioTranslatedSentence = (
  translationText: string,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  hasVoice: boolean,
  pendingAction?: 'play' | 'download' | null
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.audioGeneration.generateAudio.queryOptions({
      input: {
        text: validateAndCleanText(translationText),
        language,
        dialect,
        voiceOption: hasVoice ? VOICE_OF_THE_USER : CustomVoice.NAMI,
      },
      queryKey: [QUERY_KEYS.AUDIO_TRANSLATED_SENTENCE, translationText, language, dialect, hasVoice],
      enabled: !!translationText && !!language && translationText.trim().length > 0 && !!pendingAction,
      select: (response) => response.data,
      meta: {
        errorMessage: t`There was an error when generating the audio. Please try again.`,
      },
    })
  )
}

export const useGeneratedAudioSavedWord = (
  word: string | undefined,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  hasVoice: boolean,
  hasTappedOnWord: boolean
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.audioGeneration.generateAudioWord.queryOptions({
      input: {
        word: validateAndCleanText(word),
        language,
        dialect,
        voiceOption: VOICE_OF_THE_USER,
      },
      queryKey: [QUERY_KEYS.AUDIO_SAVED_WORD, hasVoice, word, language, dialect],
      enabled: hasVoice && !!language && hasTappedOnWord && !!word,
      select: (response) => response.data,
      meta: {
        errorMessage: t`There was an error when generating the audio of the word. Please try again.`,
        showErrorToast: true,
      },
    })
  )
}

export const useGeneratedAudioIndividualWordOnDemand = (
  word: string | undefined | null,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  hasVoice: boolean,
  hasClickedOnWord: boolean,
  voiceOption?: VoiceOption
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.audioGeneration.generateAudioWord.queryOptions({
      input: {
        word: validateAndCleanText(word),
        language,
        dialect,
        voiceOption: voiceOption ?? VOICE_OF_THE_USER,
      },
      queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD, hasVoice, word, language, dialect, voiceOption],
      enabled: hasClickedOnWord && hasVoice && !!word && !!language,
      select: (response) => response.data,
      meta: {
        errorMessage: t`Failed to generate audio for word, try again later`,
      },
    })
  )
}

export const useGenerateAudioForBotMessage = (
  audioGenerationKey: string[],
  studyLanguage: SupportedStudyLanguage,
  playGeneratedText: () => void
) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.audioGeneration.generateAudio.mutationOptions({
      onError: (error: Error) => {
        logWithSentry('useAddWordsMutation error', error, { studyLanguage })
      },
      onSuccess: async (response) => {
        queryClient.setQueryData<GetGenerateAudioData>(audioGenerationKey, response.data)
        setTimeout(() => {
          playGeneratedText()
        }, 100)
      },
      meta: {
        errorMessage: t`Failed to generate audio, try again later`,
      },
    })
  )
}
