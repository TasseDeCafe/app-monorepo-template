import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { useCurrentStreakFromXp, useGetNumberOfDaysOfNextStreakBadgeFromXp } from '@/hooks/api/user/user-hooks'
import { useLingui } from '@lingui/react/macro'

export const MobileStreakCard = () => {
  const { t } = useLingui()

  const currentStreak = useCurrentStreakFromXp()
  const numberOfDaysOfNextStreakBadge = useGetNumberOfDaysOfNextStreakBadgeFromXp()
  const daysLeft = numberOfDaysOfNextStreakBadge - currentStreak

  const streakProgressStringLength = `${currentStreak}/${numberOfDaysOfNextStreakBadge}`.toString().length

  return (
    <div className='w-full overflow-hidden rounded-2xl'>
      <div className='flex-row items-center bg-gradient-to-r from-indigo-200 to-violet-200 p-3'>
        <div className='flex flex-row items-center'>
          <div className='mr-4 items-center justify-center rounded-xl bg-white p-5'>
            <span
              className={cn('font-medium text-indigo-500', {
                'text-xl': streakProgressStringLength <= 3,
                'text-lg': streakProgressStringLength === 4,
                'text-base': streakProgressStringLength === 5,
                'text-sm': streakProgressStringLength === 6,
                'text-xs': streakProgressStringLength >= 7,
              })}
            >
              {currentStreak}/{numberOfDaysOfNextStreakBadge}
            </span>
          </div>
          <div className='flex-1 pr-6'>
            <div className='flex-row items-center'>
              <p className='text-sm font-medium text-indigo-800'>{t`${currentStreak}-day streak`}</p>
            </div>
            <p className='mt-1 text-xs text-indigo-900'>
              {t`${daysLeft} days left to achieve ${numberOfDaysOfNextStreakBadge}-day streak badge!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
