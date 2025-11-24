import { sql } from '../postgres-client'
import { logCustomErrorMessageAndError, logWithSentry, logMessage } from '../../third-party/sentry/error-monitoring'
import merge from 'lodash.merge'
import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { UserSettings } from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'
import { createDefaultSettings } from './users-repositoru.utils'

export interface DbUser {
  id: string
  referral: string | null
  elevenlabs_voice_id: string | null
  stripe_customer_id: string
  mother_language: LangCode | null
  study_language: SupportedStudyLanguage | null
  study_dialect: DialectCode | null
  daily_study_minutes: number | null
  topics: Topic[]
  nickname: string | null
  created_at: Date
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
}

export type DbStudyLanguageAndStudyDialect = {
  study_language: SupportedStudyLanguage
  study_dialect: DialectCode
}

export const __getAllUsers = async (): Promise<DbUser[]> => {
  try {
    return await sql<DbUser[]>`
      SELECT id, elevenlabs_voice_id
      FROM public.users
    `
  } catch (e) {
    logCustomErrorMessageAndError('getAllUsers', e)
    return []
  }
}

const insertUser = async (
  id: string,
  referral: string | null,
  utmParams: {
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    utmTerm: string | null
    utmContent: string | null
  }
): Promise<boolean> => {
  try {
    await sql`
      INSERT INTO public.users (
        id, 
        referral,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      )
      VALUES (
        ${id}, 
        ${referral},
        ${utmParams.utmSource},
        ${utmParams.utmMedium},
        ${utmParams.utmCampaign},
        ${utmParams.utmTerm},
        ${utmParams.utmContent}
      )
      ON CONFLICT (id) DO NOTHING
    `
    return true
  } catch (e) {
    logCustomErrorMessageAndError(`insertUser, userId = ${id}`, e)
    return false
  }
}

const updateUser = async (id: string, newElevenlabsVoiceId: string): Promise<boolean> => {
  try {
    const result = await sql`
      UPDATE public.users
      SET elevenlabs_voice_id = ${newElevenlabsVoiceId}
      WHERE id = ${id};
    `
    return result.count === 1
  } catch (e) {
    logCustomErrorMessageAndError(`updateUser, userId = ${id}`, e)
    return false
  }
}

const findUserByUserId = async (id: string): Promise<DbUser | null> => {
  try {
    const result: DbUser[] = await sql`SELECT * FROM public.users WHERE id = ${id}`
    return result[0]
  } catch (e) {
    logCustomErrorMessageAndError(`findUser, userId = ${id}`, e)
    return null
  }
}

const findUserByStripeCustomerId = async (stripeCustomerId: string): Promise<DbUser | null> => {
  try {
    const result = (await sql`SELECT * FROM public.users WHERE stripe_customer_id = ${stripeCustomerId}`) as DbUser[]
    if (result.length === 0) {
      return null
    }
    return result[0]
  } catch (e) {
    logCustomErrorMessageAndError(`findUserByStripeCustomerId, stripeCustomerId = ${stripeCustomerId}`, e)
    return null
  }
}

const updateUserStripeCustomerId = async (userId: string, stripeCustomerId: string): Promise<boolean> => {
  try {
    await sql`
    UPDATE public.users
    SET stripe_customer_id = ${stripeCustomerId}
    WHERE id = ${userId}
  `
    return true
  } catch (e) {
    logCustomErrorMessageAndError(
      `updateUserStripeCustomerId, userId = ${userId}, stripeCustomerId = ${stripeCustomerId}`,
      e
    )
    return false
  }
}

const updateElevenLabsVoiceIdToNull = async (userId: string): Promise<boolean> => {
  try {
    const result = await sql`
      UPDATE public.users
      SET elevenlabs_voice_id = NULL
      WHERE id = ${userId}
    `
    return result.count === 1
  } catch (e) {
    logCustomErrorMessageAndError(`removeElevenLabsVoiceId, userId = ${userId}`, e)
    return false
  }
}

const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const result = await sql<{ settings: UserSettings }[]>`
      SELECT settings
      FROM public.users
      WHERE id = ${userId}
    `

    if (result.length === 0) {
      return null
    }

    const storedSettings = result[0].settings
    const defaultSettings = createDefaultSettings()

    return merge(defaultSettings, storedSettings)
  } catch (e) {
    logCustomErrorMessageAndError(`getUserSettings, userId = ${userId}`, e)
    return null
  }
}

