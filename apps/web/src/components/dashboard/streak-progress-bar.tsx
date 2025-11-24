import { useState, useEffect } from 'react'
import { useCurrentStreakFromXp, useGetNumberOfDaysOfNextStreakBadgeFromXp } from '@/hooks/api/user/user-hooks'
import { useLingui } from '@lingui/react/macro'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const StreakProgressBar = () => {
  const { t } = useLingui()

  const [displayProgress, setDisplayProgress] = useState(0)
  const currentStreak = useCurrentStreakFromXp()
  const numberOfDaysOfNextStreakBadge = useGetNumberOfDaysOfNextStreakBadgeFromXp()
  const percentageOfCurrentStreak = (currentStreak / numberOfDaysOfNextStreakBadge) * 100

  const streakProgressString = `${currentStreak}/${numberOfDaysOfNextStreakBadge} ${t`days`}`

  useEffect(() => {
    const setProgressAfter50ms = async () => {
      await sleep(50)
      setDisplayProgress(percentageOfCurrentStreak)
    }
    setProgressAfter50ms().then()
  }, [percentageOfCurrentStreak])

  return (
    <div className='relative h-5 w-full overflow-hidden rounded-xl bg-slate-100 lg:mt-6 lg:h-8 lg:rounded-full'>
      <div
        className='h-full rounded-full bg-gradient-to-r from-indigo-200 to-indigo-400 transition-all duration-1000 ease-in'
        style={{ width: `${displayProgress}%` }}
      />
      <div className='absolute inset-0 flex items-center justify-end pr-4'>
        <span className='text-xs font-normal text-slate-400 lg:text-base'>{streakProgressString}</span>
      </div>
    </div>
  )
}
