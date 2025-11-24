import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createOrGetUserWithOurApi,
  __createUserInSupabaseAndGetHisIdAndToken,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../../test/test-utils'
import { buildApp } from '../../../app'
import { __deleteAllHandledStripeEvents } from '../../../transport/database/webhook-events/handled-stripe-events-repository'
import { Express } from 'express'
import {
  DialectCode,
  LangCode,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedStudyLanguage,
} from '@yourbestaccent/core/constants/lang-codes'
import { UserSettings } from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { createDefaultSettings } from '../../../transport/database/users/users-repositoru.utils'
import { LearnedWordsInADay, WordsInLanguageCounter } from '@yourbestaccent/api-client/orpc-contracts/words-contract'
import { createUserStatsAnyExpectation } from '../../../test/user-stats-test-utils'
import {
  DEFAULT_AUDIO_SPEED,
  DEFAULT_POSITION_IN_FREQUENCY_LIST,
  DEFAULT_WORD_LENGTH,
} from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'

const getOrCreateUser = async (
  testApp: Express,
  token: string
): Promise<{
  status: number
  data: {
    hasVoice: boolean
    counters: WordsInLanguageCounter[]
    learnedWordsByDay: LearnedWordsInADay[]
    settings: UserSettings
    referral: string | null
    studyLanguage: SupportedStudyLanguage | null
    studyDialect: DialectCode | null
    motherLanguage: LangCode | null
    topics: Topic[]
    nickname: string | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    utmTerm: string | null
    utmContent: string | null
  }
}> => {
  const response = await request(testApp).put(`/api/v1/users/me`).set(buildAuthorizationHeaders(token)).send({})

  return {
    status: response.status,
    data: response.body.data,
  }
}

const updateUserSettings = async (
  testApp: Express,
  token: string,
  settings: UserSettings
): Promise<{
  status: number
  body: {
    data: UserSettings | { errors: { message: string }[] }
  }
}> => {
  const response = await request(testApp)
    .patch(`/api/v1/users/me/settings`)
    .send(settings)
    .set(buildAuthorizationHeaders(token))

  return {
    status: response.status,
    body: response.body,
  }
}

const getUserSettings = async (
  testApp: Express,
  token: string
): Promise<{
  status: number
  body: {
    data: UserSettings | { errors: { message: string }[] }
  }
}> => {
  const response = await request(testApp).get(`/api/v1/users/me/settings`).set(buildAuthorizationHeaders(token))

  return {
    status: response.status,
    body: response.body,
  }
}