const updateUserSettings = async (userId: string, settings: UserSettings): Promise<boolean> => {
  try {
    const result = await sql`
      UPDATE public.users
      SET settings = ${sql.json(settings)}
      WHERE id = ${userId}
      RETURNING id
    `
    if (result.count === 0) {
      logMessage(`updateUserSettings, user not found, userId = ${userId}`)
      return false
    }
    return true
  } catch (e) {
    logCustomErrorMessageAndError(`updateUserSettings error, userId = ${userId}`, e)
    return false
  }
}

const updateUserMotherLanguage = async (userId: string, motherLanguage: LangCode | null): Promise<LangCode | null> => {
  try {
    const result = await sql`
      UPDATE users
      SET mother_language = ${motherLanguage}
      WHERE id = ${userId}
      RETURNING mother_language, study_language, study_dialect
    `
    if (result.count === 0) {
      return null
    }
    return result[0].mother_language
  } catch (error) {
    logCustomErrorMessageAndError('Error updating user mother language', error)
    return null
  }
}

const updateUserStudyLanguageAndDialect = async (
  userId: string,
  newStudyLanguage: SupportedStudyLanguage,
  newStudyDialect: DialectCode
): Promise<DbStudyLanguageAndStudyDialect | null> => {
  try {
    const result = await sql`
      UPDATE users
      SET 
        study_language = ${newStudyLanguage},
        study_dialect = ${newStudyDialect}
      WHERE id = ${userId}
      RETURNING mother_language, study_language, study_dialect
    `
    if (result.count === 0) {
      return null
    }
    return {
      study_language: result[0].study_language,
      study_dialect: result[0].study_dialect,
    }
  } catch (error) {
    logCustomErrorMessageAndError('updateUserStudyLanguage error - ', error)
    return null
  }
}

const updateUserStudyLanguage = async (
  userId: string,
  studyLanguage: LangCode
): Promise<SupportedStudyLanguage | null> => {
  try {
    const result = await sql<{ study_language: SupportedStudyLanguage }[]>`
      UPDATE users
      SET 
        study_language = ${studyLanguage},
        study_dialect = CASE 
          WHEN study_language IS DISTINCT FROM ${studyLanguage} THEN NULL 
          ELSE study_dialect 
        END
      WHERE id = ${userId}
      RETURNING study_language
    `
    return result[0]?.study_language || null
  } catch (error) {
    logMessage(`updateUserStudyLanguage error: ${error}`)
    return null
  }
}

const updateUserStudyDialect = async (userId: string, studyDialect: string | null): Promise<DialectCode | null> => {
  try {
    const result = await sql`
      UPDATE users
      SET study_dialect = ${studyDialect}
      WHERE id = ${userId}
      RETURNING mother_language, study_language, study_dialect
    `
    if (result.count === 0) {
      return null
    }
    return result[0].study_dialect
  } catch (error) {
    logCustomErrorMessageAndError('Error updating user study dialect', error)
    return null
  }
}

const updateUserTopics = async (userId: string, topics: Topic[]): Promise<Topic[] | null> => {
  try {
    const result = await sql`
      UPDATE users
      SET topics = ${sql.array(topics)}::text[]
      WHERE id = ${userId}
      RETURNING topics
    `
    if (result.count === 0) {
      return null
    }
    return result[0].topics as Topic[]
  } catch (error) {
    logCustomErrorMessageAndError('Error updating user topics', error)
    return null
  }
}

const updateUserDailyStudyMinutes = async (userId: string, dailyStudyMinutes: number): Promise<number | null> => {
  try {
    const result = await sql`
      UPDATE users
      SET daily_study_minutes = ${dailyStudyMinutes}
      WHERE id = ${userId}
      RETURNING daily_study_minutes
    `
    if (result.count === 0) {
      return null
    }
    return result[0].daily_study_minutes
  } catch (error) {
    logCustomErrorMessageAndError('Error updating user daily study minutes', error)
    return null
  }
}

