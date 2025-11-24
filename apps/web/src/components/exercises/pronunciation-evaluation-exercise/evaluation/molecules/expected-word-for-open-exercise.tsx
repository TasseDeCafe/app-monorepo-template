import { ExpectedWordForOpenExerciseProps } from '../types.ts'
import { BaseExpectedWord } from '@/components/exercises/pronunciation-evaluation-exercise/evaluation/atoms/expected-word-base.tsx'

export const ExpectedWordForOpenExercise = ({ wordPair, onClick }: ExpectedWordForOpenExerciseProps) => {
  return (
    <div
      onClick={onClick}
      className='group relative flex h-8 items-center rounded-xl border-l border-r border-t border-gray-200 hover:bg-gray-100 active:bg-gray-200 md:h-10'
    >
      <BaseExpectedWord wordPair={wordPair} />
    </div>
  )
}
