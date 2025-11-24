import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import type { MessagesServiceInterface } from '../../service/messages-service/messages-service-types'
import type { MessagesRepositoryInterface } from '../../transport/database/messages/messages-repository-interface'
import { messagesContract } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'

export const MessagesRouter = (
  messagesService: MessagesServiceInterface,
  messagesRepository: MessagesRepositoryInterface
): Router => {
  const implementer = implement(messagesContract).$context<OrpcContext>()

  const router = implementer.router({
    createMessage: implementer.createMessage.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId

      const result = await messagesService.createMessage(
        userId,
        input.content,
        input.motherLanguage,
        input.studyLanguage,
        input.personality,
        input.voiceOption
      )

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: `Failed to create message: ${result.crypticCode}` }],
          },
        })
      }

      return {
        data: {
          success: true,
          aiResponse: result.aiResponse,
        },
      }
    }),

    getMessages: implementer.getMessages.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId

      const result = await messagesService.retrieveMessages(userId, input.cursor, input.limit ?? 100)

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to retrieve messages' }],
          },
        })
      }

      return {
        data: {
          messages: result.messages,
          nextCursor: result.nextCursor,
        },
      }
    }),

    softDeleteMessage: implementer.softDeleteMessage.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId

      const result = await messagesRepository.softDeleteMessage(userId, input.messageId)

      if (!result) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'Message not found or unauthorized' }],
          },
        })
      }

      return {
        data: {
          success: true,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: messagesContract })
}
