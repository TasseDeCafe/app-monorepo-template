import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import CyrillicToTranslit from 'cyrillic-to-translit-js'
import { transliterationContract } from '@yourbestaccent/api-client/orpc-contracts/transliteration-contract'

export const TransliterationRouter = (): Router => {
  const implementer = implement(transliterationContract).$context<OrpcContext>()

  const router = implementer.router({
    transliterate: implementer.transliterate.handler(async ({ input }) => {
      const { text, language } = input
      let transliteration: string
      if (language === LangCode.RUSSIAN) {
        transliteration = CyrillicToTranslit({ preset: 'ru' }).transform(text)
      } else {
        transliteration = CyrillicToTranslit({ preset: 'uk' }).transform(text)
      }
      return {
        data: {
          transliteration,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: transliterationContract })
}
