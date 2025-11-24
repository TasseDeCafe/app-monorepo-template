/**
 * the method below was generated entirely by cursor, Kamil has tested it on multiple browsers:
 * @param blob
 * @param startInSeconds - if lower than 0, the slice will start from the beginning of the audio
 * @param endInSeconds - if higher than the length of the audio, the slice will end at the end of the audio
 */
export const createAudioSlice = async (blob: Blob, startInSeconds: number, endInSeconds: number): Promise<Blob> => {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  const audioContext: AudioContext | undefined = new AudioContextClass()
  const context = audioContext

  // Convert blob to array buffer
  const arrayBuffer = await blob.arrayBuffer()

  // Decode audio data
  const audioBuffer = await context.decodeAudioData(arrayBuffer)

  // Calculate start and end samples
  const sampleRate = audioBuffer.sampleRate
  const startSample = Math.max(0, Math.floor(startInSeconds * sampleRate))
  const endSample = Math.min(audioBuffer.length, Math.ceil(endInSeconds * sampleRate))

  // Create new buffer for the slice
  const sliceLength = endSample - startSample
  const sliceBuffer = context.createBuffer(audioBuffer.numberOfChannels, sliceLength, sampleRate)

  // Copy the data
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel)
    const outputData = sliceBuffer.getChannelData(channel)
    for (let i = 0; i < sliceLength; i++) {
      outputData[i] = inputData[i + startSample]
    }
  }

  // Create an offline context and render immediately
  const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, sliceLength, sampleRate)
  const source = offlineContext.createBufferSource()
  source.buffer = sliceBuffer
  source.connect(offlineContext.destination)
  source.start()

  const renderedBuffer = await offlineContext.startRendering()

  // Convert AudioBuffer to Blob directly
  const channels = []
  for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
    channels.push(renderedBuffer.getChannelData(i))
  }

  // Create a interleaved audio data
  const interleaved = new Float32Array(renderedBuffer.length * renderedBuffer.numberOfChannels)
  for (let i = 0; i < renderedBuffer.length; i++) {
    for (let channel = 0; channel < renderedBuffer.numberOfChannels; channel++) {
      interleaved[i * renderedBuffer.numberOfChannels + channel] = channels[channel][i]
    }
  }

  // Convert to 16-bit PCM
  const pcmData = new Int16Array(interleaved.length)
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]))
    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }

  // Create WAV header
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const wavHeader = new ArrayBuffer(44)
  const view = new DataView(wavHeader)
  const numChannels = renderedBuffer.numberOfChannels
  // const sampleRate = renderedBuffer.sampleRate
  const bytesPerSample = 2 // 16-bit
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = pcmData.length * bytesPerSample
  const totalSize = wavHeader.byteLength + dataSize

  // RIFF identifier
  writeString(view, 0, 'RIFF')
  // File length minus RIFF header
  view.setUint32(4, totalSize - 8, true)
  // WAVE identifier
  writeString(view, 8, 'WAVE')
  // Format chunk identifier
  writeString(view, 12, 'fmt ')
  // Format chunk length
  view.setUint32(16, 16, true)
  // Sample format (raw)
  view.setUint16(20, 1, true)
  // Channel count
  view.setUint16(22, numChannels, true)
  // Sample rate
  view.setUint32(24, sampleRate, true)
  // Byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true)
  // Block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true)
  // Bits per sample
  view.setUint16(34, bytesPerSample * 8, true)
  // Data chunk identifier
  writeString(view, 36, 'data')
  // Data chunk length
  view.setUint32(40, dataSize, true)

  return new Blob([wavHeader, pcmData.buffer], { type: 'audio/wav' })
}
