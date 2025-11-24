import fs from 'fs'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { AlignmentData } from '@yourbestaccent/core/common-types/alignment-types'
import { GptAudioDialect, GptAudioVoice } from './generate-audio-with-gpt-audio'

export const mockGenerateAudioWithGptAudio = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gptAudioVoice: GptAudioVoice,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language: SupportedStudyLanguage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dialect: GptAudioDialect
): Promise<{ generatedAudioData: Uint8Array; alignmentData: AlignmentData } | null> => {
  const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')
  const emptyAlignmentData: AlignmentData = {
    chars: [],
    charStartTimesMs: [],
    charDurationsMs: [],
  }
  return {
    generatedAudioData: new Uint8Array(audioBuffer),
    alignmentData: emptyAlignmentData,
  }
}
