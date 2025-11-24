import { Router, type NextFunction, type Request, type Response } from 'express'
import { implement } from '@orpc/server'
import { logWithSentry } from '../../transport/third-party/sentry/error-monitoring'
import { insertRemoval, updateRemovalSuccess } from '../../transport/database/removals/removals-repository'
import { rateLimit } from 'express-rate-limit'
import { getConfig } from '../../config/environment-config'
import { ElevenlabsApi } from '../../transport/third-party/elevenlabs/elevenlabs-api'
import type { AuthUsersRepository } from '../../transport/database/auth-users/auth-users-repository'
import { CustomerioApi } from '../../transport/third-party/customerio/customerio-api'
import { StripeApi } from '../../transport/third-party/stripe/stripe-api'
import { CUSTOM_CUSTOMERIO_ATTRIBUTE } from '../../transport/third-party/customerio/types'
import type { UsersRepositoryInterface } from '../../transport/database/users/users-repository'
import type { StripeSubscriptionsRepositoryInterface } from '../../transport/database/stripe-subscriptions/stripe-subscriptions-repository'
import { removalsContract } from '@yourbestaccent/api-client/orpc-contracts/removals-contract'
import { getVoiceId } from '../audio-generation-router/audio-generation-router'
import { CrypticCodeConstants } from '../../constants/cryptic-code-constants'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'

