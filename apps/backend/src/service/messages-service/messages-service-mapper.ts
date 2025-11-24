import { ServiceLayerMessage } from './messages-service-types'
import { DbMessage } from '../../transport/database/messages/messages-repository-types'
import { LlmLayerMessage } from '../../transport/third-party/llms/generic-llm/get-tutor-response/get-tutor-response'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'

export const mapDbMessageToServiceLayerMessage = (dbMessage: DbMessage): ServiceLayerMessage => {
  if (dbMessage.deleted_at !== null) {
    if (dbMessage.role === 'bot') {
      return {
        id: dbMessage.id,
        content: null,
        role: 'bot',
        language: dbMessage.language as SupportedStudyLanguage, // dangerous cast, instead of this we could have a constraint on the db,
        created_at: dbMessage.created_at,
        isDeleted: true,
      }
    } else {
      return {
        id: dbMessage.id,
        content: null,
        role: 'user',
        language: dbMessage.language,
        created_at: dbMessage.created_at,
        isDeleted: true,
      }
    }
  } else {
    if (dbMessage.role === 'bot') {
      return {
        id: dbMessage.id,
        content: dbMessage.content ?? '',
        role: 'bot',
        language: dbMessage.language as SupportedStudyLanguage, // dangerous cast, instead of this we could have a constraint on the db,
        created_at: dbMessage.created_at,
        isDeleted: false,
      }
    } else {
      return {
        id: dbMessage.id,
        content: dbMessage.content ?? '',
        role: 'user',
        language: dbMessage.language,
        created_at: dbMessage.created_at,
        isDeleted: false,
      }
    }
  }
}

export const mapDbMessagesToNonEmptyLlmLayerMessages = (dbMessages: DbMessage[]): LlmLayerMessage[] => {
  const llmLayerMessages: LlmLayerMessage[] = []
  for (const dbMessage of dbMessages) {
    if (dbMessage.content !== null) {
      llmLayerMessages.push({
        content: dbMessage.content,
        role: dbMessage.role,
        language: dbMessage.language,
        timestamp: dbMessage.created_at,
      })
    }
  }
  return llmLayerMessages
}
