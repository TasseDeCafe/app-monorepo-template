import { sql } from '../postgres-client'
import { logCustomErrorMessageAndError } from '../../third-party/sentry/error-monitoring'
import { JSONValue } from 'postgres'
import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'

export interface DbUserPronunciation {
  word: string
  confidence: number
  language: LangCode
}

export const THRESHOLD_FOR_CORRECT_PRONUNCIATION = 0.9

export type DbWordPronouncedCorrectly = {
  orthographic_form: string
  language: SupportedStudyLanguage
  date_of_first_high_confidence_pronunciation: Date
  word_id: number
}

export type SelectPronouncedWordsResult =
  | {
      words: DbWordPronouncedCorrectly[]
      nextCursor: string | null
      isSuccess: true
    }
  | {
      isSuccess: false
    }

type DbWordsInLanguageCounter = {
  wordsPronouncedCorrectlyCount: number
  neverPronouncedCorrectlyWordCount: number
  language: SupportedStudyLanguage
}
export type DbWordCountersResult = {
  counters: DbWordsInLanguageCounter[]
  isSuccess: boolean
}

export type DbDailyWordsLearnedResult =
  | {
      learnedWordsByDay: {
        date: string
        learnedWordsCount: number
      }[]
      isSuccess: true
    }
  | {
      isSuccess: false
    }

export type LeaderboardEntry = {
  nickname: string | null
  numberOfLearnedWords: number
}

export type DbLeaderboardResult =
  | {
      allTime: LeaderboardEntry[]
      weekly: LeaderboardEntry[]
      byLanguage: {
        [key in SupportedStudyLanguage]?: {
          allTime: LeaderboardEntry[]
          weekly: LeaderboardEntry[] | null
        }
      }
      isSuccess: true
    }
  | {
      isSuccess: false
    }

export interface WordsRepositoryInterface {
  insertPronouncedWordsAndTheirDefinitionsIfNeeded: (userId: string, words: DbUserPronunciation[]) => Promise<boolean>
  selectWordsPronouncedCorrectly: (
    userId: string,
    cursor?: string,
    limit?: number,
    languageFilter?: SupportedStudyLanguage
  ) => Promise<SelectPronouncedWordsResult>
  selectWordCounters: (userId: string) => Promise<DbWordCountersResult>
  getDailyWordsLearned: (userId: string) => Promise<DbDailyWordsLearnedResult>
  // todo gamification: remove this once native uses the new leaderboard endpoint
  getLeaderboard: () => Promise<DbLeaderboardResult>
}

export const __deleteWords = async () => {
  try {
    await sql`DELETE FROM public.words`
  } catch (e) {
    throw Error('__deleteWordDefinitions - error: ' + JSON.stringify(e))
  }
}

export const insertPronouncedWordsAndTheirDefinitionsIfNeeded = async (
  userId: string,
  words: DbUserPronunciation[]
): Promise<boolean> => {
  try {
    await sql.begin(async (sql) => {
      await sql`
        WITH input_words AS (
          SELECT * FROM jsonb_to_recordset(${sql.json(words as unknown as JSONValue)})
          AS t("word" text, "confidence" float, "language" char(3))
        ),
        inserted_definitions AS (
          INSERT INTO public.words (language, orthographic_form)
          SELECT DISTINCT iw.language, iw.word
          FROM input_words iw
          WHERE NOT EXISTS (
            SELECT 1 FROM public.words wd
            WHERE wd.language = iw.language AND wd.orthographic_form = iw.word
          )
          RETURNING id, language, orthographic_form
        ),
        all_definitions AS (
          SELECT id, language, orthographic_form
          FROM inserted_definitions
          UNION ALL
          SELECT id, language, orthographic_form
          FROM public.words
          WHERE (language, orthographic_form) IN (SELECT language, word FROM input_words)
        )
        INSERT INTO public.user_pronunciations (word_definition_id, user_id, confidence)
        SELECT ad.id, ${userId}::uuid, iw.confidence
        FROM input_words iw
        JOIN all_definitions ad ON iw.word = ad.orthographic_form AND iw.language = ad.language
      `
    })
    return true
  } catch (e) {
    logCustomErrorMessageAndError(
      `insertPronouncedWordsAndTheirDefinitionsIfNeeded error, userId = ${userId}, words = ${JSON.stringify(words)}`,
      e
    )
    return false
  }
}

