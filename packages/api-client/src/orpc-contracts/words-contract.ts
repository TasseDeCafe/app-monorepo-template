import { oc } from '@orpc/contract'
import { z } from 'zod'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'

export const WORDS_PATH = '/words' as const

const errorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
    })
  ),
})

export const LearnedWordsInADaySchema = z.object({
  date: z.string(),
  learnedWordsCount: z.number().int().nonnegative(),
})
export type LearnedWordsInADay = z.infer<typeof LearnedWordsInADaySchema>

export const WordsInLanguageCounterSchema = z.object({
  wordsPronouncedCorrectlyCount: z.number().int().nonnegative(),
  neverPronouncedCorrectlyWordCount: z.number().int().nonnegative(),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
})
export type WordsInLanguageCounter = z.infer<typeof WordsInLanguageCounterSchema>

export const CorrectUserPronunciationSchema = z.object({
  dateOfFirstTimePronouncedCorrectly: z.string(),
  word: z.string(),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES),
})
export type CorrectUserPronunciation = z.infer<typeof CorrectUserPronunciationSchema>

export const GetCorrectUserPronunciationsRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  language: z.enum(SUPPORTED_STUDY_LANGUAGES).optional(),
})
export type GetCorrectUserPronunciationsRequest = z.infer<typeof GetCorrectUserPronunciationsRequestSchema>

export const LeaderboardEntrySchema = z.object({
  nickname: z.string().nullable(),
  numberOfLearnedWords: z.number().int().nonnegative(),
})

export const LeaderboardDataSchema = z.object({
  learnedWords: z.object({
    allTime: z.array(LeaderboardEntrySchema),
    weekly: z.array(LeaderboardEntrySchema),
    byLanguage: z.partialRecord(
      z.enum(SUPPORTED_STUDY_LANGUAGES),
      z.object({
        allTime: z.array(LeaderboardEntrySchema),
        weekly: z.array(LeaderboardEntrySchema).nullable(),
      })
    ),
  }),
})

export const UserWordsDataSchema = z.object({
  counters: z.array(WordsInLanguageCounterSchema),
  learnedWordsByDay: z.array(LearnedWordsInADaySchema),
})
export type UserWordsData = z.infer<typeof UserWordsDataSchema>

export const GetCorrectUserPronunciationsResponseSchema = z.object({
  userPronunciations: z.array(CorrectUserPronunciationSchema),
  nextCursor: z.string().nullable(),
})

export const LearnedWordsPath = `${WORDS_PATH}/learned-words` as const
export const WordsLeaderboardPath = `${WORDS_PATH}/leaderboard` as const

export const wordsContract = {
  getLearnedWords: oc
    .route({
      method: 'GET',
      path: LearnedWordsPath,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .input(GetCorrectUserPronunciationsRequestSchema)
    .output(
      z.object({
        data: GetCorrectUserPronunciationsResponseSchema,
      })
    ),

  getLeaderboard: oc
    .route({
      method: 'GET',
      path: WordsLeaderboardPath,
      successStatus: 200,
    })
    .errors({
      INTERNAL_SERVER_ERROR: {
        status: 500,
        data: errorResponseSchema,
      },
    })
    .output(
      z.object({
        data: LeaderboardDataSchema,
      })
    ),
} as const
