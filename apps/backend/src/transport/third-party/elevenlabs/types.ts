import { AlignmentData } from '@yourbestaccent/core/common-types/alignment-types'

export interface AddVoiceResponseBody {
  voice_id: string
}

export interface GenerateAudioResponseBody {
  audio_base64: string
  alignment: {
    characters: string[]
    character_start_times_seconds: number[]
    character_end_times_seconds: number[]
  }
}

export type GenerateAudioTextWithAlignmentData = {
  generatedAudioData: Uint8Array
  alignmentData: AlignmentData
}
