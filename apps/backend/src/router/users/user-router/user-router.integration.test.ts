import { afterAll, beforeEach, describe, expect, it, test } from 'vitest'
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
import fs from 'fs'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { CustomerioApi, MockCustomerioApi } from '../../../transport/third-party/customerio/customerio-api'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { createDefaultSettings } from '../../../transport/database/users/users-repositoru.utils'
import { createEmptyUserStats, createUserStatsAnyExpectation } from '../../../test/user-stats-test-utils'

const updateUserStudyLanguage = async (
  testApp: Express,
  token: string,
  studyLanguage: LangCode
): Promise<{
  status: number
  data: { studyLanguage: LangCode }
}> => {
  const response = await request(testApp)
    .patch(`/api/v1/users/me/study_language`)
    .send({ studyLanguage })
    .set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
  }
}

const updateUserStudyDialect = async (
  testApp: Express,
  token: string,
  studyDialect: DialectCode
): Promise<{
  status: number
  data: { studyDialect: DialectCode }
}> => {
  const response = await request(testApp)
    .patch(`/api/v1/users/me/study_dialect`)
    .send({ studyDialect })
    .set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
  }
}

const updateUserMotherLanguage = async (
  testApp: Express,
  token: string,
  motherLanguage: LangCode
): Promise<{
  status: number
  data: { motherLanguage: LangCode }
}> => {
  const response = await request(testApp)
    .patch(`/api/v1/users/me/mother_language`)
    .send({ motherLanguage })
    .set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
  }
}

const updateUserStudyLanguageAndDialect = async (
  testApp: Express,
  token: string,
  studyLanguage: LangCode,
  studyDialect: DialectCode
): Promise<{
  status: number
  data: { studyLanguage: LangCode; studyDialect: DialectCode }
}> => {
  const response = await request(testApp)
    .patch(`/api/v1/users/me/study_language_and_study_dialect`)
    .set(buildAuthorizationHeaders(token))
    .send({ studyLanguage, studyDialect })
  return {
    status: response.status,
    data: response.body.data,
  }
}

const updateUserTopics = async (
  app: Express,
  token: string,
  topics: Topic[]
): Promise<{ status: number; data: { topics: Topic[] } }> => {
  const response = await request(app)
    .patch('/api/v1/users/me/topics')
    .send({ topics })
    .set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
  }
}

const getUserTopics = async (
  app: Express,
  token: string
): Promise<{
  status: number
  data: { topics?: Topic[]; errors?: { message: string }[] }
  errors?: unknown[]
}> => {
  const response = await request(app).get('/api/v1/users/me/topics').set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
    errors: response.body.errors,
  }
}

const getUserNickname = async (
  app: Express,
  token: string
): Promise<{
  status: number
  data: { nickname?: string | null; errors?: { message: string }[] }
  errors?: unknown[]
}> => {
  const response = await request(app).get('/api/v1/users/me/nickname').set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
    errors: response.body.errors,
  }
}

const updateUserDailyStudyMinutes = async (
  app: Express,
  token: string,
  dailyStudyMinutes: number
): Promise<{ status: number; data: { dailyStudyMinutes: number } }> => {
  const response = await request(app)
    .patch('/api/v1/users/me/daily_study_minutes')
    .send({ dailyStudyMinutes })
    .set(buildAuthorizationHeaders(token))
  return {
    status: response.status,
    data: response.body.data,
  }
}

