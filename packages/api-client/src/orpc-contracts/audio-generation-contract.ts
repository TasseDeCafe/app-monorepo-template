import { oc } from '@orpc/contract'
import { z } from 'zod'
import { DialectCode, SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import { isEmoji } from '@yourbestaccent/core/utils/text-utils'
import { alignmentDataSchema } from '@yourbestaccent/core/common-types/alignment-types'

const MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS = 1000

// Common error schemas
const errorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
    })
  ),
})

export enum CustomVoice {
  NAMI = 'Nami', // 20yo woman
  WELA = 'Wela', // 40yo+ woman
  SIME = 'Sime', // 20yo man
  LATU = 'Latu', // 40yo+ man
}

export const VOICE_OF_THE_USER = '--voice-of-the-user--'
export const voiceOptionSchema = z.union([z.enum(CustomVoice), z.literal(VOICE_OF_THE_USER)])
export type VoiceOption = z.infer<typeof voiceOptionSchema>

const GetGenerateAudioDataSchema = z.union([
  z.object({
    audio: z.string(),
    alignment: alignmentDataSchema,
    hasAlignment: z.literal(true),
  }),
  z.object({
    audio: z.string(),
    hasAlignment: z.literal(false),
  }),
])

export type GetGenerateAudioData = z.infer<typeof GetGenerateAudioDataSchema>

const GetGeneratedAudioWordDataSchema = z.object({
  audio: z.string(),
})

export type GetGeneratedAudioWordData = z.infer<typeof GetGeneratedAudioWordDataSchema>

const createNoEmojiString = (minLength = 1, maxLength?: number) => {
  let schema = z.string().min(minLength)
  if (maxLength) {
    schema = schema.max(maxLength)
  }
  return schema.refine(
    (text) => {
      const chars = [...text]
      return !chars.some((char) => isEmoji(char))
    },
    {
      message: 'Text cannot contain emoji characters',
    }
  )
}

export const audioGenerationContract = {
  generateAudio: oc
    .route({
      method: 'POST',
      path: '/audio-generation/text',
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
        text: createNoEmojiString(1, MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS),
        language: z.enum(SUPPORTED_STUDY_LANGUAGES),
        dialect: z.enum(DialectCode),
        voiceOption: voiceOptionSchema,
      })
    )
    .output(
      z.object({
        data: GetGenerateAudioDataSchema,
      })
    ),

  generateAudioWord: oc
    .route({
      method: 'POST',
      path: '/audio-generation/word',
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
        word: createNoEmojiString(1, MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS),
        language: z.enum(SUPPORTED_STUDY_LANGUAGES),
        dialect: z.enum(DialectCode),
        voiceOption: voiceOptionSchema,
      })
    )
    .output(
      z.object({
        data: GetGeneratedAudioWordDataSchema,
      })
    ),
} as const