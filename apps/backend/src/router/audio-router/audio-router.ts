import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import { convertAudio } from '../../transport/ffmpeg/ffmpeg'
import { audioContract } from '@yourbestaccent/api-client/orpc-contracts/audio-contract'

export const AudioRouter = (): Router => {
  const implementer = implement(audioContract).$context<OrpcContext>()

  const router = implementer.router({
    convertAudioToMp3: implementer.convertAudioToMp3.handler(async ({ input, errors }) => {
      const { audio, fromFormat, toFormat } = input
      const convertedAudio = await convertAudio(audio, fromFormat, toFormat)

      if (!convertedAudio) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Error converting audio', code: '40' }],
          },
        })
      }

      return {
        data: {
          convertedAudio,
          format: toFormat,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: audioContract })
}
