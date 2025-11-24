import { CircleHelp, Zap } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover.tsx'
import { cn } from '@template-app/core/utils/tailwind-utils'
import {
  useCurrentStreakFromXp,
  useGetNumberOfDaysOfNextStreakBadgeFromXp,
  useLongestStreakFromXp,
} from '@/hooks/api/user/user-hooks'
import { useLingui } from '@lingui/react/macro'

export const StreakCards = () => {
  const { t } = useLingui()

  const currentStreak = useCurrentStreakFromXp()
  const numberOfDaysOfNextStreakBadge = useGetNumberOfDaysOfNextStreakBadgeFromXp()
  const daysLeft = numberOfDaysOfNextStreakBadge - currentStreak
  const longestStreak = useLongestStreakFromXp()

  const streakProgressStringLength = `${currentStreak}/${numberOfDaysOfNextStreakBadge}`.toString().length

  return (
    <div className='h-35 flex w-full flex-col gap-1 rounded-2xl border p-1 lg:gap-2 lg:rounded-3xl lg:p-2 xl:h-60'>
      <div className='relative flex flex-1 items-center rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 p-4 lg:rounded-2xl'>
        <div className='absolute right-4 top-4'>
          <Popover>
            <PopoverTrigger>
              <CircleHelp className='h-5 w-5 text-slate-400 lg:h-6 lg:w-6' />
            </PopoverTrigger>
            <PopoverContent className='bg-white text-center text-sm shadow-lg'>
              {t`A day counts towards your streak if you learn at least one word. A word is considered learned when it's marked in green for the first time in an exercise evaluation.`}
            </PopoverContent>
          </Popover>
        </div>
        <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-[9px] bg-white drop-shadow-sm lg:h-[72px] lg:w-[72px] lg:rounded-2xl'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <span
              className={cn('leading-none text-indigo-500', {
                'text-xl: lg:text-3xl': streakProgressStringLength <= 3,
                'text-lg lg:text-2xl': streakProgressStringLength === 4,
                'text-base lg:text-xl': streakProgressStringLength === 5,
                'text-sm lg:text-lg': streakProgressStringLength === 6,
                'text-xs lg:text-base': streakProgressStringLength >= 7,
              })}
            >
              {currentStreak}/{numberOfDaysOfNextStreakBadge}
            </span>
          </div>
        </div>
        <div className='ml-4 flex flex-col gap-y-1'>
          <span className='text-sm font-medium text-indigo-800 lg:text-lg'>{t`${currentStreak}-day streak`}</span>
          <span className='font-regular text-xs text-indigo-900 lg:text-base'>
            {t`${daysLeft} days left to achieve ${numberOfDaysOfNextStreakBadge}-day streak badge!`}
          </span>
        </div>
      </div>
      <div className='flex flex-1 items-center rounded-xl bg-gradient-to-r from-orange-100 to-red-50 text-white lg:rounded-2xl'>
        <div className='flex flex-row p-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-[9px] bg-white drop-shadow-sm lg:h-[72px] lg:w-[72px] lg:rounded-2xl'>
            <Zap className='h-5 w-5 text-orange-500 lg:h-8 lg:w-8' />
          </div>
        </div>
        <div className='flex flex-col gap-y-1'>
          <span className='text-sm font-medium text-orange-800 lg:text-lg'>{t`${longestStreak}-day streak`}</span>
          <span className='font-regular text-xs text-orange-900 lg:text-base'>{t`Your Longest Streak`}</span>
        </div>
      </div>
    </div>
  )
}
