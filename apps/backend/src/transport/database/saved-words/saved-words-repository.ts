import { sql } from '../postgres-client'
import { logCustomErrorMessageAndError } from '../../third-party/sentry/error-monitoring'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { JSONValue } from 'postgres'

export type DbSavedWord = {
  word: string
  language: SupportedStudyLanguage
}

export type DbRetrieveSavedWordsResult =
  | {
      isSuccess: true
      savedWords: DbSavedWord[]
      nextCursor: string | null
    }
  | {
      isSuccess: false
      savedWords: null
      nextCursor: null
    }

export interface DbSavedWordCount {
  language: SupportedStudyLanguage
  count: number
}

export type DbSelectSavedWordCountersByLanguageResult =
  | {
      isSuccess: true
      counters: DbSavedWordCount[]
    }
  | {
      isSuccess: false
      counters: []
    }

export interface WordToCheck {
  word: string
  language: SupportedStudyLanguage
}

export type DbSelectSavedWordsResult = {
  isSuccess: boolean
  savedWords: DbSavedWord[]
}

export interface SavedWordsRepository {
  upsertToSavedWords: (userId: string, word: string, language: SupportedStudyLanguage) => Promise<boolean>
  deleteFromSavedWords: (userId: string, word: string, language: SupportedStudyLanguage) => Promise<boolean>
  retrieveSavedWords: (
    userId: string,
    cursor?: string,
    limit?: number,
    language?: SupportedStudyLanguage
  ) => Promise<DbRetrieveSavedWordsResult>
  getSavedWordCountsByLanguage: (userId: string) => Promise<DbSelectSavedWordCountersByLanguageResult>
  selectSavedWords: (userId: string, wordsToCheck: WordToCheck[]) => Promise<DbSelectSavedWordsResult>
}

export const SavedWordsRepository = (): SavedWordsRepository => {
  const upsertToSavedWords = async (
    userId: string,
    word: string,
    language: SupportedStudyLanguage
  ): Promise<boolean> => {
    try {
      await sql`
        WITH insert_word AS (
          INSERT INTO public.words (orthographic_form, language)
          VALUES (${word}, ${language})
          ON CONFLICT (orthographic_form, language) DO UPDATE
          SET orthographic_form = EXCLUDED.orthographic_form
          RETURNING id
        )
        INSERT INTO public.saved_words (user_id, word_id)
        SELECT ${userId}::uuid, id FROM insert_word
        ON CONFLICT (user_id, word_id) DO NOTHING
      `
      return true
    } catch (e) {
      logCustomErrorMessageAndError(
        `upsertToSavedWords error, userId = ${userId}, word = ${word}, language = ${language}`,
        e
      )
      return false
    }
  }

  const deleteFromSavedWords = async (
    userId: string,
    word: string,
    language: SupportedStudyLanguage
  ): Promise<boolean> => {
    try {
      await sql`
        DELETE FROM public.saved_words
        WHERE user_id = ${userId}::uuid
          AND word_id = (
            SELECT id FROM public.words
            WHERE orthographic_form = ${word} AND language = ${language}
          )
      `
      return true
    } catch (e) {
      logCustomErrorMessageAndError(
        `deleteFromSavedWords error, userId = ${userId}, word = ${word}, language = ${language}`,
        e
      )
      return false
    }
  }

  const retrieveSavedWords = async (
    userId: string,
    cursor?: string,
    limit: number = 50,
    language?: SupportedStudyLanguage
  ): Promise<DbRetrieveSavedWordsResult> => {
    try {
      const cursorId = cursor ? parseInt(cursor, 10) : null
      const cursorCondition = cursor ? sql`AND sw.id < ${cursorId}` : sql``
      const languageCondition = language ? sql`AND w.language = ${language}` : sql``

      const result = await sql<(DbSavedWord & { id: number })[]>`
        SELECT sw.id, w.orthographic_form as word, w.language
        FROM public.saved_words sw
        JOIN public.words w ON sw.word_id = w.id
        WHERE sw.user_id = ${userId}::uuid
        ${cursorCondition}
        ${languageCondition}
        ORDER BY sw.id DESC
        LIMIT ${limit + 1}
      `

      const hasNextPage = result.length > limit
      const savedWords = result.slice(0, limit)
      const nextCursor = hasNextPage ? savedWords[savedWords.length - 1].id.toString() : null

      return {
        isSuccess: true,
        savedWords: savedWords.map(({ word, language }) => ({
          word,
          language,
        })),
        nextCursor,
      }
    } catch (e) {
      logCustomErrorMessageAndError(`retrieveSavedWords error, userId = ${userId}`, e)
      return {
        isSuccess: false,
        savedWords: null,
        nextCursor: null,
      }
    }
  }

  const getSavedWordCountsByLanguage = async (userId: string): Promise<DbSelectSavedWordCountersByLanguageResult> => {
    try {
      const result = await sql<DbSavedWordCount[]>`
        SELECT w.language, COUNT(*)::integer as count
        FROM public.saved_words sw
        JOIN public.words w ON sw.word_id = w.id
        WHERE sw.user_id = ${userId}::uuid
        GROUP BY w.language
        ORDER BY count DESC
      `
      return {
        isSuccess: true,
        counters: result,
      }
    } catch (e) {
      logCustomErrorMessageAndError(`getSavedWordCountsByLanguage error, userId = ${userId}`, e)
      return {
        isSuccess: false,
        counters: [],
      }
    }
  }

  const selectSavedWords = async (userId: string, wordsToCheck: WordToCheck[]): Promise<DbSelectSavedWordsResult> => {
    try {
      const result = await sql`
      WITH words_to_check AS (
        SELECT * FROM jsonb_to_recordset(${sql.json(wordsToCheck as unknown as JSONValue)})
        AS t(word text, language text)
      )
      SELECT
        w.orthographic_form AS word,
        w.language
      FROM words_to_check wtc
      JOIN public.words w ON w.orthographic_form = wtc.word AND w.language = wtc.language
      JOIN public.saved_words sw ON sw.word_id = w.id AND sw.user_id = ${userId}::uuid
    `
      return {
        isSuccess: true,
        savedWords: result.map((row) => ({
          word: row.word,
          language: row.language,
        })),
      }
    } catch (e) {
      logCustomErrorMessageAndError(`selectSavedWords error, userId = ${userId}`, e)
      return {
        isSuccess: false,
        savedWords: [],
      }
    }
  }

  return {
    upsertToSavedWords,
    deleteFromSavedWords,
    retrieveSavedWords,
    getSavedWordCountsByLanguage,
    selectSavedWords,
  }
}