describe('users-router', async () => {
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

    const { status, body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })

    expect(status).toBe(200)
    expect(body.data).toEqual({
      hasVoice: false,
      counters: [],
      learnedWordsByDay: [],
      stats: createEmptyUserStats(),
      settings: createDefaultSettings(),
      referral: null,
      motherLanguage: null,
      studyLanguage: null,
      studyDialect: null,
      dailyStudyMinutes: null,
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

    const { status, body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })

    expect(status).toBe(200)
    expect(body.data).toEqual({
      hasVoice: false,
      counters: [],
      learnedWordsByDay: [],
      stats: createEmptyUserStats(),
      settings: createDefaultSettings(),
      referral: 'plapla',
      motherLanguage: null,
      studyLanguage: null,
      studyDialect: null,
      dailyStudyMinutes: null,
      topics: [],
      nickname: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    })
  })

  test('cannot clone voice if audio is missing', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    await __createOrGetUserWithOurApi({ testApp, token, referral: null })
    const updateResponse = await request(testApp)
      .patch(`/api/v1/users/me`)
      .field('langCode', LangCode.ENGLISH)
      .set(buildAuthorizationHeaders(token))
    expect(updateResponse.status).toBe(400)
    expect(updateResponse.body.message).toBe('Input validation failed')
  })

  test('cannot update non-existent user', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')
    const updateResponse = await request(testApp)
      .patch(`/api/v1/users/me`)
      .field('langCode', LangCode.ENGLISH)
      .attach('audio', audioBuffer, {
        filename: 'some name to make upload work',
      })
      .set(buildAuthorizationHeaders(token))
    expect(updateResponse.status).toBe(404)
  })

  test('create, update and find user', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const createResponse = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
    expect(createResponse.status).toBe(200)
    const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')
    const updateResponse = await request(testApp)
      .patch(`/api/v1/users/me`)
      .field('langCode', LangCode.ENGLISH)
      .attach('audio', audioBuffer, {
        filename: 'some name to make upload work',
      })
      .set(buildAuthorizationHeaders(token))
    expect(updateResponse.status).toBe(200)

    const { status, body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })

    expect(status).toBe(200)
    expect(body.data).toEqual({
      hasVoice: true,
      counters: [],
      learnedWordsByDay: [],
      stats: createEmptyUserStats(),
      settings: createDefaultSettings(),
      referral: null,
      motherLanguage: null,
      studyLanguage: null,
      studyDialect: null,
      dailyStudyMinutes: null,
      topics: [],
      nickname: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    })
  })

  test('cloning voice second time returns 404', async () => {
    const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
    const createResponse = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
    expect(createResponse.status).toBe(200)
    const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')
    const updateResponse1 = await request(testApp)
      .patch(`/api/v1/users/me`)
      .field('langCode', LangCode.ENGLISH)
      .attach('audio', audioBuffer, {
        filename: 'some name to make upload work',
      })
      .set(buildAuthorizationHeaders(token))
    const updateResponse2 = await request(testApp)
      .patch(`/api/v1/users/me`)
      .field('langCode', LangCode.ENGLISH)
      .attach('audio', audioBuffer, {
        filename: 'some name to make upload work',
      })
      .set(buildAuthorizationHeaders(token))
    expect(updateResponse1.status).toBe(200)
    expect(updateResponse2.status).toBe(404)
  })

  describe('update user study language', () => {
    test('successfully update user study language', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const { status, data } = await updateUserStudyLanguage(testApp, token, LangCode.SPANISH)

      expect(status).toBe(200)
      expect(data.studyLanguage).toBe(LangCode.SPANISH)

      const response = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      expect(response.body.data.studyLanguage).toBe(LangCode.SPANISH)
    })

    test('fail to update user study language with invalid language', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .patch(`/api/v1/users/me/study_language`) // Changed from .put to .patch
        .send({ studyLanguage: 'INVALID_LANGUAGE' })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })
  })

  describe('update user study dialect', () => {
    test('successfully update user study dialect', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const { status, data } = await updateUserStudyDialect(testApp, token, DialectCode.CASTILIAN_SPANISH)

      expect(status).toBe(200)
      expect(data.studyDialect).toBe(DialectCode.CASTILIAN_SPANISH)

      const response = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      expect(response.body.data.studyDialect).toBe(DialectCode.CASTILIAN_SPANISH)
    })

    test('fail to update user study dialect with invalid dialect', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .patch(`/api/v1/users/me/study_dialect`) // Changed from .put to .patch
        .send({ studyDialect: 'INVALID_DIALECT' })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })
  })

  describe('update user mother language', () => {
    test('successfully update user mother language', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const { status, data } = await updateUserMotherLanguage(testApp, token, LangCode.ENGLISH)

      expect(status).toBe(200)
      expect(data.motherLanguage).toBe(LangCode.ENGLISH)

      const response = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      expect(response.body.data.motherLanguage).toBe(LangCode.ENGLISH)
    })

    test('fail to update user mother language with invalid language', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .patch(`/api/v1/users/me/mother_language`)
        .send({ motherLanguage: 'INVALID_LANGUAGE' })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })
  })

  describe('update user study language and dialect', () => {
    test('update study language to another language resets the dialect', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      await updateUserStudyLanguage(testApp, token, LangCode.SPANISH)
      await updateUserStudyDialect(testApp, token, DialectCode.CASTILIAN_SPANISH)
      await updateUserStudyLanguage(testApp, token, LangCode.ENGLISH)
      const { body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      expect(body.data.studyLanguage).toBe(LangCode.ENGLISH)
      expect(body.data.studyDialect).toBe(null)
    })

    test('update study language to the same language does not reset the dialect', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      await updateUserStudyLanguage(testApp, token, LangCode.SPANISH)
      await updateUserStudyDialect(testApp, token, DialectCode.CASTILIAN_SPANISH)
      await updateUserStudyLanguage(testApp, token, LangCode.SPANISH)
      const { body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      expect(body.data.studyLanguage).toBe(LangCode.SPANISH)
      expect(body.data.studyDialect).toBe(DialectCode.CASTILIAN_SPANISH)
    })

    test('successfully update user study language and dialect', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const { status, data } = await updateUserStudyLanguageAndDialect(
        testApp,
        token,
        LangCode.SPANISH,
        DialectCode.CASTILIAN_SPANISH
      )

      expect(status).toBe(200)
      expect(data.studyLanguage).toBe(LangCode.SPANISH)
      expect(data.studyDialect).toBe(DialectCode.CASTILIAN_SPANISH)

      const response = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      expect(response.body.data.studyLanguage).toBe(LangCode.SPANISH)
      expect(response.body.data.studyDialect).toBe(DialectCode.CASTILIAN_SPANISH)
    })

    test('fail to update user study language and dialect with invalid combination', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .patch(`/api/v1/users/me/study_language_and_study_dialect`)
        .send({
          studyLanguage: LangCode.SPANISH,
          studyDialect: DialectCode.AMERICAN_ENGLISH,
        })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })

    test('fail to update user study language and dialect with invalid language', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .patch(`/api/v1/users/me/study_language_and_study_dialect`)
        .send({
          studyLanguage: 'INVALID_LANGUAGE',
          studyDialect: DialectCode.CASTILIAN_SPANISH,
        })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })

    test('fail to update user study language and dialect with invalid dialect', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .patch(`/api/v1/users/me/study_language_and_study_dialect`)
        .send({
          studyLanguage: LangCode.SPANISH,
          studyDialect: 'INVALID_DIALECT',
        })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })
  })

  describe('check nickname availability', () => {
    test('returns 200 for valid available nickname', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const response = await request(testApp)
        .get('/api/v1/users/me/nickname/availability?nickname=valid')
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({
        isAvailable: true,
        message: 'This nickname is available',
      })
    })

    test('returns 200 for taken nickname', async () => {
      const { token: token1 } = await __createUserInSupabaseAndGetHisIdAndToken('test1@email.com')
      await __createOrGetUserWithOurApi({ testApp, token: token1, referral: null })
      await request(testApp)
        .patch('/api/v1/users/me/nickname')
        .send({ nickname: 'taken' })
        .set(buildAuthorizationHeaders(token1))

      const { token: token2 } = await __createUserInSupabaseAndGetHisIdAndToken('test2@email.com')
      await __createOrGetUserWithOurApi({ testApp, token: token2, referral: null })

      const response = await request(testApp)
        .get('/api/v1/users/me/nickname/availability?nickname=taken')
        .set(buildAuthorizationHeaders(token2))

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({
        isAvailable: false,
        message: 'This nickname is already taken',
      })
    })

    test('returns 400 for nickname with invalid characters', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .get('/api/v1/users/me/nickname/availability?nickname=invalid@name')
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
      expect(response.body.data.issues[0].message).toBe('Only letters, numbers, underscores and hyphens are allowed')
    })

    test('returns 400 for nickname that is too short', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .get('/api/v1/users/me/nickname/availability?nickname=ab')
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
      expect(response.body.data.issues[0].message).toBe('Nickname must be at least 3 characters')
    })

    test('returns 400 for nickname that is too long', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .get('/api/v1/users/me/nickname/availability?nickname=thisnicknameistoolong')
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
      expect(response.body.data.issues[0].message).toBe('Nickname must be less than 20 characters')
    })

    test('returns 400 for nickname containing profanity', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token))

      const response = await request(testApp)
        .get('/api/v1/users/me/nickname/availability?nickname=fuck123')
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
      expect(response.body.data.issues[0].message).toBe('This nickname is not allowed')
    })

    test('returns 401 for unauthenticated request', async () => {
      const response = await request(testApp).get('/api/v1/users/me/nickname?nickname=test123')

      expect(response.status).toBe(401)
    })
  })

  describe('get user nickname', () => {
    it('should successfully get user nickname for existing user with nickname', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      // Set a nickname first
      const nickname = 'testuser123'
      await request(testApp).patch('/api/v1/users/me/nickname').send({ nickname }).set(buildAuthorizationHeaders(token))

      // Get nickname
      const response = await getUserNickname(testApp, token)

      expect(response.status).toBe(200)
      expect(response.data.nickname).toBe(nickname)
    })

    it('should return null nickname for existing user without nickname', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const response = await getUserNickname(testApp, token)

      expect(response.status).toBe(200)
      expect(response.data.nickname).toBe(null)
    })

    it('should return 404 for non-existent user', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()

      const response = await getUserNickname(testApp, token)

      expect(response.status).toBe(404)
      expect(response.data.errors).toEqual([{ message: 'User not found' }])
    })
  })

  describe('CustomerIO Integration', () => {
    it('should identify customer when creating a new user', async () => {
      let identifyCustomerWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        identifyCustomer: async () => {
          identifyCustomerWasCalled = true
          return true
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()

      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      expect(identifyCustomerWasCalled).toBe(true)
    })

    it('should update customer when updating mother language', async () => {
      let updateCustomerWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async () => {
          updateCustomerWasCalled = true
          return true
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      await updateUserMotherLanguage(testApp, token, LangCode.ENGLISH)

      expect(updateCustomerWasCalled).toBe(true)
    })

    it('should update customer when updating study language', async () => {
      let updateCustomerWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async () => {
          updateCustomerWasCalled = true
          return true
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      await updateUserStudyLanguage(testApp, token, LangCode.SPANISH)

      expect(updateCustomerWasCalled).toBe(true)
    })

    it('should update customer when updating study dialect', async () => {
      let updateCustomerWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async () => {
          updateCustomerWasCalled = true
          return true
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      await updateUserStudyDialect(testApp, token, DialectCode.CASTILIAN_SPANISH)

      expect(updateCustomerWasCalled).toBe(true)
    })

    it('should update customer when updating nickname', async () => {
      let updateCustomerWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async () => {
          updateCustomerWasCalled = true
          return true
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      await request(testApp)
        .patch('/api/v1/users/me/nickname')
        .send({ nickname: 'testnick' })
        .set(buildAuthorizationHeaders(token))

      expect(updateCustomerWasCalled).toBe(true)
    })

    it('should update customer when voice is cloned', async () => {
      let updateCustomerWasCalled = false
      const customerioApi: CustomerioApi = {
        ...MockCustomerioApi,
        updateCustomer: async () => {
          updateCustomerWasCalled = true
          return true
        },
      }
      const testApp = buildApp({ customerioApi })
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const audioBuffer = fs.readFileSync('src/assets/audio/mock-audio.mp3')
      await request(testApp)
        .patch(`/api/v1/users/me`)
        .field('langCode', LangCode.ENGLISH)
        .attach('audio', audioBuffer, {
          filename: 'some name to make upload work',
        })
        .set(buildAuthorizationHeaders(token))

      expect(updateCustomerWasCalled).toBe(true)
    })
  })

  describe('update user topics', () => {
    it('should successfully update user topics', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const newTopics: Topic[] = ['business', 'tech', 'travel']
      const response = await updateUserTopics(testApp, token, newTopics)

      expect(response.status).toBe(200)
      expect(response.data.topics).toEqual(newTopics)

      const { body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      expect(body.data.topics).toEqual(newTopics)
    })

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(testApp)
        .patch('/api/v1/users/me/topics')
        .send({ topics: ['business'] })
        .set(buildAuthorizationHeaders('invalid-token'))

      expect(response.status).toBe(401)
    })

    it('should return 400 when topics array is invalid', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token)).send({})

      const response = await request(testApp)
        .patch('/api/v1/users/me/topics')
        .send({ topics: ['invalid-topic'] })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })

    it('should update to empty topics array', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const initialTopics: Topic[] = ['business', 'tech']
      await updateUserTopics(testApp, token, initialTopics)

      const response = await updateUserTopics(testApp, token, [])

      expect(response.status).toBe(200)
      expect(response.data.topics).toEqual([])

      const { body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      expect(body.data.topics).toEqual([])
    })
  })

  describe('get user topics', () => {
    it('should successfully get user topics for existing user', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      // Update topics first
      const topicsToSet: Topic[] = ['business', 'tech']
      await updateUserTopics(testApp, token, topicsToSet)

      // Get topics
      const response = await getUserTopics(testApp, token)

      expect(response.status).toBe(200)
      expect(response.data.topics).toEqual(topicsToSet)
    })

    it('should return 404 for non-existent user', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()

      const response = await getUserTopics(testApp, token)

      expect(response.status).toBe(404)
      expect(response.data.errors).toEqual([{ message: 'User not found' }])
    })
  })

  describe('update user daily study minutes', () => {
    it('should successfully update user daily study minutes', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const response = await updateUserDailyStudyMinutes(testApp, token, 15)

      expect(response.status).toBe(200)
      expect(response.data.dailyStudyMinutes).toBe(15)

      const { body } = await __createOrGetUserWithOurApi({ testApp, token, referral: null })
      expect(body.data.dailyStudyMinutes).toBe(15)
    })

    it('should return 400 when daily study minutes is too low', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token)).send({})

      const response = await request(testApp)
        .patch('/api/v1/users/me/daily_study_minutes')
        .send({ dailyStudyMinutes: 0 }) // Too low
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })

    it('should return 400 when daily study minutes is too high', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token)).send({})

      const response = await request(testApp)
        .patch('/api/v1/users/me/daily_study_minutes')
        .send({ dailyStudyMinutes: 241 })
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })

    it('should return 400 when daily study minutes is not an integer', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await request(testApp).put('/api/v1/users/me').set(buildAuthorizationHeaders(token)).send({})

      const response = await request(testApp)
        .patch('/api/v1/users/me/daily_study_minutes')
        .send({ dailyStudyMinutes: 15.5 }) // Not an integer
        .set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(400)
    })
  })

  describe('UTM parameters', () => {
    test('should save UTM parameters on first user creation', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      const utmParams = {
        utmSource: 'facebook',
        utmMedium: 'cpc',
        utmCampaign: 'summer_sale',
        utmTerm: 'language_learning',
        utmContent: 'top_banner',
      }

      // First create user with UTM params
      const response = await __createOrGetUserWithOurApi({
        testApp,
        token,
        referral: null,
        ...utmParams,
      })

      expect(response.status).toBe(200)
      expect(response.body.data.utmSource).toBe(utmParams.utmSource)
      expect(response.body.data.utmMedium).toBe(utmParams.utmMedium)
      expect(response.body.data.utmCampaign).toBe(utmParams.utmCampaign)
      expect(response.body.data.utmTerm).toBe(utmParams.utmTerm)
      expect(response.body.data.utmContent).toBe(utmParams.utmContent)
    })

    test('should preserve UTM parameters on subsequent calls', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      const initialUtmParams = {
        utmSource: 'facebook',
        utmMedium: 'cpc',
        utmCampaign: 'summer_sale',
        utmTerm: 'language_learning',
        utmContent: 'top_banner',
      }

      // First create user with initial UTM params
      await __createOrGetUserWithOurApi({
        testApp,
        token,
        referral: null,
        ...initialUtmParams,
      })

      // Try to update with different UTM params
      const newUtmParams = {
        utmSource: 'google',
        utmMedium: 'organic',
        utmCampaign: 'winter_sale',
        utmTerm: 'english_learning',
        utmContent: 'bottom_banner',
      }

      const response = await __createOrGetUserWithOurApi({
        testApp,
        token,
        referral: null,
        ...newUtmParams,
      })

      // Verify that the original UTM params are preserved
      expect(response.status).toBe(200)
      expect(response.body.data.utmSource).toBe(initialUtmParams.utmSource)
      expect(response.body.data.utmMedium).toBe(initialUtmParams.utmMedium)
      expect(response.body.data.utmCampaign).toBe(initialUtmParams.utmCampaign)
      expect(response.body.data.utmTerm).toBe(initialUtmParams.utmTerm)
      expect(response.body.data.utmContent).toBe(initialUtmParams.utmContent)
    })

    test('should handle null UTM parameters correctly', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      const initialUtmParams = {
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
      }

      // First create user with null UTM params
      const createResponse = await __createOrGetUserWithOurApi({
        testApp,
        token,
        referral: null,
        ...initialUtmParams,
      })

      expect(createResponse.status).toBe(200)
      expect(createResponse.body.data.utmSource).toBeNull()
      expect(createResponse.body.data.utmMedium).toBeNull()
      expect(createResponse.body.data.utmCampaign).toBeNull()
      expect(createResponse.body.data.utmTerm).toBeNull()
      expect(createResponse.body.data.utmContent).toBeNull()

      // Try to update with non-null UTM params
      const newUtmParams = {
        utmSource: 'google',
        utmMedium: 'organic',
        utmCampaign: 'winter_sale',
        utmTerm: 'english_learning',
        utmContent: 'bottom_banner',
      }

      const updateResponse = await __createOrGetUserWithOurApi({
        testApp,
        token,
        referral: null,
        ...newUtmParams,
      })

      // Verify that the null UTM params are preserved
      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body.data.utmSource).toBeNull()
      expect(updateResponse.body.data.utmMedium).toBeNull()
      expect(updateResponse.body.data.utmCampaign).toBeNull()
      expect(updateResponse.body.data.utmTerm).toBeNull()
      expect(updateResponse.body.data.utmContent).toBeNull()
    })
  })

  describe('get user stats', () => {
    test('should return user stats for authenticated user', async () => {
      const { token } = await __createUserInSupabaseAndGetHisIdAndToken()
      await __createOrGetUserWithOurApi({ testApp, token, referral: null })

      const response = await request(testApp).get('/api/v1/users/me/stats').set(buildAuthorizationHeaders(token))

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual(createUserStatsAnyExpectation(expect))
    })

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(testApp)
        .get('/api/v1/users/me/stats')
        .set({ Authorization: 'Bearer invalid-token' })

      expect(response.status).toBe(401)
    })
  })
})
