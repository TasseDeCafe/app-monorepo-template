import { WordPair } from '@yourbestaccent/core/exercises/types/evaluation-types.ts'

export const ActualWord = ({ pair, onClick }: { pair: WordPair; onClick: () => void }) => {
  return (
    <span
      className='flex h-6 items-center justify-center rounded px-2 pb-0 pt-0 text-sm text-gray-400 transition-colors duration-100 md:pb-1 md:pt-1'
      onClick={onClick}
    >
      {pair.actualWord}
    </span>
  )
}
