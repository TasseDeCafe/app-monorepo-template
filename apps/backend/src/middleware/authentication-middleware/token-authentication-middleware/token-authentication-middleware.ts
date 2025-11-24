import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { getConfig } from '../../../config/environment-config'
import { ERROR_CODE_FOR_INVALID_TOKEN } from '@yourbestaccent/api-client/key-generation/frontend-api-key-constants'
import { ORPCError } from '@orpc/server'
import { setRequestContext } from '../../../context/request-context'

export interface SupabaseClaims {
  sub: string
  user_metadata: {
    name: string
    full_name: string
    email: string
    avatar_url: string
  }
}

// todo orpc: ideally we should be chaining an oRPC middleware to the implementers in each
// router to safely type the context and return oRPC errors.
// this way, variables like userId would be typed correctly in the routers.
export const tokenAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) {
    const orpcError = new ORPCError('UNAUTHORIZED', {
      message: "Access token is missing or the 'authorization' header was not provided",
      data: {
        errors: [
          {
            message: "Access token is missing or the 'authorization' header was not provided",
            code: '20',
          },
        ],
      },
    })
    res.status(orpcError.status).json(orpcError.toJSON())
    return
  } else {
    try {
      const decoded = jwt.verify(token, getConfig().supabaseJwtSecret)
      const {
        sub,
        user_metadata: { name, full_name, email, avatar_url },
      } = decoded as SupabaseClaims
      res.locals.name = name
      res.locals.userId = sub
      res.locals.lastName = full_name
      res.locals.email = email
      res.locals.imageUrl = avatar_url
      setRequestContext({ userId: sub })
      return next()
    } catch {
      const orpcError = new ORPCError('UNAUTHORIZED', {
        message: 'Invalid token',
        data: {
          errors: [
            {
              message: 'Invalid token',
              code: ERROR_CODE_FOR_INVALID_TOKEN,
            },
          ],
        },
      })
      res.status(orpcError.status).json(orpcError.toJSON())
      return
    }
  }
}
