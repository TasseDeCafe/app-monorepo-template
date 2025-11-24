import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../../orpc/orpc-context'
import { StressExerciseServiceInterface } from '../../../service/stress-exercise-service/stress-exercise-service'
import { stressExerciseContract } from '@yourbestaccent/api-client/orpc-contracts/stress-exercise-contract'

export const StressExerciseRouter = (stressExerciseService: StressExerciseServiceInterface): Router => {
  const implementer = implement(stressExerciseContract).$context<OrpcContext>()

  const router = implementer.router({
    generateStressExercises: implementer.generateStressExercises.handler(async ({ input, errors }) => {
      const { position, language, dialect } = input
      const result = await stressExerciseService.generateStressExercises(position, language, dialect)

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: `Failed to generate stress exercises: ${result.crypticCode}` }],
          },
        })
      }

      return {
        data: {
          exercises: result.exercises,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: stressExerciseContract })
}
