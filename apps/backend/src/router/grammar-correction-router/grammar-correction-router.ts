import { Router } from 'express'
import { implement } from '@orpc/server'
import { grammarCorrectionContract } from '@yourbestaccent/api-client/orpc-contracts/grammar-correction-contract'
import { GenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import { CorrectGrammarAndExplainResult } from '../../transport/third-party/llms/generic-llm/grammar-correction-and-explain-mistakes/correct-grammar-and-explain-mistakes'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'

export const GrammarCorrectionRouter = (genericLlmApi: GenericLlmApi): Router => {
  const implementer = implement(grammarCorrectionContract).$context<OrpcContext>()

  const router = implementer.router({
    correctGrammarAndExplain: implementer.correctGrammarAndExplain.handler(async ({ input, errors }) => {
      const result: CorrectGrammarAndExplainResult = await genericLlmApi.correctGrammarAndExplainMistakes(
        input.text,
        input.motherLanguage,
        input.language,
        input.dialect
      )

      if (!result.correction) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to correct grammar' }],
          },
        })
      }

      return {
        data: {
          correction: result.correction,
          explanation: result.explanation,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: grammarCorrectionContract })
}
