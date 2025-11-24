import { RefObject } from 'react'

import { AudioPlayerInstance } from '../../../../audio-player/audio-player-types.ts'
import { Recording } from '../../../../../hooks/audio/use-audio-recorder.ts'

export type PronunciationComparisonProps = {
  generatedAudio: string | null
  generatedAudioPlayerRef: RefObject<AudioPlayerInstance | null>
  recordings: Recording[]
  text: string
}

export type PronunciationComparisonForOpenExerciseProps = {
  recordings: Recording[]
  text: string
}
