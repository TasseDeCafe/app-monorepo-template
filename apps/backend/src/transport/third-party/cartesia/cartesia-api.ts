import { generateAudioWithCartesia } from './generate-audio-with-cartesia/generate-audio-with-cartesia'
import { mockGenerateAudioWithCartesia } from './generate-audio-with-cartesia/mock-generate-audio-with-cartesia'

export interface CartesiaApi {
  generateAudioWithCartesia: (params: {
    text: string
    voiceId: string
    modelId?: string
  }) => Promise<{ generatedAudioData: Uint8Array } | null>
}

export const RealCartesiaApi: CartesiaApi = {
  generateAudioWithCartesia,
}

export const MockCartesiaApi: CartesiaApi = {
  generateAudioWithCartesia: async (params) => mockGenerateAudioWithCartesia(params),
}
