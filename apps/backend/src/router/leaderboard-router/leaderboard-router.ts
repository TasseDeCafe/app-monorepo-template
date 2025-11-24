import { Router } from 'express'
import { implement } from '@orpc/server'
import { leaderboardContract } from '@yourbestaccent/api-client/orpc-contracts/leaderboard-contract'
import { UserStatsServiceInterface, LeaderboardResult } from '../../service/user-stats/user-stats-service'
import { logMessage } from '../../transport/third-party/sentry/error-monitoring'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'

export const LeaderboardRouter = (userStatsService: UserStatsServiceInterface): Router => {
  const implementer = implement(leaderboardContract).$context<OrpcContext>()

  const router = implementer.router({
    getLeaderboard: implementer.getLeaderboard.handler(async ({ errors }) => {
      const leaderboardResult: LeaderboardResult = await userStatsService.getLeaderboard()

      if (!leaderboardResult.isSuccess) {
        logMessage(`GET /leaderboard: could not retrieve leaderboard data.`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while retrieving leaderboard data.' }],
          },
        })
      }

      return {
        data: leaderboardResult.leaderboardData,
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: leaderboardContract })
}
