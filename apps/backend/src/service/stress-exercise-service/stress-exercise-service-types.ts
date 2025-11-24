import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import type { StressExercise } from '@yourbestaccent/api-client/orpc-contracts/stress-exercise-contract'

export type StressExerciseResult =
  | {
      isSuccess: true
      exercises: StressExercise[]
    }
  | {
      isSuccess: false
      crypticCode: string
    }

export interface StressExerciseServiceInterface {
  generateStressExercises: (
    position: number,
    language: SupportedStudyLanguage,
    dialect: DialectCode
  ) => Promise<StressExerciseResult>
}
