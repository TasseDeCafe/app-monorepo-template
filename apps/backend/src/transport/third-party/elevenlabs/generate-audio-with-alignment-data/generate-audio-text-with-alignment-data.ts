import axios from 'axios'
import { GenerateAudioResponseBody } from '../types'
import { getConfig } from '../../../../config/environment-config'
import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'
import { AlignmentData } from '@yourbestaccent/core/common-types/alignment-types'

export const generateAudioTextWithAlignmentData = async (
  text: string,
  elevenlabsVoiceId: string
): Promise<{ generatedAudioData: Uint8Array; alignmentData: AlignmentData } | null> => {
  const voiceId: string = elevenlabsVoiceId
  const data = {
    text,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.3,
      similarity_boost: 0.5,
      use_speaker_boost: true,
      // https://elevenlabs.io/docs/api-reference/agents/create-agent#request.body.conversation_config.tts.speed
      speed: 0.85,
    },
  }

  try {
    const response = await axios.post<GenerateAudioResponseBody>(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': getConfig().elevenlabsApiKey,
        },
      }
    )

    const { audio_base64, alignment } = response.data

    const generatedAudioData = new Uint8Array(Buffer.from(audio_base64, 'base64'))

    const alignmentData: AlignmentData = {
      chars: alignment.characters,
      charStartTimesMs: alignment.character_start_times_seconds.map((time) => time * 1000),
      charDurationsMs: alignment.character_start_times_seconds.map((startTime, index) => {
        const endTime = alignment.character_end_times_seconds[index]
        return (endTime - startTime) * 1000
      }),
    }

    return { generatedAudioData, alignmentData }
  } catch (error) {
    logCustomErrorMessageAndError(
      `generateAudioTextWithAlignmentData - error. Params: text - ${text}, voiceId - ${voiceId}`,
      error
    )
    return null
  }
}
