import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import { configContract } from '@yourbestaccent/api-client/orpc-contracts/config-contract'

const CONFIG = {
  // 1.0.6 - our first ios app version was
  // we had less than 10 users on version 1.0.6 and can theoretically never update the app, but we can't do anything about it
  // 1.0.7 - we never published this version on the app store
  // 1.0.8 - we introduced forced updates for iOS and Android in the version 1.0.8
  // 1.0.9 - we found a bug in the EAS update gate
  // 1.0.18 - without this, users would have broken flags for the new dialects: Andalusian Spanish and Afro-American English
  // 1.0.20 - users use the new pronunciation exercise flow, which stores results
  // 1.0.27 - updated to SDK 54
  // 1.0.28 - updated the translation endpoints
  lowestSupportedVersionIos: '1.1.2',
  lowestSupportedVersionAndroid: '1.1.2',
}

export const configRouter = (): Router => {
  const implementer = implement(configContract).$context<OrpcContext>()

  const router = implementer.router({
    getConfig: implementer.getConfig.handler(async () => {
      return {
        data: {
          lowestSupportedVersionIos: CONFIG.lowestSupportedVersionIos,
          lowestSupportedVersionAndroid: CONFIG.lowestSupportedVersionAndroid,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: configContract })
}
