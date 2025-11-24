import { oc } from '@orpc/contract'
import { z } from 'zod'

export const REMOVALS_PATH = '/removals' as const

const errorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
    })
  ),
})

const removalInputSchema = z.object({
  type: z.enum(['account', 'voice']),
})

export const removalsContract = {
  postRemoval: oc
    .route({
      method: 'POST',
      path: REMOVALS_PATH,
      successStatus: 200,
    })
    .errors({
      NOT_FOUND: {
        status: 404,
        data: errorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(removalInputSchema)
    .output(
      z.object({
        data: z.object({
          message: z.string(),
          isSuccess: z.boolean(),
        }),
      })
    ),
} as const

export type RemovalInput = z.infer<typeof removalInputSchema>
