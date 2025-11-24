import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../../orpc/orpc-context'
import { CustomerioApi } from '../../../transport/third-party/customerio/customerio-api'
import { CustomerIOAttributesResult } from '../../../transport/third-party/customerio/get-customer-attributes/types'
import { userMarketingPreferencesContract } from '@yourbestaccent/api-client/orpc-contracts/user-marketing-preferences-contract'

export const UserMarketingPreferencesRouter = (customerioApi: CustomerioApi): Router => {
  const implementer = implement(userMarketingPreferencesContract).$context<OrpcContext>()

  const router = implementer.router({
    getMarketingPreferences: implementer.getMarketingPreferences.handler(async ({ context }) => {
      const userId = context.res.locals.userId
      const customerIoResult: CustomerIOAttributesResult = await customerioApi.getCustomerData(userId)

      if (!customerIoResult.wasSuccessful) {
        return {
          data: {
            shouldReceiveMarketingEmails: false,
          },
        }
      }

      return {
        data: {
          shouldReceiveMarketingEmails: !customerIoResult.data.unsubscribed,
        },
      }
    }),
    // if one day we go for storing this in our backend (instead of customer.io) we could store it in the user's settings
    updateMarketingPreferences: implementer.updateMarketingPreferences.handler(async ({ context, input, errors }) => {
      const userId = context.res.locals.userId

      const hasUpdatedCustomerioSuccessfully = await customerioApi.toggleSubscribeToMarketingEmails(
        userId,
        !input.shouldReceiveMarketingEmails
      )

      if (!hasUpdatedCustomerioSuccessfully) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update shouldReceiveMarketingEmails' }],
          },
        })
      }

      return {
        data: {
          shouldReceiveMarketingEmails: input.shouldReceiveMarketingEmails,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: userMarketingPreferencesContract })
}
