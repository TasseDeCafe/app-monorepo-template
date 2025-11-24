import { ActualWordWithConfidenceAndAlignment } from './types/evaluation-types'
import { TranscriptionResponse, WordBase } from '@yourbestaccent/core/common-types/transcription-types'

export const getTranscription = (
  transcriptionResponse: TranscriptionResponse
): ActualWordWithConfidenceAndAlignment[] => {
  if (!transcriptionResponse?.results?.channels || transcriptionResponse?.results?.channels.length === 0) {
    return []
  }
  if (
    !transcriptionResponse?.results?.channels[0]?.alternatives ||
    !transcriptionResponse?.results?.channels[0]?.alternatives[0]?.words
  ) {
    return []
  }
  return transcriptionResponse.results.channels[0].alternatives[0].words.map((word: WordBase) => ({
    actualWord: word.punctuated_word || word.word,
    confidence: word.confidence,
    actualStartTimeInSeconds: word.start,
    actualEndTimeInSeconds: word.end,
  }))
}
