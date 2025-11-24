import { WordPair, WordPairWithAlignment } from '@yourbestaccent/core/exercises/types/evaluation-types.ts'
import { RefObject } from 'react'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes.ts'

import { AudioPlayerInstance } from '../../../audio-player/audio-player-types.ts'

export type EvaluationForOpenExerciseProps = {
  wordPairs: WordPair[]
  text: string
  studyLanguage: SupportedStudyLanguage
  recordedAudioBlob: Blob | null
}

export type EvaluationProps = {
  wordPairsWithAlignment: WordPairWithAlignment[]
  generatedAudioPlayerRef: RefObject<AudioPlayerInstance | null>
  text: string
  scoreInPercentage: number
  recordedAudioBlob: Blob | null
}

export type ExpectedWordProps = {
  wordPairWithAlignment: WordPairWithAlignment
  onClick: () => void
  generatedAudioPlayerRef: RefObject<AudioPlayerInstance | null> | null
}

export type ExpectedWordForOpenExerciseProps = {
  wordPair: WordPair
  onClick: () => void
}
