import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import { translationContract } from '@yourbestaccent/api-client/orpc-contracts/translation-contract'
import { GenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'

export const TranslationRouter = (genericLlmApi: GenericLlmApi): Router => {
  const implementer = implement(translationContract).$context<OrpcContext>()

  const router = implementer.router({
    translateWord: implementer.translateWord.handler(async ({ input, errors }) => {
      const { sourceDialect, targetLanguage, text, contextWords, selectedWordIndex } = input
      const translation = await genericLlmApi.translateWord(
        text,
        sourceDialect,
        targetLanguage,
        contextWords,
        selectedWordIndex
      )
      if (!translation) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: `could not translate the requested word ${text}` }],
          },
        })
      }
      return {
        data: {
          translation,
        },
      }
    }),

    translateText: implementer.translateText.handler(async ({ input, errors }) => {
      const { sourceDialect, targetLanguage, text } = input
      const translation = await genericLlmApi.translateText(text, sourceDialect, targetLanguage)
      if (!translation) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: `could not translate the requested text ${text}` }],
          },
        })
      }
      return {
        data: {
          translation,
        },
      }
    }),

    translateSelection: implementer.translateSelection.handler(async ({ input, errors }) => {
      const {
        sourceDialect,
        targetLanguage,
        originalSentence,
        translationSentence,
        selectionChunks,
        selectionPositions,
      } = input
      const translation = await genericLlmApi.translateSelection(
        originalSentence,
        translationSentence,
        selectionChunks,
        selectionPositions,
        sourceDialect,
        targetLanguage
      )
      if (translation === null) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: `could not translate the requested selection ${selectionChunks.join(', ')}` }],
          },
        })
      }
      return {
        data: {
          translation,
        },
      }
    }),

    translateWordWithTranslationContext: implementer.translateWordWithTranslationContext.handler(
      async ({ input, errors }) => {
        const { sourceDialect, targetLanguage, word, originalSentence, translatedSentence, wordIndex } = input
        const translation = await genericLlmApi.translateWordWithTranslationContext(
          word,
          sourceDialect,
          targetLanguage,
          originalSentence,
          translatedSentence,
          wordIndex
        )
        if (!translation) {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [{ message: `could not translate the requested word ${word} with context` }],
            },
          })
        }
        return {
          data: {
            translation,
          },
        }
      }
    ),
  })

  return createOrpcExpressRouter(router, { contract: translationContract })
}
