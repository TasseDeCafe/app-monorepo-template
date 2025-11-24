import fs from 'fs'

type MockParams = {
  text?: string
  voiceId?: string
}

export const mockGenerateAudioWithCartesia = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params?: MockParams
): Promise<{ generatedAudioData: Uint8Array }> => {
  const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')
  return {
    generatedAudioData: new Uint8Array(audioBuffer),
  }
}
