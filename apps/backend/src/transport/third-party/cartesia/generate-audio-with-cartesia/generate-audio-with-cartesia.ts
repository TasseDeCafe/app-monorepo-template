import { CartesiaClient } from '@cartesia/cartesia-js'
import { logWithSentry } from '../../sentry/error-monitoring'
import { getConfig } from '../../../../config/environment-config'

const cartesiaClient = new CartesiaClient({
  apiKey: getConfig().cartesiaApiKey,
})

export type GenerateAudioWithCartesiaParams = {
  text: string
  voiceId: string
  modelId?: string
}

const streamToBuffer = async (stream: AsyncIterable<Uint8Array> | NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks: Buffer[] = []
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export const generateAudioWithCartesia = async ({
  text,
  voiceId,
  modelId = 'sonic-3',
}: GenerateAudioWithCartesiaParams): Promise<{ generatedAudioData: Uint8Array } | null> => {
  try {
    const responseStream = await cartesiaClient.tts.bytes({
      modelId,
      transcript: text,
      generationConfig: {
        speed: 0.8,
      },
      // todo: at the moment, we only use this function for pt-PT, so we hardcode the language code here
      language: 'pt',
      voice: {
        mode: 'id',
        id: voiceId,
      },
      outputFormat: {
        container: 'mp3',
        sampleRate: 44100,
        bitRate: 128000,
      },
    })

    const buffer = await streamToBuffer(responseStream)

    return { generatedAudioData: new Uint8Array(buffer) }
  } catch (error) {
    logWithSentry({
      message: 'generateAudioWithCartesia: failed to generate audio',
      params: {
        textPreview: text.slice(0, 30),
        voiceId,
        modelId,
      },
      error,
    })
    return null
  }
}