describe('users-settings-router', async () => {
  const testApp = buildApp({})

  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  test('when user is unauthenticated', async () => {
    const createResponse = await request(testApp).put('/api/v1/users/me').set({ Authorization: `Bearer wrong-token` })

    expect(createResponse.status).toBe(401)
  })

  test('create and find user', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const createResponse = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
    expect(createResponse.status).toBe(200)

    const { status, data } = await getOrCreateUser(testApp, token)

    expect(status).toBe(200)
    expect(data).toEqual({
      hasVoice: false,
      counters: [],
      learnedWordsByDay: [],
      settings: createDefaultSettings(),
      referral: null,
      motherLanguage: null,
      studyLanguage: null,
      studyDialect: null,
      dailyStudyMinutes: null,
      stats: createUserStatsAnyExpectation(expect),
      topics: [],
      nickname: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    })
  })

  test('create and find user with referral', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const createResponse = await __createOrGetUserWithOurApi({ testApp, token, referral: 'plapla' })
    expect(createResponse.status).toBe(200)

    const { status, data } = await getOrCreateUser(testApp, token)

    expect(status).toBe(200)
    expect(data).toEqual({
      hasVoice: false,
      counters: [],
      learnedWordsByDay: [],
      settings: createDefaultSettings(),
      referral: 'plapla',
      motherLanguage: null,
      studyLanguage: null,
      studyDialect: null,
      dailyStudyMinutes: null,
      topics: [],
      stats: createUserStatsAnyExpectation(expect),
      nickname: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    })
  })

  test('get user settings for a new user', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    await __createOrGetUserWithOurApi({ testApp, token, referral: '' })

    const { status, data } = await getOrCreateUser(testApp, token)

    expect(status).toBe(200)
    expect(data.settings.preferences.exercises.frequencyList.position.byLanguage).toHaveLength(
      SUPPORTED_STUDY_LANGUAGES.length
    )
    SUPPORTED_STUDY_LANGUAGES.forEach((lang) => {
      expect(data.settings.preferences.exercises.frequencyList.position.byLanguage).toContainEqual({
        language: lang,
        position: DEFAULT_POSITION_IN_FREQUENCY_LIST,
      })
    })
  })

  test('update user settings preserves all languages', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    await __createOrGetUserWithOurApi({ testApp, token, referral: '' })

    const updateEnglishSettings: UserSettings = {
      preferences: {
        exercises: {
          audioSpeed: {
            userPronunciation: DEFAULT_AUDIO_SPEED,
            clonePronunciation: DEFAULT_AUDIO_SPEED,
          },
          frequencyList: {
            exerciseLength: {
              byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                length: DEFAULT_WORD_LENGTH,
              })),
            },
            position: {
              byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                position: lang === LangCode.ENGLISH ? 15000 : DEFAULT_POSITION_IN_FREQUENCY_LIST,
              })),
            },
          },
        },
      },
    }

    const updateEnglishResponse = await updateUserSettings(testApp, token, updateEnglishSettings)
    expect(updateEnglishResponse.status).toBe(200)

    const updateSpanishSettings: UserSettings = {
      preferences: {
        exercises: {
          audioSpeed: {
            userPronunciation: DEFAULT_AUDIO_SPEED,
            clonePronunciation: DEFAULT_AUDIO_SPEED,
          },
          frequencyList: {
            exerciseLength: {
              byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                length: DEFAULT_WORD_LENGTH,
              })),
            },
            position: {
              byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                position:
                  lang === LangCode.SPANISH
                    ? 10000
                    : lang === LangCode.ENGLISH
                      ? 15000
                      : DEFAULT_POSITION_IN_FREQUENCY_LIST,
              })),
            },
          },
        },
      },
    }

    const updateSpanishResponse = await updateUserSettings(testApp, token, updateSpanishSettings)
    expect(updateSpanishResponse.status).toBe(200)

    const { status, data } = await getOrCreateUser(testApp, token)

    expect(status).toBe(200)
    expect(data.settings.preferences.exercises.frequencyList.position.byLanguage).toHaveLength(
      SUPPORTED_STUDY_LANGUAGES.length
    )
    SUPPORTED_STUDY_LANGUAGES.forEach((lang) => {
      expect(data.settings.preferences.exercises.frequencyList.position.byLanguage).toContainEqual({
        language: lang,
        position:
          lang === LangCode.ENGLISH ? 15000 : lang === LangCode.SPANISH ? 10000 : DEFAULT_POSITION_IN_FREQUENCY_LIST,
      })
    })
  })

  test('update settings for non-existent user', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const newSettings: UserSettings = {
      preferences: {
        exercises: {
          audioSpeed: {
            userPronunciation: DEFAULT_AUDIO_SPEED,
            clonePronunciation: DEFAULT_AUDIO_SPEED,
          },
          frequencyList: {
            exerciseLength: {
              byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                length: DEFAULT_WORD_LENGTH,
              })),
            },
            position: {
              byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                language: lang,
                position: DEFAULT_POSITION_IN_FREQUENCY_LIST,
              })),
            },
          },
        },
      },
    }

    const { status, body } = await updateUserSettings(testApp, token, newSettings)

    expect(status).toBe(500)

    const errorData = body.data as { errors: { message: string }[] }
    expect(errorData.errors).toEqual([{ message: 'Failed to update settings' }])
  })

  test('get user settings for existing user', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    await __createOrGetUserWithOurApi({ testApp, token, referral: null })

    const { status, body } = await getUserSettings(testApp, token)

    expect(status).toBe(200)
    expect(body.data).toEqual(createDefaultSettings())

    const data = body.data as UserSettings
    expect(data.preferences.exercises.frequencyList.position.byLanguage).toHaveLength(SUPPORTED_STUDY_LANGUAGES.length)
    SUPPORTED_STUDY_LANGUAGES.forEach((lang) => {
      expect(data.preferences.exercises.frequencyList.position.byLanguage).toContainEqual({
        language: lang,
        position: DEFAULT_POSITION_IN_FREQUENCY_LIST,
      })
    })
  })

  test('get user settings for non-existent user returns 404', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()

    const { status, body } = await getUserSettings(testApp, token)
    expect(status).toBe(404)

    const errorData = body.data as { errors: { message: string }[] }
    expect(errorData.errors).toEqual([{ message: 'User settings not found' }])
  })
})
