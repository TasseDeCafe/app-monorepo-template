import { Award, CircleHelp, Flame, Trophy } from 'lucide-react'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { Link } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/popover.tsx'
import { useLingui } from '@lingui/react/macro'

type Props = {
  currentStreak: number
  longestStreak: number
  numberOfDaysOfNextStreakBadge: number
  numberOfAchievedStreakBadges: number
}

export const Streak = ({
  currentStreak,
  longestStreak,
  numberOfDaysOfNextStreakBadge,
  numberOfAchievedStreakBadges,
}: Props) => {
  const { t } = useLingui()

  const progressWidth =
    numberOfDaysOfNextStreakBadge > 0 ? Math.min((currentStreak / numberOfDaysOfNextStreakBadge) * 100, 100) : 0

  const daysUntilNextBadge = numberOfDaysOfNextStreakBadge - currentStreak

  return (
    <div className='rounded-lg border bg-white p-6 shadow-lg transition-all duration-1000 ease-in-out'>
      <h2 className='mb-4 flex flex-row items-center gap-x-2 text-center text-2xl font-bold text-gray-900'>
        {t`Your Learning Streak`}
        <div className='flex flex-row'>
          <Popover>
            <PopoverTrigger>
              <CircleHelp className='h-4 w-4 text-stone-400' />
            </PopoverTrigger>
            <PopoverContent className='bg-white text-center text-sm shadow-lg'>{t`A day counts towards your streak if you learn at least one word. A word is considered learned when it's marked in green for the first time in an exercise evaluation.`}</PopoverContent>
          </Popover>
        </div>
      </h2>
      <div className='mb-6 flex items-center justify-center'>
        <div className='relative'>
          <Flame className='h-20 w-20 animate-pulse text-orange-500' />
        </div>
      </div>
      <p className='mb-2 flex flex-row items-center justify-center gap-x-2 text-center text-lg font-semibold text-gray-700'>
        {t`${currentStreak} Day Streak!`}
      </p>
      <p className='mb-6 text-center text-sm text-indigo-600'>
        {daysUntilNextBadge > 0
          ? t`${daysUntilNextBadge} days left to achieve ${numberOfDaysOfNextStreakBadge}-day streak badge!`
          : t`You've reached the highest badge! Keep it up!`}
      </p>
      <div className='mb-6 grid grid-cols-1 gap-4'>
        <Popover>
          <PopoverTrigger>
            <div className='rounded-lg bg-purple-50 p-4'>
              <div className='mb-2 flex items-center justify-center'>
                <Trophy className='mr-2 h-6 w-6 text-purple-600' />
                <span className='text-xl font-semibold text-purple-600'>{longestStreak} days</span>
              </div>
              <p className='text-center text-sm text-gray-600'>{t`Longest Streak`}</p>
            </div>
          </PopoverTrigger>
          <PopoverContent className='bg-white text-center text-sm shadow-lg'>{t`This is the longest streak you've achieved. Keep it up!`}</PopoverContent>
        </Popover>
      </div>
      <div className='mt-4'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-sm font-medium text-gray-600'>{t`Progress`}</span>
          <span className='text-sm font-semibold text-gray-900'>
            {currentStreak}/{numberOfDaysOfNextStreakBadge} {t`days`}
          </span>
        </div>
        <div className='h-2 overflow-hidden rounded-full bg-gray-200'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-in'
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
      <div className='mt-6 flex w-full items-center justify-between'>
        <Link to={ROUTE_PATHS.PROGRESS_BADGES_STREAK} className='flex w-full justify-center'>
          <div className='flex w-full justify-center'>
            <Award className='mr-2 h-5 w-5 text-yellow-500' />
            <span className='text-sm text-gray-600'>{t`Badges Earned: ${numberOfAchievedStreakBadges}`}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
