import { LangCode } from '@yourbestaccent/core/constants/lang-codes'

export type DbMessageRole = 'bot' | 'user'

export type DbMessage = {
  id: number
  content: string | null
  role: DbMessageRole
  language: LangCode
  created_at: string
  deleted_at: string | null
}

export type DbRetrieveMessagesResult =
  | {
      isSuccess: true
      messages: DbMessage[]
      nextCursor: string | null
    }
  | {
      isSuccess: false
      messages: null
      nextCursor: null
    }
