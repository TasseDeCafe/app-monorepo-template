import { NextFunction, Request, Response } from 'express'
import { getConfig } from '../../../config/environment-config'
import {
  ERROR_CODE_FOR_AUTHENTICATING_FRONTEND,
  NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND,
} from '@yourbestaccent/api-client/key-generation/frontend-api-key-constants'
import { isCorrectFrontendApiKey } from '@yourbestaccent/api-client/key-generation/frontend-api-key-generator'
import { ORPCError } from '@orpc/server'

export const frontendAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') && req.method !== 'OPTIONS' && getConfig().shouldHaveSecretFrontendHeader) {
    const apiKey = req.headers[NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND] || ''
    const hasCorrectFrontendApiKey = isCorrectFrontendApiKey(apiKey as string, Date.now())
    if (!hasCorrectFrontendApiKey) {
      const orpcError = new ORPCError('UNAUTHORIZED', {
        message: "Access token is missing or the 'authorization' header was not provided",
        data: {
          errors: [
            {
              // we make this message the same as the error returned by token authentication middleware on purpose, we do not want to let the hacker know what we actually check for
              message: "Access token is missing or the 'authorization' header was not provided",
              code: ERROR_CODE_FOR_AUTHENTICATING_FRONTEND,
            },
          ],
        },
      })
      res.status(orpcError.status).json(orpcError.toJSON())
      return
    } else {
      return next()
    }
  } else {
    return next()
  }
}
