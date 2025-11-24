import { oc } from '@orpc/contract'
import { z } from 'zod'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'

const LeaderboardEntrySchema = z.object({
  nickname: z.string().nullable(),
  xp: z.number().int().nonnegative(),
})

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>

const TimePeriodDataSchema = z.object({
  allTime: z.array(LeaderboardEntrySchema),
  weekly: z.array(LeaderboardEntrySchema),
})

export const leaderboardDataSchema = z.object({
  xp: z.object({
    allTime: z.array(LeaderboardEntrySchema),
    weekly: z.array(LeaderboardEntrySchema),
    byLanguage: z.partialRecord(z.enum(SUPPORTED_STUDY_LANGUAGES), TimePeriodDataSchema),
  }),
})

export type TimePeriodKey = keyof z.infer<typeof TimePeriodDataSchema>

export const LEADERBOARD_PATH = '/leaderboard' as const

export const leaderboardContract = {
  getLeaderboard: oc
    .route({
      method: 'GET',
      path: LEADERBOARD_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
            })
          ),
        }),
      },
    })
    .output(
      z.object({
        data: leaderboardDataSchema,
      })
    ),
} as const