const selectWordsPronouncedCorrectly = async (
  userId: string,
  cursor?: string,
  limit: number = 500,
  languageFilter?: SupportedStudyLanguage
): Promise<SelectPronouncedWordsResult> => {
  try {
    const cursorWordId = cursor ? parseInt(cursor, 10) : null

    const cursorCondition = cursor ? sql`AND fhc.word_definition_id < ${cursorWordId}` : sql``
    const languageCondition = languageFilter ? sql`AND wd.language = ${languageFilter}` : sql``

    const result: DbWordPronouncedCorrectly[] = await sql`
      WITH first_high_confidence AS (
        SELECT 
          word_definition_id,
          user_id,
          MIN(created_at) AS date_of_first_high_confidence_pronunciation
        FROM 
          public.user_pronunciations
        WHERE 
          confidence > ${THRESHOLD_FOR_CORRECT_PRONUNCIATION}
        GROUP BY 
          word_definition_id, user_id
      )
      SELECT 
        wd.id AS word_id,
        wd.orthographic_form,
        wd.language,
        fhc.date_of_first_high_confidence_pronunciation
      FROM 
        public.words wd
      JOIN 
        first_high_confidence fhc ON wd.id = fhc.word_definition_id
      WHERE 
        fhc.user_id = ${userId}::uuid
        ${cursorCondition}
        ${languageCondition}
      ORDER BY 
        wd.id DESC
      LIMIT ${limit + 1}
    `

    const hasNextPage = result.length > limit
    const words: DbWordPronouncedCorrectly[] = result.slice(0, limit)
    const nextCursor = hasNextPage ? words[words.length - 1].word_id.toString() : null

    return {
      words,
      nextCursor,
      isSuccess: true,
    }
  } catch (e) {
    logCustomErrorMessageAndError(`selectWordsPronouncedCorrectly error, userId = ${userId}`, e)
    return {
      isSuccess: false,
    }
  }
}

export const selectWordCounters = async (userId: string): Promise<DbWordCountersResult> => {
  try {
    const result = await sql`
      WITH word_stats AS (
        SELECT
          wd.language,
          COUNT(DISTINCT pw.word_definition_id) as total_words_pronounced,
          COUNT(DISTINCT CASE WHEN pw.confidence > ${THRESHOLD_FOR_CORRECT_PRONUNCIATION} THEN pw.word_definition_id END) as correctly_pronounced_count
        FROM public.words wd
               LEFT JOIN public.user_pronunciations pw ON wd.id = pw.word_definition_id AND pw.user_id = ${userId}::uuid
      GROUP BY wd.language
        )
      SELECT
        language,
        COALESCE(correctly_pronounced_count, 0) as correctly_pronounced_count,
        COALESCE(total_words_pronounced, 0) - COALESCE(correctly_pronounced_count, 0) as never_pronounced_correctly_count
      FROM word_stats;
    `

    const counters = result.map((row) => ({
      language: row.language,
      wordsPronouncedCorrectlyCount: Number(row.correctly_pronounced_count),
      neverPronouncedCorrectlyWordCount: Number(row.never_pronounced_correctly_count),
    }))

    return {
      counters,
      isSuccess: true,
    }
  } catch (e) {
    logCustomErrorMessageAndError(`selectWordCounters error, userId = ${userId}`, e)
    return {
      counters: [],
      isSuccess: false,
    }
  }
}

