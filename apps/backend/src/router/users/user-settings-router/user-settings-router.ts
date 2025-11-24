import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../../orpc/orpc-context'
import type { UsersRepositoryInterface } from '../../../transport/database/users/users-repository'
import { userSettingsContract } from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'

export const UserSettingsRouter = (usersRepository: UsersRepositoryInterface): Router => {
  const implementer = implement(userSettingsContract).$context<OrpcContext>()

  const router = implementer.router({
    getSettings: implementer.getSettings.handler(async ({ context, errors }) => {
      const existingSettings = await usersRepository.getUserSettings(context.res.locals.userId)

      if (!existingSettings) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User settings not found' }],
          },
        })
      }

      return {
        data: existingSettings,
      }
    }),

    updateSettings: implementer.updateSettings.handler(async ({ context, input, errors }) => {
      const success = await usersRepository.updateUserSettings(context.res.locals.userId, input)

      if (!success) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update settings' }],
          },
        })
      }

      return {
        data: input,
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: userSettingsContract })
}
