import { oc } from '@orpc/contract'
import { z } from 'zod'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'

export const USER_SETTINGS_PATH = '/users/me/settings' as const

export type AudioSpeedType = 'clonePronunciation' | 'userPronunciation'

export const DEFAULT_AUDIO_SPEED = 1.0
export const DEFAULT_POSITION_IN_FREQUENCY_LIST = 5000
export const DEFAULT_WORD_LENGTH = 15
export const MIN_EXERCISE_WORD_LENGTH = 5
export const MAX_EXERCISE_WORD_LENGTH = 40
export const MAX_NUMBER_OF_WORDS_IN_FREQUENCY_LIST = 50000
export const MIN_AUDIO_SPEED = 0.75
export const MAX_AUDIO_SPEED = 1.25

export const UserSettingsSchema = z.object({
  preferences: z.object({
    exercises: z.object({
      audioSpeed: z.object({
        clonePronunciation: z.number().min(MIN_AUDIO_SPEED).max(MAX_AUDIO_SPEED).default(DEFAULT_AUDIO_SPEED),
        userPronunciation: z.number().min(MIN_AUDIO_SPEED).max(MAX_AUDIO_SPEED).default(DEFAULT_AUDIO_SPEED),
      }),
      frequencyList: z.object({
        exerciseLength: z.object({
          byLanguage: z
            .array(
              z.object({
                language: z.enum(SUPPORTED_STUDY_LANGUAGES),
                length: z
                  .number()
                  .min(MIN_EXERCISE_WORD_LENGTH)
                  .max(MAX_EXERCISE_WORD_LENGTH)
                  .default(DEFAULT_WORD_LENGTH),
              })
            )
            .default(
              SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                length: DEFAULT_WORD_LENGTH,
              }))
            ),
        }),
        position: z.object({
          byLanguage: z
            .array(
              z.object({
                language: z.enum(SUPPORTED_STUDY_LANGUAGES),
                position: z.number().default(DEFAULT_POSITION_IN_FREQUENCY_LIST),
              })
            )
            .default(
              SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                position: DEFAULT_POSITION_IN_FREQUENCY_LIST,
              }))
            ),
        }),
      }),
    }),
  }),
})
export type UserSettings = z.infer<typeof UserSettingsSchema>
export const userSettingsContract = {
  getSettings: oc
    .route({
      method: 'GET',
      path: USER_SETTINGS_PATH,
      successStatus: 200,
    })
    .errors({
      NOT_FOUND: {
        status: 404,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
            })
          ),
        }),
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
            })
          ),
        }),
      },
    })
    .output(
      z.object({
        data: UserSettingsSchema,
      })
    ),
  updateSettings: oc
    .route({
      method: 'PATCH',
      path: USER_SETTINGS_PATH,
      successStatus: 200,
    })
    .errors({
      UNAUTHORIZED: {
        status: 401,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
            })
          ),
        }),
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: z.object({
          errors: z.array(
            z.object({
              message: z.string(),
            })
          ),
        }),
      },
    })
    .input(UserSettingsSchema)
    .output(
      z.object({
        data: UserSettingsSchema,
      })
    ),
} as const
