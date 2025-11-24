import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import fs from 'fs'

export const mockGenerateAudioWord = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  word: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  voiceId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language: SupportedStudyLanguage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dialect: DialectCode
): Promise<Uint8Array | null> => {
  const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio-individual-word.mp3')
  return new Uint8Array(audioBuffer)
}
