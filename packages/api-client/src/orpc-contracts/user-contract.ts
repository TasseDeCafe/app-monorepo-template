import { oc } from '@orpc/contract'
import { z } from 'zod'
import * as naughtyWords from 'naughty-words'

import {
  DialectCode,
  LangCode,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedStudyLanguage,
} from '@yourbestaccent/core/constants/lang-codes'
import { AVAILABLE_TOPICS, Topic } from '@yourbestaccent/core/constants/topics'
import { MAX_DAILY_STUDY_MINUTES, MIN_DAILY_STUDY_MINUTES } from '@yourbestaccent/core/constants/daily-study-constants'
import { LearnedWordsInADay, WordsInLanguageCounter } from './words-contract'
import { UserSettings } from './user-settings-contract'
import { audioUploadSchema } from './common/audio-upload-schema'
import { BackendErrorResponseSchema } from './common/error-response-schema'

export { AUDIO_TOO_SHORT_MESSAGE } from './common/audio-upload-schema'

export const USER_PATH = '/users/me' as const

const containsProfanity = (text: string): boolean => {
  const lowercaseText = text.toLowerCase()

  return Object.keys(naughtyWords).some((langCode) => {
    const words = naughtyWords[langCode as keyof typeof naughtyWords]
    return Array.isArray(words) && words.some((word: string) => lowercaseText.includes(word.toLowerCase()))
  })
}

export const NicknameValidationSchema = z
  .string()
  .min(3, 'Nickname must be at least 3 characters')
  .max(20, 'Nickname must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores and hyphens are allowed')
  .refine((val) => !containsProfanity(val), 'This nickname is not allowed')

export const XpObtainedInADaySchema = z.object({
  date: z.string(),
  xpOnDate: z.number(),
})
export type XpObtainedInADay = z.infer<typeof XpObtainedInADaySchema>

export const UserStatsSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  totalDaysLearned: z.number(),
  numberOfDaysOfNextStreakBadge: z.number(),
  numberOfAchievedStreakBadges: z.number(),
  xpEarnedToday: z.number(),
  totalXp: z.number(),
})
export type UserStats = z.infer<typeof UserStatsSchema>

const UserDataSchema = z.object({
  hasVoice: z.boolean(),
  counters: z.array(z.custom<WordsInLanguageCounter>()),
  learnedWordsByDay: z.array(z.custom<LearnedWordsInADay>()),
  stats: UserStatsSchema,
  settings: z.custom<UserSettings>(),
  referral: z.string().nullable(),
  studyLanguage: z.custom<SupportedStudyLanguage>().nullable(),
  studyDialect: z.custom<DialectCode>().nullable(),
  dailyStudyMinutes: z.number().nullable(),
  motherLanguage: z.custom<LangCode>().nullable(),
  topics: z.array(z.custom<Topic>()),
  nickname: z.string().nullable(),
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  utmTerm: z.string().nullable(),
  utmContent: z.string().nullable(),
})

