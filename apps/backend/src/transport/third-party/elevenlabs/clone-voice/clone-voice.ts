import { AddVoiceResponseBody } from '../types'
import axios from 'axios'
import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'
import { getConfig } from '../../../../config/environment-config'
import { UploadedFile } from '../../../../types/uploaded-file'

export type CloneVoiceResult =
  | { status: 'success'; voice: AddVoiceResponseBody }
  | { status: 'voice_too_short'; message: string }
  | { status: 'failure'; message: string }

export const cloneVoice = async (audioFile: UploadedFile, supabaseUserId: string): Promise<CloneVoiceResult> => {
  const personalVoiceId = getConfig().personalElevenlabsVoiceId

  if (personalVoiceId) {
    // Create a deterministic but unique voice ID for each user in development
    // This is necessary to bypass the unique constraint in the database
    const developmentVoiceId = `${personalVoiceId}_${supabaseUserId}`
    return {
      status: 'success',
      voice: { voice_id: developmentVoiceId },
    }
  }

  const form = new FormData()
  const arrayBufferView = new Uint8Array<ArrayBuffer>(
    audioFile.buffer.buffer as ArrayBuffer,
    audioFile.buffer.byteOffset,
    audioFile.buffer.byteLength
  )
  const blob = new Blob([arrayBufferView], { type: audioFile.mimetype || 'audio/mpeg' })

  form.append('description', `${JSON.stringify({ userId: supabaseUserId })}`)
  form.append('files', blob, audioFile.originalname || 'audio.mp3')
  form.append('name', supabaseUserId)
  form.append('labels', JSON.stringify({}))

  try {
    const response = await axios.post<AddVoiceResponseBody>('https://api.elevenlabs.io/v1/voices/add', form, {
      headers: { 'Content-Type': 'multipart/form-data', 'xi-api-key': getConfig().elevenlabsApiKey },
    })
    return {
      status: 'success',
      voice: response.data,
    }
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 400 &&
      (error.response.data as { detail?: { status?: string; message?: string } } | undefined)?.detail?.status ===
        'voice_too_short'
    ) {
      const message =
        (error.response.data as { detail?: { message?: string } } | undefined)?.detail?.message ??
        'Voice samples must be at least 1 second long'

      return {
        status: 'voice_too_short',
        message,
      }
    }

    logCustomErrorMessageAndError('cloneVoice - error', error)
    return {
      status: 'failure',
      message: 'Unexpected error while cloning voice',
    }
  }
}