const getDailyWordsLearned = async (userId: string): Promise<DbDailyWordsLearnedResult> => {
  try {
    const result = await sql`
      WITH daily_learned_words AS (
        SELECT
          DATE(created_at) AS learning_date,
          COUNT(*) FILTER (WHERE confidence > ${THRESHOLD_FOR_CORRECT_PRONUNCIATION}) AS words_learned
        FROM public.user_pronunciations
        WHERE 
          user_id = ${userId}::uuid
          AND created_at >= DATE(now()) - INTERVAL '2 years'
        GROUP BY DATE(created_at)
        HAVING COUNT(*) FILTER (WHERE confidence > ${THRESHOLD_FOR_CORRECT_PRONUNCIATION}) > 0
      )
      SELECT
        learning_date::text AS date,
        words_learned
      FROM daily_learned_words
      ORDER BY learning_date DESC;
    `
    const mappedResult = result.map((row) => ({
      date: row.date,
      learnedWordsCount: parseInt(row.words_learned, 10),
    }))

    return {
      learnedWordsByDay: mappedResult,
      isSuccess: true,
    }
  } catch (error) {
    logCustomErrorMessageAndError(`getDailyWordsLearned error, userId = ${userId}`, error)
    return {
      isSuccess: false,
    }
  }
}

// we need this method because it's very difficult to make the test database to travel in time
export const __modifyCreatedAtOfUserPronunciations = async (words: string[], newDate: Date): Promise<number> => {
  try {
    const result = await sql`
      WITH updated AS (
        UPDATE public.user_pronunciations
        SET created_at = ${newDate}
        WHERE id IN (
          SELECT up.id
          FROM public.user_pronunciations up
          JOIN public.words w ON up.word_definition_id = w.id
          WHERE w.orthographic_form = ANY(${sql.array(words)})
        )
        RETURNING id
      )
      SELECT COUNT(*) as count FROM updated
    `

    const updatedCount = Number(result[0].count)
    return updatedCount
  } catch (e) {
    throw Error(`Error updating created_at for pronunciations of words: ${words.join(', ')}: ` + JSON.stringify(e))
  }
}

type SqlLeaderboardEntry = {
  nickname: string | null
  number_of_learned_words: string
}

type SqlLeaderboardResult = {
  leaderboard_data: {
    allTime: SqlLeaderboardEntry[] | null
    weekly: SqlLeaderboardEntry[] | null
    byLanguage: {
      [key: string]: {
        allTime: SqlLeaderboardEntry[] | null
        weekly: SqlLeaderboardEntry[] | null
      }
    } | null
  }
}

