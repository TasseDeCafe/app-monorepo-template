import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../../orpc/helpers/create-orpc-express-router'
import { fileToUploadedFile } from '../../../types/uploaded-file'
import { type OrpcContext } from '../../orpc/orpc-context'
import { pronunciationEvaluationExerciseContract } from '@yourbestaccent/api-client/orpc-contracts/pronunciation-evaluation-exercise-contract'
import {
  CompletePronunciationExerciseResult,
  RetrievePronunciationExerciseResult,
  RetrievePronunciationExerciseHistoryResult,
  PronunciationExerciseServiceInterface,
} from '../../../service/exercises/pronunciation-evaluation-exercise-service/pronunciation-evaluation-exercise-service-types'
import { isInUuidFormat } from '../../../utils/uuid-utils'
import { getAudioDurationInSeconds } from '../../../utils/audio/get-audio-duration'
import { AUDIO_TOO_SHORT_MESSAGE } from '@yourbestaccent/api-client/orpc-contracts/common/audio-upload-schema'
import { MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS } from '@yourbestaccent/core/constants/pronunciation-evaluation-exercise-constants'
import { logMessage } from '../../../transport/third-party/sentry/error-monitoring'

export const PronunciationEvaluationExerciseRouter = (
  pronunciationExerciseService: PronunciationExerciseServiceInterface
): Router => {
  const implementer = implement(pronunciationEvaluationExerciseContract).$context<OrpcContext>()

  const router = implementer.router({
    generatePronunciationExercise: implementer.generatePronunciationExercise.handler(
      async ({ input, context, errors }) => {
        const userId = context.res.locals.userId
        const { language, position, wordLength, dialect, topics } = input

        const result = await pronunciationExerciseService.generatePronunciationExercise(
          userId,
          language,
          position,
          wordLength,
          dialect,
          topics
        )

        if (!result.isSuccess) {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'pronunciation exercise generation did not fully succeed',
                  code: result.crypticCode,
                },
              ],
            },
          })
        }

        return {
          data: {
            id: result.exercise.id,
            text: result.exercise.text,
            language: result.exercise.language,
            dialect: result.exercise.dialect,
            createdAt: result.exercise.createdAt,
            attempts: result.exercise.attempts,
            wordsFromExerciseThatAreSaved: result.exercise.wordsFromExerciseThatAreSaved,
          },
        }
      }
    ),

    generateCustomPronunciationExercise: implementer.generateCustomPronunciationExercise.handler(
      async ({ input, context, errors }) => {
        const userId = context.res.locals.userId
        const { text, language, dialect } = input

        const result = await pronunciationExerciseService.generateCustomPronunciationExercise(
          userId,
          text,
          language,
          dialect
        )

        if (!result.isSuccess) {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'pronunciation exercise generation did not fully succeed',
                  code: result.crypticCode,
                },
              ],
            },
          })
        }

        return {
          data: {
            id: result.exercise.id,
            text: result.exercise.text,
            language: result.exercise.language,
            dialect: result.exercise.dialect,
            createdAt: result.exercise.createdAt,
            attempts: result.exercise.attempts,
            wordsFromExerciseThatAreSaved: result.exercise.wordsFromExerciseThatAreSaved,
          },
        }
      }
    ),

    retrievePronunciationExerciseHistory: implementer.retrievePronunciationExerciseHistory.handler(
      async ({ input, context, errors }) => {
        const userId = context.res.locals.userId
        const { cursor, limit, language } = input

        const result: RetrievePronunciationExerciseHistoryResult =
          await pronunciationExerciseService.retrievePronunciationExerciseHistory(userId, cursor, limit ?? 50, language)

        if (!result.isSuccess) {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'pronunciation exercise history retrieval did not fully succeed',
                  code: result.crypticCode,
                },
              ],
            },
          })
        }

        return {
          data: {
            exercises: result.exercises.map((exercise) => ({
              id: exercise.id,
              text: exercise.text,
              language: exercise.language,
              dialect: exercise.dialect,
              createdAt: exercise.createdAt,
              attempts: exercise.attempts,
            })),
            nextCursor: result.nextCursor,
          },
        }
      }
    ),

    retrievePronunciationExercise: implementer.retrievePronunciationExercise.handler(
      async ({ input, context, errors }) => {
        const userId = context.res.locals.userId
        const { exerciseId } = input

        // Validate UUID format (basic check)
        if (!isInUuidFormat(exerciseId)) {
          throw errors.BAD_REQUEST({
            data: {
              errors: [{ message: 'invalid exercise id provided' }],
            },
          })
        }

        const result: RetrievePronunciationExerciseResult =
          await pronunciationExerciseService.retrievePronunciationExercise(userId, exerciseId)

        if (!result.isSuccess) {
          if (!result.exerciseFound) {
            throw errors.NOT_FOUND({
              data: {
                errors: [
                  {
                    message: 'exercise not found',
                  },
                ],
              },
            })
          }

          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'pronunciation exercise retrieval did not fully succeed',
                  code: result.crypticCode,
                },
              ],
            },
          })
        }

        return {
          data: {
            id: result.exercise.id,
            text: result.exercise.text,
            language: result.exercise.language,
            dialect: result.exercise.dialect,
            createdAt: result.exercise.createdAt,
            attempts: result.exercise.attempts,
            wordsFromExerciseThatAreSaved: result.exercise.wordsFromExerciseThatAreSaved,
          },
        }
      }
    ),

    completePronunciationExercise: implementer.completePronunciationExercise.handler(
      async ({ input, context, errors }) => {
        const userId = context.res.locals.userId
        const { exerciseId, audio } = input

        // Validate UUID format (basic check)
        if (!isInUuidFormat(exerciseId)) {
          throw errors.BAD_REQUEST({
            data: {
              errors: [{ message: 'invalid exercise id provided' }],
            },
          })
        }

        if (!audio) {
          throw errors.BAD_REQUEST({
            data: {
              errors: [{ message: 'audio file missing' }],
            },
          })
        }

        const uploadedFile = await fileToUploadedFile(audio)

        const durationInSeconds = await getAudioDurationInSeconds(uploadedFile)

        if (durationInSeconds === null) {
          logMessage(
            `POST /exercises/pronunciation-evaluation/${exerciseId}/complete audio duration unavailable for user ${userId}`
          )
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [{ message: 'There was an error when completing the exercise' }],
            },
          })
        }

        if (durationInSeconds < MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS) {
          throw errors.AUDIO_VALIDATION_ERROR({
            data: {
              errors: [{ message: AUDIO_TOO_SHORT_MESSAGE }],
            },
          })
        }
        const result: CompletePronunciationExerciseResult =
          await pronunciationExerciseService.completePronunciationExercise(userId, exerciseId, uploadedFile)

        if (!result.isSuccess) {
          if (!result.exerciseFound) {
            throw errors.NOT_FOUND({
              data: {
                errors: [
                  {
                    message: 'exercise not found', // or does not belong to the user, but the user should not know about it
                  },
                ],
              },
            })
          }

          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [
                {
                  message: 'pronunciation exercise completion did not fully succeed',
                  code: result.crypticCode,
                },
              ],
            },
          })
        }

        return {
          data: {
            evaluation: result.evaluation,
            userStats: result.userStats,
          },
        }
      }
    ),
  })

  return createOrpcExpressRouter(router, { contract: pronunciationEvaluationExerciseContract })
}
