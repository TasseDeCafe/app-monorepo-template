import { oc } from '@orpc/contract'
import { z } from 'zod'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { transcriptionResponseSchema } from '@yourbestaccent/core/common-types/transcription-types'
import { audioUploadSchema } from './common/audio-upload-schema'

const errorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
    })
  ),
})

export const audioTranscriptionContract = {
  transcribeAudio: oc
    .route({
      method: 'POST',
      path: '/transcribe-audio',
      successStatus: 200,
    })
    .errors({
      AUDIO_VALIDATION_ERROR: {
        status: 400,
        data: errorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        langCode: z.enum(LangCode),
        audio: audioUploadSchema,
      })
    )
    .output(
      z.object({
        data: transcriptionResponseSchema,
      })
    ),
} as const
