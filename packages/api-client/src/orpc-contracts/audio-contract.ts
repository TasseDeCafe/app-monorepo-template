import { oc } from '@orpc/contract'
import { z } from 'zod'

export const audioContract = {
  convertAudioToMp3: oc
    .route({
      method: 'POST',
      path: '/audio/convert-to-mp3',
      successStatus: 200,
    })
    .errors({
      FORBIDDEN: {
        status: 403,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
              code: z.string().optional(),
            })
          ),
        }),
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
              code: z.string().optional(),
            })
          ),
        }),
      },
    })
    .input(
      z.object({
        audio: z.string(),
        fromFormat: z.string(),
        toFormat: z.string(),
      })
    )
    .output(
      z.object({
        data: z.object({
          convertedAudio: z.string(),
          format: z.string(),
        }),
      })
    ),
} as const
