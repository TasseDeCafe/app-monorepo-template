import { createClient, DeepgramResponse, SyncPrerecordedResponse } from '@deepgram/sdk'
import { getConfig } from '../../../../config/environment-config'
import { Readable } from 'stream'
import { logWithSentry } from '../../sentry/error-monitoring'
import { TranscriptionResponse } from '@yourbestaccent/core/common-types/transcription-types'
import { UploadedFile } from '../../../../types/uploaded-file'
import pRetry from 'p-retry'

const deepgram = createClient(getConfig().deepgramApiKey)

export type TranscriptionResult =
  | {
      transcription: TranscriptionResponse
      wasTranscriptionSuccessful: true
    }
  | {
      transcription: null
      wasTranscriptionSuccessful: false
    }

export const transcribe = async (audioFile: UploadedFile, deepgramLangCode: string): Promise<TranscriptionResult> => {
  const logParams = {
    deepgramLangCode,
    mimetype: audioFile.mimetype ?? 'unknown',
    originalname: audioFile.originalname ?? 'unknown',
    audioSizeInBytes: audioFile.buffer.length,
  }
  const audioAttachment = {
    filename: audioFile.originalname ?? 'audio-upload-from-deepgram-transcribe-api',
    data: audioFile.buffer,
    contentType: audioFile.mimetype,
  }

  return await pRetry(
    async () => {
      const audioStream = Readable.from(audioFile.buffer)

      const { result, error }: DeepgramResponse<SyncPrerecordedResponse> =
        await deepgram.listen.prerecorded.transcribeFile(audioStream, {
          //todo: we can switch to nova-3 for most languages, but not all: https://developers.deepgram.com/docs/models-languages-overview
          model: 'nova-2',
          smart_format: true,
          language: deepgramLangCode,
        })

      if (error) {
        throw error
      }
      if (!result) {
        throw new Error('Deepgram did not return a result')
      }
      return {
        transcription: result,
        wasTranscriptionSuccessful: true,
      } as const
    },
    {
      retries: 1,
    }
  ).catch((error) => {
    logWithSentry({
      message: `transcribeDeepgram: all retry attempts exhausted for language: ${deepgramLangCode}`,
      params: logParams,
      error,
      attachments: audioAttachment,
    })
    return {
      transcription: null,
      wasTranscriptionSuccessful: false,
    } as const
  })
}
