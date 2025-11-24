import axios from 'axios'
import { getConfig } from '../../../../config/environment-config'
import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'

export const deleteVoice = async (elevenlabsVoiceId: string): Promise<boolean> => {
  try {
    await axios.delete(`https://api.elevenlabs.io/v1/voices/${elevenlabsVoiceId}`, {
      headers: {
        'xi-api-key': getConfig().elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
    })
    return true
  } catch (error) {
    logCustomErrorMessageAndError(`deleteVoice - error, elevenlabsVoiceId - ${elevenlabsVoiceId}`, error)
    return false
  }
}
