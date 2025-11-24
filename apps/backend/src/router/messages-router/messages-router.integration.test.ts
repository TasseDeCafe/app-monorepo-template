import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createNUsersWithInitialStateIntroducingCreditCardAfterOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import request from 'supertest'

import { VOICE_OF_THE_USER } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { CreateMessageBody } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'

describe('messages-router', () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  afterEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  describe('GET /messages', () => {
    test('getting messages when none exist', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})
      const getResponse = await request(testApp).get('/api/v1/messages').set(buildAuthorizationHeaders(token))

      expect(getResponse.status).toBe(200)
      expect(getResponse.body.data.messages).toHaveLength(0)
      expect(getResponse.body.data.nextCursor).toBeNull()
    })

    test('messages are returned in reverse chronological order (newest first)', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const messages: CreateMessageBody[] = [
        {
          content: 'Message 1',
          role: 'user',
          motherLanguage: LangCode.ENGLISH,
          studyLanguage: LangCode.ENGLISH,
          personality: null,
          voiceOption: VOICE_OF_THE_USER,
        },
        {
          content: 'Message 2',
          role: 'user',
          motherLanguage: LangCode.ENGLISH,
          studyLanguage: LangCode.ENGLISH,
          personality: null,
          voiceOption: VOICE_OF_THE_USER,
        },
        {
          content: 'Message 3',
          role: 'user',
          motherLanguage: LangCode.ENGLISH,
          studyLanguage: LangCode.ENGLISH,
          personality: null,
          voiceOption: VOICE_OF_THE_USER,
        },
      ]

      for (const msg of messages) {
        const response = await request(testApp).post('/api/v1/messages').set(buildAuthorizationHeaders(token)).send(msg)
        expect(response.status).toBe(200)
      }

      const getResponse = await request(testApp).get('/api/v1/messages').set(buildAuthorizationHeaders(token))

      expect(getResponse.status).toBe(200)
      expect(getResponse.body.data.messages).toHaveLength(6) // 3 user messages + 3 AI responses

      // Check messages in reverse chronological order
      expect(getResponse.body.data.messages[0].content).toBe('AI response to user message')
      expect(getResponse.body.data.messages[1].content).toBe('Message 3')
      expect(getResponse.body.data.messages[2].content).toBe('AI response to user message')
      expect(getResponse.body.data.messages[3].content).toBe('Message 2')
      expect(getResponse.body.data.messages[4].content).toBe('AI response to user message')
      expect(getResponse.body.data.messages[5].content).toBe('Message 1')
    })

    test('pagination works correctly', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const messages: CreateMessageBody[] = Array.from({ length: 5 }, (_, i) => ({
        content: `Message ${i + 1}`,
        role: 'user',
        motherLanguage: LangCode.ENGLISH,
        studyLanguage: LangCode.ENGLISH,
        personality: null,
        voiceOption: VOICE_OF_THE_USER,
      }))

      for (const msg of messages) {
        await request(testApp).post('/api/v1/messages').set(buildAuthorizationHeaders(token)).send(msg)
      }

      const firstPage = await request(testApp).get('/api/v1/messages?limit=4').set(buildAuthorizationHeaders(token))

      expect(firstPage.status).toBe(200)
      expect(firstPage.body.data.messages).toHaveLength(4)
      expect(firstPage.body.data.nextCursor).toBeTruthy()
      // Check first page messages (newest first)
      expect(firstPage.body.data.messages[0].content).toBe('AI response to user message')
      expect(firstPage.body.data.messages[1].content).toBe('Message 5')
      expect(firstPage.body.data.messages[2].content).toBe('AI response to user message')
      expect(firstPage.body.data.messages[3].content).toBe('Message 4')

      const secondPage = await request(testApp)
        .get(`/api/v1/messages?limit=4&cursor=${firstPage.body.data.nextCursor}`)
        .set(buildAuthorizationHeaders(token))

      expect(secondPage.status).toBe(200)
      expect(secondPage.body.data.messages).toHaveLength(4)
      expect(secondPage.body.data.nextCursor).toBeTruthy()
      // Check second page messages
      expect(secondPage.body.data.messages[0].content).toBe('AI response to user message')
      expect(secondPage.body.data.messages[1].content).toBe('Message 3')
      expect(secondPage.body.data.messages[2].content).toBe('AI response to user message')
      expect(secondPage.body.data.messages[3].content).toBe('Message 2')

      const lastPage = await request(testApp)
        .get(`/api/v1/messages?limit=4&cursor=${secondPage.body.data.nextCursor}`)
        .set(buildAuthorizationHeaders(token))

      expect(lastPage.status).toBe(200)
      expect(lastPage.body.data.messages).toHaveLength(2)
      expect(lastPage.body.data.nextCursor).toBeNull()
      // Check last page messages
      expect(lastPage.body.data.messages[0].content).toBe('AI response to user message')
      expect(lastPage.body.data.messages[1].content).toBe('Message 1')
    })

    test('invalid query parameters return 400', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const invalidLimitResponse = await request(testApp)
        .get('/api/v1/messages?limit=not-a-number')
        .set(buildAuthorizationHeaders(token))
      expect(invalidLimitResponse.status).toBe(400)
    })
  })

  describe('DELETE /messages/:messageId', () => {
    test('successfully soft deletes a message and returns isDeleted in response', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      // Create a message first
      const createResponse = await request(testApp)
        .post('/api/v1/messages')
        .set(buildAuthorizationHeaders(token))
        .send({
          content: 'Test message',
          role: 'user',
          motherLanguage: LangCode.ENGLISH,
          studyLanguage: LangCode.ENGLISH,
          personality: null,
          voiceOption: VOICE_OF_THE_USER,
        })

      expect(createResponse.status).toBe(200)

      // Get messages to find the ID
      const getResponse = await request(testApp).get('/api/v1/messages').set(buildAuthorizationHeaders(token))
      expect(getResponse.status).toBe(200)
      const messageId = getResponse.body.data.messages[1].id
      expect(getResponse.body.data.messages[1].isDeleted).toBe(false)

      // Soft delete the message
      const deleteResponse = await request(testApp)
        .delete(`/api/v1/messages/${messageId}`)
        .set(buildAuthorizationHeaders(token))

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.data.success).toBe(true)

      // Verify message is marked as deleted in response
      const verifyResponse = await request(testApp).get('/api/v1/messages').set(buildAuthorizationHeaders(token))
      expect(verifyResponse.status).toBe(200)
      const deletedMessage = verifyResponse.body.data.messages.find((m) => m.id === messageId)
      expect(deletedMessage).toBeDefined()
      expect(deletedMessage.content).toBeNull()
      expect(deletedMessage.isDeleted).toBe(true)
    })

    test('returns 404 when trying to delete non-existent message', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const response = await request(testApp).delete('/api/v1/messages/999999').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(404)
      expect(response.body.data.errors[0].message).toBe('Message not found or unauthorized')
    })

    test('cannot delete message belonging to another user', async () => {
      const { users, testApp } = await __createNUsersWithInitialStateIntroducingCreditCardAfterOnboarding(2)
      const [{ token: token1 }, { token: token2 }] = users

      // Create a message with first user
      const createResponse = await request(testApp)
        .post('/api/v1/messages')
        .set(buildAuthorizationHeaders(token1))
        .send({
          content: 'Test message',
          role: 'user',
          motherLanguage: LangCode.ENGLISH,
          studyLanguage: LangCode.ENGLISH,
          personality: null,
          voiceOption: VOICE_OF_THE_USER,
        })

      expect(createResponse.status).toBe(200)

      // Get message ID
      const getResponse = await request(testApp).get('/api/v1/messages').set(buildAuthorizationHeaders(token1))
      const messageId = getResponse.body.data.messages[1].id // Get the user message ID

      // Try to delete with second user
      const deleteResponse = await request(testApp)
        .delete(`/api/v1/messages/${messageId}`)
        .set(buildAuthorizationHeaders(token2))

      expect(deleteResponse.status).toBe(404)
      expect(deleteResponse.body.data.errors[0].message).toBe('Message not found or unauthorized')

      // Verify message still exists and is not deleted for first user
      const verifyResponse = await request(testApp).get('/api/v1/messages').set(buildAuthorizationHeaders(token1))
      const message = verifyResponse.body.data.messages.find((m) => m.id === messageId)
      expect(message).toBeDefined()
      expect(message.content).toBe('Test message') // Content should still be present
    })

    test('cannot delete already deleted message', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      // Create a message
      const createResponse = await request(testApp)
        .post('/api/v1/messages')
        .set(buildAuthorizationHeaders(token))
        .send({
          content: 'Test message',
          role: 'user',
          motherLanguage: LangCode.ENGLISH,
          studyLanguage: LangCode.ENGLISH,
          personality: null,
          voiceOption: VOICE_OF_THE_USER,
        })

      expect(createResponse.status).toBe(200)

      // Get message ID
      const getResponse = await request(testApp).get('/api/v1/messages').set(buildAuthorizationHeaders(token))
      const messageId = getResponse.body.data.messages[1].id

      // Delete first time
      const firstDeleteResponse = await request(testApp)
        .delete(`/api/v1/messages/${messageId}`)
        .set(buildAuthorizationHeaders(token))

      expect(firstDeleteResponse.status).toBe(200)

      // Try to delete second time
      const secondDeleteResponse = await request(testApp)
        .delete(`/api/v1/messages/${messageId}`)
        .set(buildAuthorizationHeaders(token))

      expect(secondDeleteResponse.status).toBe(404)
      expect(secondDeleteResponse.body.data.errors[0].message).toBe('Message not found or unauthorized')
    })
  })
})
