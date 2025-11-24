import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { cloneVoice } from './clone-voice/clone-voice'
import { mockCloneVoice } from './clone-voice/mock-clone-voice'
import { deleteVoice } from './delete-voice/delete-voice-id'
import { mockDeleteVoice } from './delete-voice/mock-delete-voice-id'
import { GenerateAudioTextWithAlignmentData } from './types'
import { generateAudioWithVoiceChanger } from './generate-speech-to-speech/generate-audio-with-voice-changer'
import { mockGenerateAudioWithVoiceChanger } from './generate-speech-to-speech/mock-generate-audio-with-voice-changer'
import { generateAudioTextWithAlignmentData } from './generate-audio-with-alignment-data/generate-audio-text-with-alignment-data'
import { generateAudioWord } from './generate-audio-individual-word/generate-audio-word'
import { mockGenerateAudioWord } from './generate-audio-individual-word/mock-generate-audio-word'
import { mockGenerateAudioTextWithAlignmentData } from './generate-audio-with-alignment-data/mock-generate-audio-text-with-alignment-data'
import { UploadedFile } from '../../../types/uploaded-file'
import type { CloneVoiceResult } from './clone-voice/clone-voice'

export interface ElevenlabsApi {
  cloneVoice: (audioFile: UploadedFile, userId: string) => Promise<CloneVoiceResult>
  generateAudioTextWithAlignmentData: (
    text: string,
    voiceId: string
  ) => Promise<GenerateAudioTextWithAlignmentData | null>
  generateAudioWord: (
    word: string,
    voiceId: string,
    language: SupportedStudyLanguage,
    dialect: DialectCode
  ) => Promise<Uint8Array | null>
  generateAudioWithVoiceChanger: (
    audioBase64: string,
    voiceId: string
  ) => Promise<{ generatedAudioData: Uint8Array } | null>
  deleteVoice: (voiceId: string) => Promise<boolean>
}

export const RealElevenlabsApi: ElevenlabsApi = {
  cloneVoice,
  generateAudioTextWithAlignmentData,
  generateAudioWord,
  generateAudioWithVoiceChanger,
  deleteVoice,
}

export const MockElevenlabsApi: ElevenlabsApi = {
  cloneVoice: mockCloneVoice,
  generateAudioTextWithAlignmentData: mockGenerateAudioTextWithAlignmentData,
  generateAudioWord: mockGenerateAudioWord,
  generateAudioWithVoiceChanger: mockGenerateAudioWithVoiceChanger,
  deleteVoice: mockDeleteVoice,
}
