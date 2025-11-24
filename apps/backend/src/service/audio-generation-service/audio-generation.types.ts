import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { AlignmentData } from '@yourbestaccent/core/common-types/alignment-types'
import { CustomVoice, VoiceOption } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'

export type PronunciationSentenceSuccessResultWithAlignment = {
  isSuccess: true
  generatedAudioData: Uint8Array
  alignmentData: AlignmentData
  hasAlignment: true
}
export type PronunciationSentenceSuccessResultWithoutAlignment = {
  isSuccess: true
  generatedAudioData: Uint8Array
  hasAlignment: false
}
export type PronunciationSentenceFailureResult = {
  isSuccess: false
  crypticCode: string
}
export type PronunciationSentenceResult =
  | PronunciationSentenceSuccessResultWithAlignment
  | PronunciationSentenceSuccessResultWithoutAlignment
  | PronunciationSentenceFailureResult
export type PronunciationWordResult =
  | {
      isSuccess: true
      generatedAudioData: Uint8Array
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export type AudioGenerationTextParams =
  | {
      text: string
      elevenlabsVoiceId: string
      language: SupportedStudyLanguage
      dialect: DialectCode
      voiceOption?: VoiceOption
    }
  | {
      text: string
      elevenlabsVoiceId: null
      language: SupportedStudyLanguage
      dialect: DialectCode
      voiceOption: CustomVoice
    }

export type AudioGenerationWordParams =
  | {
      word: string
      elevenlabsVoiceId: string
      language: SupportedStudyLanguage
      dialect: DialectCode
      voiceOption: VoiceOption
    }
  | {
      word: string
      elevenlabsVoiceId: null
      language: SupportedStudyLanguage
      dialect: DialectCode
      voiceOption: CustomVoice
    }

export interface AudioGenerationServiceInterface {
  generateAudioText: (params: AudioGenerationTextParams) => Promise<PronunciationSentenceResult>
  generateAudioWord: (params: AudioGenerationWordParams) => Promise<PronunciationWordResult>
}
