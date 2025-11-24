import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { WordPair } from '@yourbestaccent/core/exercises/types/evaluation-types'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { UserStats } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import { UploadedFile } from '../../../types/uploaded-file'

export interface PronunciationExerciseHistoryItem {
  id: string
  text: string
  language: SupportedStudyLanguage
  dialect: DialectCode
  createdAt: string
  attempts: Array<{
    id: string
    transcript: string
    score: number
    createdAt: string
  }>
}

export type PronunciationExercise = PronunciationExerciseHistoryItem & {
  wordsFromExerciseThatAreSaved: {
    word: string
    language: SupportedStudyLanguage
  }[]
}

export type GeneratePronunciationExerciseResult =
  | {
      isSuccess: true
      exercise: PronunciationExercise
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export type RetrievePronunciationExerciseResult =
  | {
      isSuccess: true
      exercise: PronunciationExercise
    }
  | {
      isSuccess: false
      exerciseFound: false
    }
  | {
      isSuccess: false
      exerciseFound: true
      crypticCode: string
    }

export type CompletePronunciationExerciseResult =
  | {
      isSuccess: true
      evaluation: {
        transcript: string
        score: number
        wordPairs: WordPair[]
      }
      userStats: UserStats
    }
  | {
      isSuccess: false
      exerciseFound: false
    }
  | {
      isSuccess: false
      exerciseFound: true
      crypticCode: string
    }

export type RetrievePronunciationExerciseHistoryResult =
  | {
      isSuccess: true
      exercises: PronunciationExerciseHistoryItem[]
      nextCursor: string | null
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export interface PronunciationExerciseServiceInterface {
  generatePronunciationExercise: (
    userId: string,
    language: SupportedStudyLanguage,
    position: number,
    wordLength: number,
    dialect: DialectCode,
    topics?: Topic[]
  ) => Promise<GeneratePronunciationExerciseResult>

  generateCustomPronunciationExercise: (
    userId: string,
    text: string,
    language: SupportedStudyLanguage,
    dialect: DialectCode
  ) => Promise<GeneratePronunciationExerciseResult>

  retrievePronunciationExercise: (userId: string, exerciseId: string) => Promise<RetrievePronunciationExerciseResult>

  retrievePronunciationExerciseHistory: (
    userId: string,
    cursor?: string,
    limit?: number,
    languageFilter?: SupportedStudyLanguage
  ) => Promise<RetrievePronunciationExerciseHistoryResult>

  completePronunciationExercise: (
    userId: string,
    exerciseId: string,
    audioFile: UploadedFile
  ) => Promise<CompletePronunciationExerciseResult>
}