export const removalsRouter = (
  authUsersRepository: AuthUsersRepository,
  usersRepository: UsersRepositoryInterface,
  elevenlabsApi: ElevenlabsApi,
  customerioApi: CustomerioApi,
  stripeApi: StripeApi,
  stripeSubscriptionsRepository: StripeSubscriptionsRepositoryInterface
) => {
  const expressRouter: Router = Router()

  const oneHour = 1000 * 60 * 60
  const fiveRequestsInOneHourRateLimit = rateLimit({
    windowMs: oneHour,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })

  const conditionalRateLimitingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (getConfig().shouldRateLimit) {
      return fiveRequestsInOneHourRateLimit(req, res, next)
    }
    return next()
  }

  expressRouter.use('/removals', conditionalRateLimitingMiddleware)

  const implementer = implement(removalsContract).$context<OrpcContext>()

  const router = implementer.router({
    postRemoval: implementer.postRemoval.handler(async ({ context, input, errors }) => {
      const { res } = context
      const userId = res.locals.userId
      const userEmail = res.locals.email
      const { type } = input

      const dbUser = await usersRepository.findUserByUserId(userId)
      if (!dbUser) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User not found' }],
          },
        })
      }

      const elevenlabsVoiceId = dbUser.elevenlabs_voice_id ? getVoiceId(dbUser.elevenlabs_voice_id) : null

      let removalId: string | null = null

      if (type === 'voice') {
        if (!elevenlabsVoiceId) {
          logWithSentry({
            message: `User has no elevenlabs_voice_id`,
            params: {
              userId,
              type,
            },
          })
          throw errors.NOT_FOUND({
            data: {
              errors: [{ message: 'User has no elevenlabs_voice_id to delete' }],
            },
          })
        }

        removalId = await insertRemoval(userId, elevenlabsVoiceId, userEmail, type, false)

        if (!removalId) {
          logWithSentry({ message: 'could not insert removal', params: { userId, type } })
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: `${type} removal was not initiated`,
                  code: CrypticCodeConstants.REMOVAL_VOICE_NOT_INITIATED,
                },
              ],
            },
          })
        }

        const isSuccessfullyRemovedFromElevenLabs = await elevenlabsApi.deleteVoice(elevenlabsVoiceId)
        if (!isSuccessfullyRemovedFromElevenLabs) {
          logWithSentry({
            message: 'removing elevenlabs_voice_id from elevenlabs did not fully succeed',
            params: { userId, type },
          })
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'voice removal did not fully succeed',
                  code: CrypticCodeConstants.REMOVAL_VOICE_ELEVENLABS_DELETE_FAILED,
                },
              ],
            },
          })
        }

        const isSuccessfullyRemoved = await usersRepository.updateElevenLabsVoiceIdToNull(userId)
        if (!isSuccessfullyRemoved) {
          logWithSentry({
            message: 'removing elevenlabs_voice_id in our db did not fully succeed',
            params: { userId, type },
          })
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'voice removal did not fully succeed',
                  code: CrypticCodeConstants.REMOVAL_VOICE_DB_UPDATE_FAILED,
                },
              ],
            },
          })
        }

        await customerioApi.updateCustomer(userId, {
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.HAS_VOICE]: false,
        })
      } else {
        removalId = await insertRemoval(userId, elevenlabsVoiceId, userEmail, type, false)
        if (!removalId) {
          logWithSentry({ message: 'could not insert removal', params: { userId, type } })
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: `${type} removal was not initiated`,
                  code: CrypticCodeConstants.REMOVAL_ACCOUNT_NOT_INITIATED,
                },
              ],
            },
          })
        }

        const subscriptions = await stripeSubscriptionsRepository.getSubscriptionsByUserId(userId)
        const latestSubscription = subscriptions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0]

        if (latestSubscription?.stripe_subscription_id) {
          const isSuccessfullyCancelled = await stripeApi.cancelSubscription(latestSubscription.stripe_subscription_id)
          if (!isSuccessfullyCancelled) {
            logWithSentry({
              message: 'account removal: failed to cancel stripe subscription',
              params: { userId, type },
            })
            throw errors.INTERNAL_SERVER_ERROR({
              data: {
                errors: [
                  {
                    message: 'account removal did not fully succeed',
                    code: CrypticCodeConstants.REMOVAL_ACCOUNT_STRIPE_CANCEL_FAILED,
                  },
                ],
              },
            })
          }
        }

        const personalVoiceId = getConfig().personalElevenlabsVoiceId
        if (elevenlabsVoiceId && elevenlabsVoiceId !== personalVoiceId) {
          const isSuccessfullyRemovedFromElevenLabs = await elevenlabsApi.deleteVoice(elevenlabsVoiceId)
          if (!isSuccessfullyRemovedFromElevenLabs) {
            logWithSentry({
              message: 'account removal: removing elevenlabs_voice_id from elevenlabs did not fully succeed',
              params: { userId, type },
            })
            throw errors.INTERNAL_SERVER_ERROR({
              data: {
                errors: [
                  {
                    message: 'account removal did not fully succeed',
                    code: CrypticCodeConstants.REMOVAL_ACCOUNT_ELEVENLABS_DELETE_FAILED,
                  },
                ],
              },
            })
          }
        }

        const isSuccessfullyRemovedFromCustomerio = await customerioApi.destroyCustomer(userId)
        if (!isSuccessfullyRemovedFromCustomerio) {
          logWithSentry({
            message: 'account removal: failed to destroy customer in customerio',
            params: { userId, type },
          })
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'account removal did not fully succeed',
                  code: CrypticCodeConstants.REMOVAL_ACCOUNT_CUSTOMERIO_DESTROY_FAILED,
                },
              ],
            },
          })
        }

        const isSuccessfullyRemovedFromAuthUsers = await authUsersRepository.removeUserFromAuthUsers(userId)
        if (!isSuccessfullyRemovedFromAuthUsers) {
          logWithSentry({
            message: 'account removal: failed to remove user from authUsers',
            params: { userId, type },
          })
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'account removal did not fully succeed',
                  code: CrypticCodeConstants.REMOVAL_ACCOUNT_AUTH_USERS_DELETE_FAILED,
                },
              ],
            },
          })
        }
      }

      if (!removalId) {
        logWithSentry({
          message: 'removalId missing after processing removal request',
          params: { userId, type, removalId },
        })
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [
              {
                message: `${type} removal did not fully succeed`,
                code: CrypticCodeConstants.REMOVAL_UPDATE_SUCCESS_FAILED,
              },
            ],
          },
        })
      }

      const wasInsertToRemovalsSuccessful = await updateRemovalSuccess(removalId, true)
      if (!wasInsertToRemovalsSuccessful) {
        logWithSentry({
          message: 'account removal: failed to insert removal success',
          params: { userId, type, removalId },
        })
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [
              {
                message: `${type} removal did not fully succeed`,
                code: CrypticCodeConstants.REMOVAL_UPDATE_SUCCESS_FAILED,
              },
            ],
          },
        })
      }

      return {
        data: {
          message: 'Removal has been executed successfully',
          isSuccess: true,
        },
      }
    }),
  })

  expressRouter.use(createOrpcExpressRouter(router, { contract: removalsContract }))

  return expressRouter
}
