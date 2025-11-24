import { type Router } from 'express'
import { implement } from '@orpc/server'
import { savedWordsContract } from '@yourbestaccent/api-client/orpc-contracts/saved-words-contract'
import {
  DbRetrieveSavedWordsResult,
  DbSelectSavedWordCountersByLanguageResult,
  SavedWordsRepository,
} from '../../transport/database/saved-words/saved-words-repository'
import { logMessage } from '../../transport/third-party/sentry/error-monitoring'
import { mapDbSavedWordsToSavedWords } from './saved-words-mapper'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'

export const SavedWordsRouter = (savedWordsRepository: SavedWordsRepository, genericLlmApi: GenericLlmApi): Router => {
  const implementer = implement(savedWordsContract).$context<OrpcContext>()

  const router = implementer.router({
    putSavedWord: implementer.putSavedWord.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const orthographicForm = await genericLlmApi.getOrthographicFormForWord(
        input.language,
        input.contextWords,
        input.wordIndex
      )

      if (!orthographicForm) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while saving the word.', code: '10' }],
          },
        })
      }

      const result = await savedWordsRepository.upsertToSavedWords(userId, orthographicForm, input.language)
      if (!result) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while saving the word.', code: '20' }],
          },
        })
      }

      return {
        data: { orthographicForm },
      }
    }),

    deleteSavedWord: implementer.deleteSavedWord.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      let orthographicForm: string | null
      let language: LangCode

      if ('orthographicForm' in input) {
        orthographicForm = input.orthographicForm
        language = input.language
      } else {
        const { contextWords, wordIndex, language: requestLanguage } = input
        language = requestLanguage
        orthographicForm = await genericLlmApi.getOrthographicFormForWord(language, contextWords, wordIndex)
      }

      if (!orthographicForm) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while saving the word.', code: '10' }],
          },
        })
      }

      const result = await savedWordsRepository.deleteFromSavedWords(userId, orthographicForm, language)
      if (!result) {
        logMessage(`delete /saved-words error: word - ${orthographicForm}, language - ${language}, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while removing a word from saved words.' }],
          },
        })
      }

      return {
        data: { orthographicForm },
      }
    }),

    getSavedWords: implementer.getSavedWords.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const limit = input.limit ?? 50

      const [savedWordsResult, savedWordCountsResult]: [
        DbRetrieveSavedWordsResult,
        DbSelectSavedWordCountersByLanguageResult,
      ] = await Promise.all([
        savedWordsRepository.retrieveSavedWords(userId, input.cursor, limit, input.language),
        savedWordsRepository.getSavedWordCountsByLanguage(userId),
      ])

      if (!savedWordsResult.isSuccess) {
        logMessage(`Error in GET /saved-words: Failed to get saved words for user ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while retrieving saved words.' }],
          },
        })
      }

      if (!savedWordCountsResult.isSuccess) {
        logMessage(`Error in GET /saved-words: Failed to get saved word counts for user ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'An error occurred while retrieving saved word counts.' }],
          },
        })
      }

      return {
        data: {
          savedWords: mapDbSavedWordsToSavedWords(savedWordsResult.savedWords),
          countersByLanguage: savedWordCountsResult.counters,
          nextCursor: savedWordsResult.nextCursor,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: savedWordsContract })
}
