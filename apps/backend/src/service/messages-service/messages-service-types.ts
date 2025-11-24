import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'

import { VoiceOption } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'

export type ServiceLayerMessage =
  | {
      id: number
      content: string
      role: 'user'
      language: LangCode
      created_at: string
      isDeleted: false
    }
  | {
      id: number
      content: null
      role: 'user'
      language: LangCode
      created_at: string
      isDeleted: true
    }
  | {
      id: number
      content: string
      role: 'bot'
      language: SupportedStudyLanguage
      created_at: string
      isDeleted: false
    }
  | {
      id: number
      content: null
      role: 'bot'
      language: SupportedStudyLanguage
      created_at: string
      isDeleted: true
    }

export type CreateMessageResult =
  | {
      isSuccess: true
      crypticCode: null
      aiResponse: string
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export type RetrieveMessagesResult =
  | {
      isSuccess: true
      messages: ServiceLayerMessage[]
      nextCursor: string | null
    }
  | {
      isSuccess: false
      crypticCode: string
      nextCursor: null
    }

export interface MessagesServiceInterface {
  createMessage: (
    userId: string,
    content: string,
    motherLanguage: LangCode,
    studyLanguage: SupportedStudyLanguage,
    personality: PersonalityCode | null,
    voiceOption: VoiceOption
  ) => Promise<CreateMessageResult>
  retrieveMessages: (userId: string, cursor?: string, limit?: number) => Promise<RetrieveMessagesResult>
}
