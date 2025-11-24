import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { UsersRepository } from './users-repository'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { __createUserInSupabaseAndGetHisIdAndToken, __removeAllAuthUsersFromSupabase } from '../../../test/test-utils'
import { sql } from '../postgres-client'

describe('users-repository integration tests', () => {
  const {
    findUserByStripeCustomerId,
    findUserByUserId,
    insertUser,
    updateStripeCustomerId,
    updateUserMotherLanguage,
    updateUserStudyDialect,
    updateUserStudyLanguage,
    retrieveAllUsersCreatedLessThanNDaysAgo,
  } = UsersRepository()
  const emptyUtmParams = {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
  }
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
  })

  test('updating a study language', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()

    await insertUser(userId, null, emptyUtmParams)
    const result = await updateUserStudyLanguage(userId, LangCode.FRENCH)

    expect(result).toBe(LangCode.FRENCH)
  })

  test('update a study language and then update dialect', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()

    await insertUser(userId, null, emptyUtmParams)
    await updateUserStudyLanguage(userId, LangCode.FRENCH)
    const result = await updateUserStudyDialect(userId, DialectCode.CANADIAN_FRENCH)

    expect(result).toEqual(DialectCode.CANADIAN_FRENCH)
  })

  test('after updating mother language, study language and dialect, they can be retrieved by findUserByUserId', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()

    await insertUser(userId, null, emptyUtmParams)
    await updateUserMotherLanguage(userId, LangCode.ENGLISH)
    await updateUserStudyLanguage(userId, LangCode.FRENCH)
    await updateUserStudyDialect(userId, DialectCode.BELGIAN_FRENCH)

    const user = await findUserByUserId(userId)

    expect(user).not.toBeNull()
    expect(user?.mother_language).toBe(LangCode.ENGLISH)
    expect(user?.study_language).toBe(LangCode.FRENCH)
    expect(user?.study_dialect).toBe(DialectCode.BELGIAN_FRENCH)
  })

  test('should update stripe customer id', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()
    const stripeCustomerId = 'test-stripe-customer-id'

    await insertUser(userId, null, emptyUtmParams)
    const result = await updateStripeCustomerId(userId, stripeCustomerId)

    expect(result).toBe(true)

    const user = await findUserByUserId(userId)
    expect(user?.stripe_customer_id).toBe(stripeCustomerId)
  })

  test('should set stripe customer id to null', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()
    const stripeCustomerId = 'test-stripe-customer-id'

    await insertUser(userId, null, emptyUtmParams)
    await updateStripeCustomerId(userId, stripeCustomerId)
    const result = await updateStripeCustomerId(userId, null)

    expect(result).toBe(true)

    const user = await findUserByUserId(userId)
    expect(user?.stripe_customer_id).toBeNull()
  })

  test('should find user by stripe customer id', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()
    const stripeCustomerId = 'test-stripe-customer-id'

    await insertUser(userId, null, emptyUtmParams)
    await updateStripeCustomerId(userId, stripeCustomerId)

    const user = await findUserByStripeCustomerId(stripeCustomerId)

    expect(user).not.toBeNull()
    expect(user?.id).toBe(userId)
    expect(user?.stripe_customer_id).toBe(stripeCustomerId)
  })

  test('should store UTM parameters when creating a new user', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()
    const utmParams = {
      utmSource: 'test_source',
      utmMedium: 'test_medium',
      utmCampaign: 'test_campaign',
      utmTerm: 'test_term',
      utmContent: 'test_content',
    }

    await insertUser(userId, null, utmParams)
    const user = await findUserByUserId(userId)

    expect(user).not.toBeNull()
    expect(user?.utm_source).toBe(utmParams.utmSource)
    expect(user?.utm_medium).toBe(utmParams.utmMedium)
    expect(user?.utm_campaign).toBe(utmParams.utmCampaign)
    expect(user?.utm_term).toBe(utmParams.utmTerm)
    expect(user?.utm_content).toBe(utmParams.utmContent)
  })

  test('should handle null UTM parameters when creating a new user', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()
    const utmParams = {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    }

    await insertUser(userId, null, utmParams)
    const user = await findUserByUserId(userId)

    expect(user).not.toBeNull()
    expect(user?.utm_source).toBeNull()
    expect(user?.utm_medium).toBeNull()
    expect(user?.utm_campaign).toBeNull()
    expect(user?.utm_term).toBeNull()
    expect(user?.utm_content).toBeNull()
  })

  test('should update daily study minutes', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()
    const { updateUserDailyStudyMinutes } = UsersRepository()

    await insertUser(userId, null, emptyUtmParams)
    const result = await updateUserDailyStudyMinutes(userId, 15)

    expect(result).toBe(15)

    const user = await findUserByUserId(userId)
    expect(user?.daily_study_minutes).toBe(15)
  })

  test('should update daily study minutes to different values', async () => {
    const { id: userId } = await __createUserInSupabaseAndGetHisIdAndToken()
    const { updateUserDailyStudyMinutes } = UsersRepository()
    const validValues = [5, 10, 15, 20]

    await insertUser(userId, null, emptyUtmParams)

    for (const minutes of validValues) {
      const result = await updateUserDailyStudyMinutes(userId, minutes)
      expect(result).toBe(minutes)

      const user = await findUserByUserId(userId)
      expect(user?.daily_study_minutes).toBe(minutes)
    }
  })

  test('should return null when finding non-existent stripe customer id', async () => {
    const user = await findUserByStripeCustomerId('non-existent-stripe-customer-id')
    expect(user).toBeNull()
  })

  test('should return false when updating stripe customer id for non-existent user', async () => {
    const result = await updateStripeCustomerId('non-existent-user', 'test-stripe-customer-id')
    expect(result).toBe(false)
  })

  describe('retrieveAllUsersCreatedLessThanNDaysAgo', () => {
    test('should return users based on their creation date', async () => {
      const { id: userId1 } = await __createUserInSupabaseAndGetHisIdAndToken('test1@example.com')
      const { id: userId2 } = await __createUserInSupabaseAndGetHisIdAndToken('test2@example.com')

      await insertUser(userId1, null, emptyUtmParams)
      await insertUser(userId2, null, emptyUtmParams)

      // Set creation dates to 29 hours ago
      await sql`
        UPDATE public.users 
        SET created_at = NOW() - INTERVAL '29 hours'
        WHERE id IN (${userId1}, ${userId2})
      `

      const usersWithinTwoDays = await retrieveAllUsersCreatedLessThanNDaysAgo(2)
      expect(usersWithinTwoDays).toHaveLength(2)
      expect(usersWithinTwoDays).toContain(userId1)
      expect(usersWithinTwoDays).toContain(userId2)

      const usersWithinOneDay = await retrieveAllUsersCreatedLessThanNDaysAgo(1)
      expect(usersWithinOneDay).toHaveLength(0)
    })

    test('should return empty array when no users exist', async () => {
      const recentUsers = await retrieveAllUsersCreatedLessThanNDaysAgo(1)
      expect(recentUsers).toHaveLength(0)
    })
  })
})
