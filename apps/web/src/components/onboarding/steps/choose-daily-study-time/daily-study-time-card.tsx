import { cn } from '@template-app/core/utils/tailwind-utils.ts'

interface DailyStudyTimeCardProps {
  minutes: number
  handleClick: (minutes: number) => void
  isSelected: boolean
}

export const DailyStudyTimeCard = ({ minutes, handleClick, isSelected }: DailyStudyTimeCardProps) => {
  return (
    <button
      className={cn(
        'flex h-12 items-center justify-center rounded-xl border bg-white shadow focus:outline-none',
        { 'bg-gradient-to-r from-orange-300 to-yellow-300': isSelected },
        { 'hover:bg-gray-100': !isSelected }
      )}
      onClick={() => handleClick(minutes)}
    >
      <div className='flex items-center'>
        <span className={cn('text-xl', { 'text-gray-700': isSelected }, { 'text-gray-500': !isSelected })}>
          {minutes} min
        </span>
      </div>
    </button>
  )
}
