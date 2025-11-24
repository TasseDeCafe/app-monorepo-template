import { sql } from '../postgres-client'
import { logCustomErrorMessageAndError } from '../../third-party/sentry/error-monitoring'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { DbMessage, DbMessageRole, DbRetrieveMessagesResult } from './messages-repository-types'

export interface MessagesRepositoryInterface {
  createMessage: (userId: string, content: string, role: DbMessageRole, language: LangCode) => Promise<boolean>
  createUserAndBotMessage: (
    userId: string,
    userContent: string,
    botContent: string,
    language: LangCode
  ) => Promise<boolean>
  retrieveMessages: (userId: string, cursor?: string, limit?: number) => Promise<DbRetrieveMessagesResult>
  softDeleteMessage: (userId: string, messageId: number) => Promise<boolean>
}

export const MessagesRepository = (): MessagesRepositoryInterface => {
  const createMessage = async (
    userId: string,
    content: string,
    role: DbMessageRole,
    language: LangCode
  ): Promise<boolean> => {
    try {
      await sql`
          INSERT INTO public.messages (user_id,
                                       content,
                                       role,
                                       language)
          VALUES (${userId}::uuid,
                  ${content},
                  ${role}::message_role,
                  ${language})
      `
      return true
    } catch (e) {
      logCustomErrorMessageAndError(
        `createMessage error, userId = ${userId}, content = ${content}, role = ${role}, language = ${language}`,
        e
      )
      return false
    }
  }

  const createUserAndBotMessage = async (
    userId: string,
    userContent: string,
    botContent: string,
    language: LangCode
  ): Promise<boolean> => {
    try {
      await sql.begin(async (sql) => {
        // Insert user message first
        await sql`
            INSERT INTO public.messages (user_id, content, role, language)
            VALUES (${userId}::uuid, ${userContent}, 'user'::message_role, ${language})
        `
        // Then insert bot message
        await sql`
            INSERT INTO public.messages (user_id, content, role, language)
            VALUES (${userId}::uuid, ${botContent}, 'bot'::message_role, ${language})
        `
      })
      return true
    } catch (e) {
      logCustomErrorMessageAndError(
        `createUserAndBotMessage error, userId = ${userId}, userContent = ${userContent}, botContent = ${botContent}, language = ${language}`,
        e
      )
      return false
    }
  }

  const retrieveMessages = async (
    userId: string,
    cursor?: string,
    limit: number = 50,
    language?: LangCode
  ): Promise<DbRetrieveMessagesResult> => {
    try {
      const cursorId = cursor ? parseInt(cursor, 10) : null
      const cursorCondition = cursor ? sql`AND id < ${cursorId}` : sql``
      const languageCondition = language ? sql`AND language = ${language}` : sql``

      const result = await sql<DbMessage[]>`
          SELECT id,
                 content,
                 role,
              language,
              created_at::text,
              deleted_at::text
          FROM public.messages
          WHERE user_id = ${userId}::uuid ${cursorCondition} ${languageCondition}
          ORDER BY id DESC
              LIMIT ${limit + 1}
      `

      const hasNextPage = result.length > limit
      const messages = result.slice(0, limit)
      const nextCursor = hasNextPage ? messages[messages.length - 1].id.toString() : null

      return {
        isSuccess: true,
        messages,
        nextCursor,
      }
    } catch (e) {
      logCustomErrorMessageAndError(`retrieveMessages error, userId = ${userId}`, e)
      return {
        isSuccess: false,
        messages: null,
        nextCursor: null,
      }
    }
  }

  const softDeleteMessage = async (userId: string, messageId: number): Promise<boolean> => {
    try {
      const result = await sql`
        UPDATE public.messages 
        SET content = NULL,
            deleted_at = NOW()
        WHERE id = ${messageId} 
        AND user_id = ${userId}::uuid
        AND deleted_at IS NULL
      `
      return result.count > 0
    } catch (e) {
      logCustomErrorMessageAndError(`softDeleteMessage error, userId = ${userId}, messageId = ${messageId}`, e)
      return false
    }
  }

  return {
    createMessage,
    createUserAndBotMessage,
    retrieveMessages,
    softDeleteMessage,
  }
}
