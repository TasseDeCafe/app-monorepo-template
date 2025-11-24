import { useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { VOICE_OF_THE_USER } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { isEmoji } from '@yourbestaccent/core/utils/text-utils'

const validateAndCleanText = (text: string | null | undefined): string => {
  if (!text) return ''
  const chars = [...text]
  return chars.filter((char) => !isEmoji(char)).join('')
}

export const useGenerateAudio = (sentence: string, studyLanguage: SupportedStudyLanguage, dialect: DialectCode) => {
  const cleanedText = validateAndCleanText(sentence)

  return useQuery(
    orpcQuery.audioGeneration.generateAudio.queryOptions({
      input: {
        text: cleanedText,
        language: studyLanguage,
        dialect,
        voiceOption: VOICE_OF_THE_USER,
      },
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.AUDIO_WITH_ALIGNMENT, sentence, studyLanguage, dialect],
      enabled: !!sentence,
      select: (response) => response.data,
    })
  )
}

export const useGenerateAudioWord = (
  word: string | null,
  studyLanguage: SupportedStudyLanguage,
  dialect: DialectCode
) => {
  const cleanedWord = word ? validateAndCleanText(word) : ''

  return useQuery(
    orpcQuery.audioGeneration.generateAudioWord.queryOptions({
      input: {
        word: cleanedWord,
        language: studyLanguage,
        dialect,
        voiceOption: VOICE_OF_THE_USER,
      },
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD, word, studyLanguage, dialect],
      enabled: !!word,
      select: (response) => response.data,
    })
  )
}