export const userContract = {
  getUser: oc
    .route({
      method: 'GET',
      path: USER_PATH,
      successStatus: 200,
    })
    .errors({
      NOT_FOUND: {
        status: 404,
        data: BackendErrorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .output(
      z.object({
        data: UserDataSchema,
      })
    ),

  putUser: oc
    .route({
      method: 'PUT',
      path: USER_PATH,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        referral: z.string().nullable().optional(),
        utmSource: z.string().nullable().optional(),
        utmMedium: z.string().nullable().optional(),
        utmCampaign: z.string().nullable().optional(),
        utmTerm: z.string().nullable().optional(),
        utmContent: z.string().nullable().optional(),
      })
    )
    .output(
      z.object({
        data: UserDataSchema,
      })
    ),

  patchUser: oc
    .route({
      method: 'PATCH',
      path: USER_PATH,
      successStatus: 200,
    })
    .errors({
      AUDIO_VALIDATION_ERROR: {
        status: 400,
        data: BackendErrorResponseSchema,
      },
      BAD_REQUEST: {
        status: 400,
        data: BackendErrorResponseSchema,
      },
      NOT_FOUND: {
        status: 404,
        data: BackendErrorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        audio: audioUploadSchema,
        langCode: z.enum(LangCode),
      })
    )
    .output(
      z.object({
        data: z.object({
          hasVoice: z.boolean(),
        }),
      })
    ),

  patchMotherLanguage: oc
    .route({
      method: 'PATCH',
      path: '/users/me/mother_language',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        motherLanguage: z.enum(LangCode).nullable(),
      })
    )
    .output(
      z.object({
        data: z.object({
          motherLanguage: z.enum(LangCode).nullable(),
        }),
      })
    ),

  patchStudyLanguage: oc
    .route({
      method: 'PATCH',
      path: '/users/me/study_language',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
      })
    )
    .output(
      z.object({
        data: z.object({
          studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
        }),
      })
    ),

  patchStudyDialect: oc
    .route({
      method: 'PATCH',
      path: '/users/me/study_dialect',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        studyDialect: z.enum(DialectCode),
      })
    )
    .output(
      z.object({
        data: z.object({
          studyDialect: z.enum(DialectCode).nullable(),
        }),
      })
    ),

  patchStudyLanguageAndDialect: oc
    .route({
      method: 'PATCH',
      path: '/users/me/study_language_and_study_dialect',
      successStatus: 200,
    })
    .errors({
      BAD_REQUEST: {
        status: 400,
        data: BackendErrorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
        studyDialect: z.enum(DialectCode),
      })
    )
    .output(
      z.object({
        data: z.object({
          studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES),
          studyDialect: z.enum(DialectCode),
        }),
      })
    ),

  getTopics: oc
    .route({
      method: 'GET',
      path: '/users/me/topics',
      successStatus: 200,
    })
    .errors({
      NOT_FOUND: {
        status: 404,
        data: BackendErrorResponseSchema,
      },
    })
    .output(
      z.object({
        data: z.object({
          topics: z.array(z.enum(AVAILABLE_TOPICS)),
        }),
      })
    ),

  patchTopics: oc
    .route({
      method: 'PATCH',
      path: '/users/me/topics',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        topics: z.array(z.enum(AVAILABLE_TOPICS)),
      })
    )
    .output(
      z.object({
        data: z.object({
          topics: z.array(z.enum(AVAILABLE_TOPICS)),
        }),
      })
    ),

  patchDailyStudyMinutes: oc
    .route({
      method: 'PATCH',
      path: '/users/me/daily_study_minutes',
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        dailyStudyMinutes: z
          .number()
          .int()
          .min(MIN_DAILY_STUDY_MINUTES, `Daily study minutes must be at least ${MIN_DAILY_STUDY_MINUTES}`)
          .max(MAX_DAILY_STUDY_MINUTES, `Daily study minutes must be at most ${MAX_DAILY_STUDY_MINUTES}`),
      })
    )
    .output(
      z.object({
        data: z.object({
          dailyStudyMinutes: z.number(),
        }),
      })
    ),

  getNickname: oc
    .route({
      method: 'GET',
      path: '/users/me/nickname',
      successStatus: 200,
    })
    .errors({
      NOT_FOUND: {
        status: 404,
        data: BackendErrorResponseSchema,
      },
    })
    .output(
      z.object({
        data: z.object({
          nickname: z.string().nullable(),
        }),
      })
    ),

  patchNickname: oc
    .route({
      method: 'PATCH',
      path: '/users/me/nickname',
      successStatus: 200,
    })
    .errors({
      BAD_REQUEST: {
        status: 400,
        data: BackendErrorResponseSchema,
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: BackendErrorResponseSchema,
      },
    })
    .input(
      z.object({
        nickname: NicknameValidationSchema,
      })
    )
    .output(
      z.object({
        data: z.object({
          nickname: z.string(),
        }),
      })
    ),

  getNicknameAvailability: oc
    .route({
      method: 'GET',
      path: '/users/me/nickname/availability',
      successStatus: 200,
    })
    .input(
      z.object({
        nickname: NicknameValidationSchema,
      })
    )
    .output(
      z.object({
        data: z.object({
          isAvailable: z.boolean(),
          message: z.string(),
        }),
      })
    ),

  getUserStats: oc
    .route({
      method: 'GET',
      path: '/users/me/stats',
      successStatus: 200,
    })
    .errors({
      NOT_FOUND: {
        status: 404,
        data: BackendErrorResponseSchema,
      },
    })
    .output(
      z.object({
        data: UserStatsSchema,
      })
    ),
} as const
