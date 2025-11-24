import { ReactNode } from 'react'

export type ExerciseProps = {
  expectedText: string
  onTryAnotherTextClick: () => void
  children: ReactNode
  textOnTryAnotherTextButton: string
  exerciseId?: string
}
