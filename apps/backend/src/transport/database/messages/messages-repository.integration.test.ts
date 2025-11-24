import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MessagesRepository } from './messages-repository-interface'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { __createUserInSupabaseAndGetHisIdAndToken, __removeAllAuthUsersFromSupabase } from '../../../test/test-utils'

describe('Messages Repository Integration Tests', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  afterEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  describe('retrieveMessages', () => {
    it('should retrieve messages with pagination', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const messagesRepository = MessagesRepository()

      const testMessages = [
        { content: 'Message 1', role: 'user' as const, language: LangCode.ENGLISH },
        { content: 'Message 2', role: 'bot' as const, language: LangCode.ENGLISH },
        { content: 'Message 3', role: 'user' as const, language: LangCode.ENGLISH },
      ]

      for (const msg of testMessages) {
        await messagesRepository.createMessage(testUserId, msg.content, msg.role, msg.language)
      }

      const result = await messagesRepository.retrieveMessages(testUserId, undefined, 2)
      expect(result.isSuccess).toBe(true)
      expect(result.messages).toHaveLength(2)
      expect(result.nextCursor).toBeTruthy()
    })

    it('should return empty result for non-existent user', async () => {
      const messagesRepository = MessagesRepository()
      const result = await messagesRepository.retrieveMessages('non-existent-user')

      expect(result.isSuccess).toBe(false)
      expect(result.messages).toBeNull()
      expect(result.nextCursor).toBeNull()
    })
  })

  describe('createUserAndBotMessage', () => {
    it('should create user and bot messages in correct order', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const messagesRepository = MessagesRepository()

      const result = await messagesRepository.createUserAndBotMessage(
        testUserId,
        'User message',
        'Bot response',
        LangCode.ENGLISH
      )
      expect(result).toBe(true)

      const retrieveResult = await messagesRepository.retrieveMessages(testUserId)
      expect(retrieveResult.isSuccess).toBe(true)
      expect(retrieveResult.messages).toHaveLength(2)

      // Messages should be in reverse chronological order (newest first)
      expect(retrieveResult.messages![0]).toMatchObject({
        content: 'Bot response',
        role: 'bot',
        language: LangCode.ENGLISH,
      })
      expect(retrieveResult.messages![1]).toMatchObject({
        content: 'User message',
        role: 'user',
        language: LangCode.ENGLISH,
      })
    })

    it('should fail if either message is empty', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const messagesRepository = MessagesRepository()

      const result = await messagesRepository.createUserAndBotMessage(testUserId, '', 'Bot response', LangCode.ENGLISH)
      expect(result).toBe(false)

      const retrieveResult = await messagesRepository.retrieveMessages(testUserId)
      expect(retrieveResult.isSuccess).toBe(true)
      expect(retrieveResult.messages).toHaveLength(0) // Transaction should rollback both inserts
    })
  })

  describe('softDeleteMessage', () => {
    it('should soft delete a message and set deleted_at', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const messagesRepository = MessagesRepository()

      // Create a test message
      await messagesRepository.createMessage(testUserId, 'Test message', 'user', LangCode.ENGLISH)

      // Get the message to find its ID
      const beforeDelete = await messagesRepository.retrieveMessages(testUserId)
      expect(beforeDelete.isSuccess).toBe(true)
      expect(beforeDelete.messages).toHaveLength(1)
      const messageId = beforeDelete.messages![0].id

      // Soft delete the message
      const deleteResult = await messagesRepository.softDeleteMessage(testUserId, messageId)
      expect(deleteResult).toBe(true)

      // Verify the message is soft deleted
      const afterDelete = await messagesRepository.retrieveMessages(testUserId)
      expect(afterDelete.isSuccess).toBe(true)
      expect(afterDelete.messages).toHaveLength(1)
      const deletedMessage = afterDelete.messages![0]
      expect(deletedMessage.content).toBeNull()
      expect(deletedMessage.deleted_at).not.toBeNull()
    })

    it('should not allow soft deleting a message that belongs to another user', async () => {
      const { id: user1Id } = await __createUserInSupabaseAndGetHisIdAndToken('email_1_@example.com')
      const { id: user2Id } = await __createUserInSupabaseAndGetHisIdAndToken('email_2_@example.com')
      const messagesRepository = MessagesRepository()

      // Create a message for user1
      await messagesRepository.createMessage(user1Id, 'Test message', 'user', LangCode.ENGLISH)
      const user1Messages = await messagesRepository.retrieveMessages(user1Id)
      const messageId = user1Messages.messages![0].id

      // Try to delete user1's message as user2
      const deleteResult = await messagesRepository.softDeleteMessage(user2Id, messageId)
      expect(deleteResult).toBe(false)

      // Verify message still exists for user1
      const afterDeleteAttempt = await messagesRepository.retrieveMessages(user1Id)
      expect(afterDeleteAttempt.messages).toHaveLength(1)
      const message = afterDeleteAttempt.messages![0]
      expect(message.content).toBe('Test message')
      expect(message.deleted_at === null).toBe(true)
    })

    it('should not allow soft deleting an already deleted message', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const messagesRepository = MessagesRepository()

      // Create and get message
      await messagesRepository.createMessage(testUserId, 'Test message', 'user', LangCode.ENGLISH)
      const messages = await messagesRepository.retrieveMessages(testUserId)
      const messageId = messages.messages![0].id

      // Delete it first time
      const firstDeleteResult = await messagesRepository.softDeleteMessage(testUserId, messageId)
      expect(firstDeleteResult).toBe(true)

      // Try to delete it again
      const secondDeleteResult = await messagesRepository.softDeleteMessage(testUserId, messageId)
      expect(secondDeleteResult).toBe(false)
    })

    it('should return false when trying to delete non-existent message', async () => {
      const { id: testUserId } = await __createUserInSupabaseAndGetHisIdAndToken()
      const messagesRepository = MessagesRepository()

      const result = await messagesRepository.softDeleteMessage(testUserId, 99999)
      expect(result).toBe(false)
    })
  })
})
