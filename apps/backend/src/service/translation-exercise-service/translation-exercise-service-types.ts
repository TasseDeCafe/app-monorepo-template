import { LangCode, SupportedStudyLanguage, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { GrammarPattern } from '@yourbestaccent/api-client/orpc-contracts/translation-exercise-contract'

export interface ChunkSelection {
  chunk: string[]
  chunk_position: number[]
  language: string
}

export interface TranslationExerciseHistoryItem {
  id: string
  motherLanguageSentence: string
  studyLanguageSentence: string
  studyLanguage: SupportedStudyLanguage
  motherLanguage: LangCode
  dialect: DialectCode
  createdAt: string
  userTranslation: string | null
  skipped: boolean
}

export type TranslationExercise = TranslationExerciseHistoryItem

export type StartTranslationExerciseResult =
  | {
      isSuccess: true
      exercise: TranslationExercise
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export type RetrieveTranslationExerciseResult =
  | {
      isSuccess: true
      exercise: TranslationExercise
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

export type RetrieveTranslationExerciseHistoryResult =
  | {
      isSuccess: true
      exercises: TranslationExerciseHistoryItem[]
      nextCursor: string | null
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export type CompleteExerciseResult =
  | {
      isSuccess: true
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export type GenerateExerciseResult =
  | {
      isSuccess: true
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export type GenerateGrammarPatternsResult =
  | {
      isSuccess: true
      grammarPatterns: GrammarPattern[]
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export interface CompleteExerciseParams {
  exerciseId: string
  userTranslation?: string
  skipped?: boolean
  selectedGrammarPatterns?: GrammarPattern[]
  selectedChunks?: ChunkSelection[]
}

export interface TranslationExercisesServiceInterface {
  startTranslationExercise: (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode
  ) => Promise<StartTranslationExerciseResult>

  retrieveTranslationExercise: (userId: string, exerciseId: string) => Promise<RetrieveTranslationExerciseResult>

  retrieveTranslationExerciseHistory: (
    userId: string,
    cursor?: string,
    limit?: number,
    languageFilter?: SupportedStudyLanguage
  ) => Promise<RetrieveTranslationExerciseHistoryResult>

  completeExercise: (params: CompleteExerciseParams) => Promise<CompleteExerciseResult>
  generateExercise: (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode
  ) => Promise<GenerateExerciseResult>
  generateGrammarPatterns: (
    motherLanguageSentence: string,
    studyLanguageSentence: string,
    studyLanguage: LangCode,
    motherLanguage: LangCode
  ) => Promise<GenerateGrammarPatternsResult>
}
