import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import {
  generateAudioWithGptAudio,
  GptAudioDialect,
  GptAudioVoice,
} from './generate-audio-with-gpt-audio/generate-audio-with-gpt-audio'
import { mockGenerateAudioWithGptAudio } from './generate-audio-with-gpt-audio/mock-generate-audio-with-gpt-audio'

export interface OpenaiApi {
  generateAudioWithGptAudio: (
    text: string,
    gptAudioVoice: GptAudioVoice,
    language: SupportedStudyLanguage,
    dialect: GptAudioDialect
  ) => Promise<{ generatedAudioData: Uint8Array } | null>
}

export const RealOpenaiApi: OpenaiApi = {
  generateAudioWithGptAudio,
}

export const MockOpenaiApi: OpenaiApi = {
  generateAudioWithGptAudio: mockGenerateAudioWithGptAudio,
}
