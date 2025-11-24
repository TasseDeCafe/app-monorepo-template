import { MessagesRepositoryInterface } from '../../transport/database/messages/messages-repository-interface'
import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { GenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import { LlmLayerMessage } from '../../transport/third-party/llms/generic-llm/get-tutor-response/get-tutor-response'
import { DbRetrieveMessagesResult } from '../../transport/database/messages/messages-repository-types'
import { CreateMessageResult, MessagesServiceInterface, RetrieveMessagesResult } from './messages-service-types'
import { mapDbMessagesToNonEmptyLlmLayerMessages, mapDbMessageToServiceLayerMessage } from './messages-service-mapper'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'

import { VoiceOption } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'

const createMessageFailureResult = (crypticCode: string): CreateMessageResult => ({
  isSuccess: false,
  crypticCode,
})

export const MessagesService = (
  messagesRepository: MessagesRepositoryInterface,
  genericLlmApi: GenericLlmApi
): MessagesServiceInterface => {
  const retrieveMessages = async (
    userId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<RetrieveMessagesResult> => {
    const result: DbRetrieveMessagesResult = await messagesRepository.retrieveMessages(userId, cursor, limit)
    if (!result.isSuccess) {
      return {
        isSuccess: false,
        crypticCode: '110',
        nextCursor: null,
      }
    }
    return {
      isSuccess: true,
      messages: result.messages.map(mapDbMessageToServiceLayerMessage),
      nextCursor: result.nextCursor,
    }
  }

  const createMessage = async (
    userId: string,
    content: string,
    motherLanguage: LangCode,
    studyLanguage: SupportedStudyLanguage,
    personality: PersonalityCode | null,
    voiceOption: VoiceOption
  ): Promise<CreateMessageResult> => {
    const NUMBER_OF_MESSAGES_TO_SEND_TO_LLM = 30
    const retrieveMessagesResults: DbRetrieveMessagesResult = await messagesRepository.retrieveMessages(
      userId,
      undefined,
      NUMBER_OF_MESSAGES_TO_SEND_TO_LLM
    )
    if (!retrieveMessagesResults.isSuccess) {
      return createMessageFailureResult('10')
    }

    const now = new Date()
    const currentTimestamp = now.toISOString().replace('T', ' ').substring(0, 19)

    const userMessage: LlmLayerMessage = {
      content,
      role: 'user',
      language: motherLanguage,
      timestamp: currentTimestamp,
    }

    const response: string | null = await genericLlmApi.getTutorResponse(
      [userMessage, ...mapDbMessagesToNonEmptyLlmLayerMessages(retrieveMessagesResults.messages)],
      motherLanguage,
      studyLanguage,
      personality,
      voiceOption
    )
    if (!response) {
      return createMessageFailureResult('20')
    }

    const result = await messagesRepository.createUserAndBotMessage(userId, content, response, studyLanguage)

    if (!result) {
      return createMessageFailureResult('30')
    }

    return {
      isSuccess: true,
      crypticCode: null,
      aiResponse: response,
    }
  }

  return {
    retrieveMessages,
    createMessage,
  }
}
