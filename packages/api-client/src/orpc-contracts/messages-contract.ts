import { InferContractRouterInputs, oc } from '@orpc/contract'
import { z } from 'zod'
import { LangCode, SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'

import { voiceOptionSchema } from './audio-generation-contract'

export const NonDeletedUserMessageSchema = z.object({
  id: z.number(),
  content: z.string().min(1),
  role: z.literal('user'),
  language: z.enum(LangCode),
  created_at: z.string(),
  isDeleted: z.literal(false),
})
export const DeletedUserMessageSchema = z.object({
  id: z.number(),
  content: z.null(),
  role: z.literal('user'),
  language: z.enum(LangCode),
  created_at: z.string(),
  isDeleted: z.literal(true),
})

const langCodeEnum = z.enum(LangCode)

export const NonDeletedBotMessageSchema = z.object({
  id: z.number(),
  content: z.string().min(1),
  role: z.literal('bot'),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
  created_at: z.string(),
  isDeleted: z.literal(false),
})
export const DeletedBotMessageSchema = z.object({
  id: z.number(),
  content: z.null(),
  role: z.literal('bot'),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
  created_at: z.string(),
  isDeleted: z.literal(true),
})
export type NonDeletedBotMessage = z.infer<typeof NonDeletedBotMessageSchema>
export type NonDeletedUserMessage = z.infer<typeof NonDeletedUserMessageSchema>

const messageSchema = z.union([
  NonDeletedUserMessageSchema,
  DeletedUserMessageSchema,
  NonDeletedBotMessageSchema,
  DeletedBotMessageSchema,
])

// Common error schemas
const errorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
    })
  ),
})

export enum PersonalityCode {
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  HUMOROUS = 'humorous',
  STRICT = 'strict',
  ENCOURAGING = 'encouraging',
  MISCHIEVOUS = 'mischievous',
  JOKER = 'joker',
  ANGRY = 'angry',
  SAD = 'sad',
  CUTE = 'cute',
  INTROVERT = 'introvert',
  CRAZY = 'crazy',
}

export const messagesContract = {
  createMessage: oc
    .route({
      method: 'POST',
      path: '/messages',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        content: z.string(),
        role: z.enum(['user']), // only a user message can be created from the frontend
        motherLanguage: langCodeEnum,
        studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
        personality: z.enum(PersonalityCode).nullable(),
        voiceOption: voiceOptionSchema,
      })
    )
    .output(
      z.object({
        data: z.object({
          success: z.boolean(),
          aiResponse: z.string(),
        }),
      })
    ),

  getMessages: oc
    .route({
      method: 'GET',
      path: '/messages',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(1000).optional(),
      })
    )
    .output(
      z.object({
        data: z.object({
          messages: z.array(messageSchema),
          nextCursor: z.string().nullable(),
        }),
      })
    ),

  softDeleteMessage: oc
    .route({
      method: 'DELETE',
      path: '/messages/{messageId}',
      successStatus: 200,
    })
    .errors({
      NOT_FOUND: {
        status: 404,
        data: errorResponseSchema,
      },
    })
    .input(
      z.object({
        messageId: z.coerce.number().int(),
      })
    )
    .output(
      z.object({
        data: z.object({
          success: z.boolean(),
        }),
      })
    ),
} as const

export type Inputs = InferContractRouterInputs<typeof messagesContract>
export type CreateMessageBody = Inputs['createMessage']
export type Message = z.infer<typeof messageSchema>