const findUserByNickname = async (nickname: string): Promise<DbUser | null> => {
  try {
    const result = await sql<DbUser[]>`
      SELECT * FROM public.users 
      WHERE LOWER(nickname) = LOWER(${nickname})
    `
    return result[0] || null
  } catch (error) {
    logCustomErrorMessageAndError(`findUserByNickname, nickname = ${nickname}`, error)
    return null
  }
}

const updateUserNickname = async (userId: string, nickname: string): Promise<boolean> => {
  try {
    const result = await sql`
      UPDATE public.users
      SET nickname = ${nickname}
      WHERE id = ${userId}
    `
    return result.count === 1
  } catch (error) {
    logCustomErrorMessageAndError(`updateUserNickname error, userId = ${userId}, nickname = ${nickname}`, error)
    return false
  }
}

const updateStripeCustomerId = async (userId: string, stripeCustomerId: string | null): Promise<boolean> => {
  try {
    const result = await sql`
      UPDATE public.users
      SET stripe_customer_id = ${stripeCustomerId}
      WHERE id = ${userId}
    `
    return result.count === 1
  } catch (e) {
    logWithSentry({
      message: 'error updating stripe customer id',
      params: {
        userId,
        stripeCustomerId,
      },
      error: e,
    })
    return false
  }
}

const retrieveAllUsersCreatedLessThanNDaysAgo = async (days: number): Promise<string[]> => {
  try {
    const result = await sql<{ id: string }[]>`
      SELECT id
      FROM public.users
      WHERE created_at > NOW() - make_interval(days => ${days})
    `
    return result.map((row) => row.id)
  } catch (error) {
    logWithSentry({ message: 'Error retrieving recent users', params: { days }, error })
    return []
  }
}

export interface UsersRepositoryInterface {
  insertUser: (
    id: string,
    referral: string | null,
    utmParams: {
      utmSource: string | null
      utmMedium: string | null
      utmCampaign: string | null
      utmTerm: string | null
      utmContent: string | null
    }
  ) => Promise<boolean>
  updateUser: (id: string, newElevenlabsVoiceId: string) => Promise<boolean>
  findUserByUserId: (id: string) => Promise<DbUser | null>
  findUserByStripeCustomerId: (stripeCustomerId: string) => Promise<DbUser | null>
  updateUserStripeCustomerId: (userId: string, stripeCustomerId: string) => Promise<boolean>
  updateElevenLabsVoiceIdToNull: (userId: string) => Promise<boolean>
  getUserSettings: (userId: string) => Promise<UserSettings | null>
  updateUserSettings: (userId: string, settings: UserSettings) => Promise<boolean>
  updateUserMotherLanguage: (userId: string, motherLanguage: LangCode | null) => Promise<LangCode | null>
  updateUserStudyLanguageAndDialect: (
    userId: string,
    newStudyLanguage: SupportedStudyLanguage,
    newStudyDialect: DialectCode
  ) => Promise<DbStudyLanguageAndStudyDialect | null>
  updateUserStudyLanguage: (userId: string, studyLanguage: LangCode) => Promise<SupportedStudyLanguage | null>
  updateUserStudyDialect: (userId: string, studyDialect: string | null) => Promise<DialectCode | null>
  updateUserTopics: (userId: string, topics: Topic[]) => Promise<Topic[] | null>
  updateUserDailyStudyMinutes: (userId: string, dailyStudyMinutes: number) => Promise<number | null>
  findUserByNickname: (nickname: string) => Promise<DbUser | null>
  updateUserNickname: (userId: string, nickname: string) => Promise<boolean>
  updateStripeCustomerId: (userId: string, stripeCustomerId: string | null) => Promise<boolean>
  retrieveAllUsersCreatedLessThanNDaysAgo: (days: number) => Promise<string[]>
}

export const UsersRepository = (): UsersRepositoryInterface => {
  return {
    insertUser,
    updateUser,
    findUserByUserId,
    findUserByStripeCustomerId,
    updateUserStripeCustomerId,
    updateElevenLabsVoiceIdToNull,
    getUserSettings,
    updateUserSettings,
    updateUserMotherLanguage,
    updateUserStudyLanguageAndDialect,
    updateUserStudyLanguage,
    updateUserStudyDialect,
    updateUserTopics,
    updateUserDailyStudyMinutes,
    findUserByNickname,
    updateUserNickname,
    updateStripeCustomerId,
    retrieveAllUsersCreatedLessThanNDaysAgo,
  }
}
