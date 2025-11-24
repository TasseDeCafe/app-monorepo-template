import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { fileToUploadedFile } from '../../types/uploaded-file'
import { type OrpcContext } from '../orpc/orpc-context'
import { audioTranscriptionContract } from '@yourbestaccent/api-client/orpc-contracts/audio-transcription-contract'
import { logMessage } from '../../transport/third-party/sentry/error-monitoring'
import { langCodeToDeepgramLanguage } from '../../transport/third-party/deepgram/transcribe/deepgram-utils'
import { DeepgramApi } from '../../transport/third-party/deepgram/deepgram-api'
import { getAudioDurationInSeconds } from '../../utils/audio/get-audio-duration'
import { AUDIO_TOO_SHORT_MESSAGE } from '@yourbestaccent/api-client/orpc-contracts/common/audio-upload-schema'
import { MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS } from '@yourbestaccent/core/constants/pronunciation-evaluation-exercise-constants'

export const AudioTranscriptionRouter = (deepgramApi: DeepgramApi): Router => {
  const implementer = implement(audioTranscriptionContract).$context<OrpcContext>()

  const router = implementer.router({
    transcribeAudio: implementer.transcribeAudio.handler(async ({ input, errors }) => {
      const { langCode, audio } = input

      const uploadedFile = await fileToUploadedFile(audio)

      const durationInSeconds = await getAudioDurationInSeconds(uploadedFile)

      if (durationInSeconds === null) {
        logMessage(`/transcribe audio duration unavailable: langCode - ${langCode}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'There was an error when transcribing the audio.' }],
          },
        })
      }

      if (durationInSeconds < MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS) {
        throw errors.AUDIO_VALIDATION_ERROR({
          data: {
            errors: [{ message: AUDIO_TOO_SHORT_MESSAGE }],
          },
        })
      }

      const transcriptionResult = await deepgramApi.transcribe(uploadedFile, langCodeToDeepgramLanguage(langCode))

      if (!transcriptionResult.wasTranscriptionSuccessful) {
        logMessage(`/transcribe transcribeAudio error: langCode - ${langCode}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'There was an error when transcribing the audio.' }],
          },
        })
      }

      return {
        data: transcriptionResult.transcription,
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: audioTranscriptionContract })
}
