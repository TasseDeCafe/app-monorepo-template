// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const mockGenerateAudioWithVoiceChanger = async (audioBase64: string, voiceId: string) => {
  const dummyAudio = new Uint8Array([1, 2, 3, 4, 5])

  return {
    generatedAudioData: dummyAudio,
  }
}
