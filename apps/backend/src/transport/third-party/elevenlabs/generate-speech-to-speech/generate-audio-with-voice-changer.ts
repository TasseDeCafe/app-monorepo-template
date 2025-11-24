import FormData from 'form-data'
import axios from 'axios'
import { getConfig } from '../../../../config/environment-config'
import { logWithSentry } from '../../sentry/error-monitoring'

export const generateAudioWithVoiceChanger = async (
  audioBase64: string,
  voiceId: string
): Promise<{ generatedAudioData: Uint8Array } | null> => {
  try {
    const data = new FormData()
    const audioBuffer = Buffer.from(audioBase64, 'base64')

    data.append('audio', audioBuffer, 'audioSource.mp3')
    data.append('model_id', 'eleven_multilingual_sts_v2')
    data.append(
      'voice_settings',
      JSON.stringify({
        stability: 0.8,
        similarity_boost: 1,
        use_speaker_boost: true,
      })
    )

    const response = await axios.post(`https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}`, data, {
      headers: {
        ...data.getHeaders(),
        'xi-api-key': getConfig().elevenlabsApiKey,
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'arraybuffer',
    })

    const generatedAudioData = new Uint8Array(response.data)

    return { generatedAudioData }
  } catch (error) {
    const attachment = {
      filename: 'audioSource.mp3',
      data: Buffer.from(audioBase64, 'base64'),
      contentType: 'audio/mpeg',
    }

    logWithSentry({
      message: 'generateAudioWithVoiceChanger: failed to generate audio',
      params: {
        voiceId,
        audioPreview: audioBase64.slice(0, 30),
      },
      error,
      attachments: attachment,
    })
    return null
  }
}
