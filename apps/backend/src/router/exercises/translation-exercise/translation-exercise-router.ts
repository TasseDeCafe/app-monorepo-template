import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../../orpc/orpc-context'
import { translationExerciseContract } from '@yourbestaccent/api-client/orpc-contracts/translation-exercise-contract'
import { TranslationExercisesServiceInterface } from '../../../service/translation-exercise-service/translation-exercise-service-types'
import { isInUuidFormat } from '../../../utils/uuid-utils'

export const TranslationExerciseRouter = (
  translationExercisesService: TranslationExercisesServiceInterface
): Router => {
  const implementer = implement(translationExerciseContract).$context<OrpcContext>()

  const router = implementer.router({
    startTranslationExercise: implementer.startTranslationExercise.handler(async ({ context, input, errors }) => {
      const userId = context.res.locals.userId
      const { studyLanguage, motherLanguage, dialect } = input

      const result = await translationExercisesService.startTranslationExercise(
        userId,
        studyLanguage,
        motherLanguage,
        dialect
      )

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [
              {
                message: 'Translation exercise start did not fully succeed',
                code: result.crypticCode,
              },
            ],
          },
        })
      }

      return {
        data: result.exercise,
      }
    }),

    retrieveTranslationExerciseHistory: implementer.retrieveTranslationExerciseHistory.handler(
      async ({ context, input, errors }) => {
        const userId = context.res.locals.userId
        const { cursor, limit, language } = input

        const result = await translationExercisesService.retrieveTranslationExerciseHistory(
          userId,
          cursor,
          limit ? parseInt(limit.toString(), 10) : 50,
          language
        )

        if (!result.isSuccess) {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'Translation exercise history retrieval did not fully succeed',
                  code: result.crypticCode,
                },
              ],
            },
          })
        }

        return {
          data: {
            exercises: result.exercises,
            nextCursor: result.nextCursor,
          },
        }
      }
    ),

    retrieveTranslationExercise: implementer.retrieveTranslationExercise.handler(async ({ context, input, errors }) => {
      const userId = context.res.locals.userId
      const { exerciseId } = input

      // Validate UUID format
      if (!isInUuidFormat(exerciseId)) {
        throw errors.BAD_REQUEST({
          data: {
            errors: [{ message: 'Invalid exercise id provided' }],
          },
        })
      }

      const result = await translationExercisesService.retrieveTranslationExercise(userId, exerciseId)

      if (!result.isSuccess) {
        if (!result.exerciseFound) {
          throw errors.NOT_FOUND({
            data: {
              errors: [{ message: 'Exercise not found' }],
            },
          })
        }

        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [
              {
                message: 'Translation exercise retrieval did not fully succeed',
                code: result.crypticCode,
              },
            ],
          },
        })
      }

      return {
        data: result.exercise,
      }
    }),

    completeTranslationExercise: implementer.completeTranslationExercise.handler(async ({ context, input, errors }) => {
      const userId = context.res.locals.userId
      const { exerciseId, userTranslation, skipped, selectedGrammarPatterns, selectedChunks } = input

      // Validate UUID format
      if (!isInUuidFormat(exerciseId)) {
        throw errors.BAD_REQUEST({
          data: {
            errors: [{ message: 'Invalid exercise id provided' }],
          },
        })
      }

      // First check if exercise exists and belongs to user
      const exerciseCheck = await translationExercisesService.retrieveTranslationExercise(userId, exerciseId)
      if (!exerciseCheck.isSuccess) {
        if (!exerciseCheck.exerciseFound) {
          throw errors.NOT_FOUND({
            data: {
              errors: [{ message: 'Exercise not found' }],
            },
          })
        }

        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [
              {
                message: 'Translation exercise completion did not fully succeed',
                code: exerciseCheck.crypticCode,
              },
            ],
          },
        })
      }

      const result = await translationExercisesService.completeExercise({
        exerciseId,
        userTranslation,
        skipped: skipped || false,
        selectedGrammarPatterns,
        selectedChunks,
      })

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [
              {
                message: 'Translation exercise completion did not fully succeed',
                code: result.crypticCode,
              },
            ],
          },
        })
      }

      return {
        data: {
          success: true,
        },
      }
    }),

    generateGrammarPatterns: implementer.generateGrammarPatterns.handler(async ({ input, errors }) => {
      const { motherLanguageSentence, studyLanguageSentence, studyLanguage, motherLanguage } = input

      const result = await translationExercisesService.generateGrammarPatterns(
        motherLanguageSentence,
        studyLanguageSentence,
        studyLanguage,
        motherLanguage
      )

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [
              {
                message: 'Grammar patterns analysis did not fully succeed',
                code: result.crypticCode,
              },
            ],
          },
        })
      }

      return {
        data: {
          grammarPatterns: result.grammarPatterns,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: translationExerciseContract })
}
