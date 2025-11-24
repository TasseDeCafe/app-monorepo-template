import { type Router } from 'express'
import {
  DbLeaderboardResult,
  SelectPronouncedWordsResult,
  WordsRepositoryInterface,
} from '../../transport/database/words/words-repository'
import { logMessage } from '../../transport/third-party/sentry/error-monitoring'
import { mapDbWordsPronouncedCorrectly } from './words-mapper'
import { GenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import { implement } from '@orpc/server'
import { wordsContract } from '@yourbestaccent/api-client/orpc-contracts/words-contract'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'

export const WordsRouter = (genericLlmApi: GenericLlmApi, wordsRepository: WordsRepositoryInterface): Router => {
  const implementer = implement(wordsContract).$context<OrpcContext>()

  const router = implementer.router({
    getLearnedWords: implementer.getLearnedWords.handler(async ({ context, input, errors }) => {
      const userId = context.res.locals.userId

      const selectResult: SelectPronouncedWordsResult = await wordsRepository.selectWordsPronouncedCorrectly(
        userId,
        input.cursor,
        input.limit,
        input.language
      )

      if (!selectResult.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while retrieving pronounced words.' }],
          },
        })
      }

      return {
        data: {
          userPronunciations: mapDbWordsPronouncedCorrectly(selectResult.words),
          nextCursor: selectResult.nextCursor,
        },
      }
    }),

    getLeaderboard: implementer.getLeaderboard.handler(async ({ errors }) => {
      const leaderboardResult: DbLeaderboardResult = await wordsRepository.getLeaderboard()

      if (!leaderboardResult.isSuccess) {
        logMessage(`GET /leaderboard: could not retrieve leaderboard data.`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while retrieving leaderboard data.' }],
          },
        })
      }

      return {
        data: {
          learnedWords: {
            allTime: leaderboardResult.allTime,
            weekly: leaderboardResult.weekly,
            byLanguage: leaderboardResult.byLanguage,
          },
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: wordsContract })
}