const getLeaderboard = async (): Promise<DbLeaderboardResult> => {
  try {
    const result = await sql<SqlLeaderboardResult[]>`
      WITH learned_words_all_time AS (
        SELECT
          up.user_id,
          w.language,
          COUNT(DISTINCT up.word_definition_id) AS word_count
        FROM public.user_pronunciations up
               JOIN public.words w ON w.id = up.word_definition_id
        WHERE up.confidence > ${THRESHOLD_FOR_CORRECT_PRONUNCIATION}
        GROUP BY up.user_id, w.language
      ),
           learned_words_weekly AS (
             SELECT
               up.user_id,
               w.language,
               COUNT(DISTINCT up.word_definition_id) AS word_count
             FROM public.user_pronunciations up
                    JOIN public.words w ON w.id = up.word_definition_id
             WHERE up.confidence > ${THRESHOLD_FOR_CORRECT_PRONUNCIATION} AND up.created_at >= date_trunc('week', CURRENT_TIMESTAMP)
             GROUP BY up.user_id, w.language
           ),
           all_time_stats AS (
             SELECT
               u.id,
               u.nickname,
               SUM(lw.word_count) AS number_of_learned_words,
               ROW_NUMBER() OVER (ORDER BY SUM(lw.word_count) DESC) AS rank
             FROM public.users u
                    JOIN learned_words_all_time lw ON u.id = lw.user_id
             GROUP BY u.id, u.nickname
             HAVING SUM(lw.word_count) > 0
           ),
           weekly_stats AS (
             SELECT
               u.id,
               u.nickname,
               SUM(lw.word_count) AS number_of_learned_words,
               ROW_NUMBER() OVER (ORDER BY SUM(lw.word_count) DESC) AS rank
             FROM public.users u
                    JOIN learned_words_weekly lw ON u.id = lw.user_id
             GROUP BY u.id, u.nickname
             HAVING SUM(lw.word_count) > 0
           ),
           language_all_time_stats AS (
             SELECT
               lw.language,
               u.id,
               u.nickname,
               lw.word_count AS number_of_learned_words,
               ROW_NUMBER() OVER (PARTITION BY lw.language ORDER BY lw.word_count DESC) AS rank
             FROM public.users u
                    JOIN learned_words_all_time lw ON u.id = lw.user_id
           ),
           language_weekly_stats AS (
             SELECT
               lw.language,
               u.id,
               u.nickname,
               lw.word_count AS number_of_learned_words,
               ROW_NUMBER() OVER (PARTITION BY lw.language ORDER BY lw.word_count DESC) AS rank
             FROM public.users u
                    JOIN learned_words_weekly lw ON u.id = lw.user_id
           ),
           filtered_all_time_stats AS (
             SELECT nickname, number_of_learned_words
             FROM all_time_stats
             WHERE rank <= 500
           ),
           filtered_weekly_stats AS (
             SELECT nickname, number_of_learned_words
             FROM weekly_stats
             WHERE rank <= 500
           ),
           filtered_language_all_time_stats AS (
             SELECT language, nickname, number_of_learned_words
      FROM language_all_time_stats
      WHERE rank <= 100
        ),
        filtered_language_weekly_stats AS (
      SELECT language, nickname, number_of_learned_words
      FROM language_weekly_stats
      WHERE rank <= 50
        ),
        by_language_stats AS (
      SELECT
        json_object_agg(
        language,
        json_build_object(
        'allTime', (
        SELECT json_agg(
        json_build_object(
        'nickname', stats.nickname,
        'numberOfLearnedWords', stats.number_of_learned_words
        )
        )
        FROM (
        SELECT nickname, number_of_learned_words
        FROM filtered_language_all_time_stats
        WHERE language = ls.language
        ) stats
        ),
        'weekly', (
        SELECT json_agg(
        json_build_object(
        'nickname', stats.nickname,
        'numberOfLearnedWords', stats.number_of_learned_words
        )
        )
        FROM (
        SELECT nickname, number_of_learned_words
        FROM filtered_language_weekly_stats
        WHERE language = ls.language
        ) stats
        )
        )
        ) AS by_language
      FROM (SELECT DISTINCT language FROM filtered_language_all_time_stats) ls
        )
      SELECT
        json_build_object(
            'allTime', (SELECT json_agg(filtered_all_time_stats) FROM filtered_all_time_stats),
            'weekly', (SELECT json_agg(filtered_weekly_stats) FROM filtered_weekly_stats),
            'byLanguage', (SELECT by_language FROM by_language_stats)
        ) AS leaderboard_data;
    `

    const leaderboardData = result[0].leaderboard_data

    return {
      allTime: (leaderboardData.allTime || []).map((entry: SqlLeaderboardEntry) => ({
        nickname: entry.nickname,
        numberOfLearnedWords: Number(entry.number_of_learned_words),
      })),
      weekly: (leaderboardData.weekly || []).map((entry: SqlLeaderboardEntry) => ({
        nickname: entry.nickname,
        numberOfLearnedWords: Number(entry.number_of_learned_words),
      })),
      byLanguage: leaderboardData.byLanguage || {},
      isSuccess: true,
    }
  } catch (error) {
    logCustomErrorMessageAndError('getLeaderboard error', error)
    return {
      isSuccess: false,
    }
  }
}

export const WordsRepository = (): WordsRepositoryInterface => {
  return {
    insertPronouncedWordsAndTheirDefinitionsIfNeeded,
    selectWordsPronouncedCorrectly,
    selectWordCounters,
    getDailyWordsLearned,
    getLeaderboard,
  }
}
