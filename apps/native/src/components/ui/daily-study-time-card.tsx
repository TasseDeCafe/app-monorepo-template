import { Text, TouchableOpacity } from 'react-native'
import { cn } from '@template-app/core/utils/tailwind-utils'

interface DailyStudyTimeCardProps {
  minutes: number
  handleClick: (minutes: number) => void
  isSelected: boolean
}

export const DailyStudyTimeCard = ({ minutes, handleClick, isSelected }: DailyStudyTimeCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => handleClick(minutes)}
      className={cn('h-14 flex-row items-center justify-center rounded-xl border p-3', {
        'border-indigo-500 bg-indigo-500/10': isSelected,
        'border-gray-200 bg-white': !isSelected,
      })}
    >
      <Text className='text-xl text-gray-700'>{minutes} min</Text>
    </TouchableOpacity>
  )
}
