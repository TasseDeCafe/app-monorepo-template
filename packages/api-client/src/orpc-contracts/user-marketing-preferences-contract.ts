import { oc } from '@orpc/contract'
import { z } from 'zod'

export const USER_MARKETING_PREFERENCES_PATH = '/users/me/marketing-preferences' as const

export const MarketingPreferencesSchema = z.object({
  shouldReceiveMarketingEmails: z.boolean(),
})

const ErrorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
    })
  ),
})

export const userMarketingPreferencesContract = {
  getMarketingPreferences: oc
    .route({
      method: 'GET',
      path: USER_MARKETING_PREFERENCES_PATH,
      successStatus: 200,
    })
    .output(
      z.object({
        data: MarketingPreferencesSchema,
      })
    ),
  updateMarketingPreferences: oc
    .route({
      method: 'PATCH',
      path: USER_MARKETING_PREFERENCES_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: ErrorResponseSchema,
      },
    })
    .input(MarketingPreferencesSchema)
    .output(
      z.object({
        data: MarketingPreferencesSchema,
      })
    ),
} as const
