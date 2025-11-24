import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import type { IpaTranscriptionServiceInterface } from '../../service/ipa-transcription-service-interface'
import { ipaTranscriptionContract } from '@yourbestaccent/api-client/orpc-contracts/ipa-transcription-contract'

export const IpaTranscriptionRouter = (ipaTranscriptionService: IpaTranscriptionServiceInterface): Router => {
  const implementer = implement(ipaTranscriptionContract).$context<OrpcContext>()

  const router = implementer.router({
    transcribeToIpa: implementer.transcribeToIpa.handler(async ({ input, errors }) => {
      const { text, language, dialect } = input
      const result = await ipaTranscriptionService.generateIpaTranscription(text, language, dialect)

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to generate ipa.', code: result.crypticCode }],
          },
        })
      }

      return {
        data: {
          ipaTranscription: result.ipaTranscription,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: ipaTranscriptionContract })
}
