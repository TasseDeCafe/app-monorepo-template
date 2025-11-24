import { DAILY_STUDY_TIME_ONBOARDING_OPTIONS } from '@yourbestaccent/core/constants/daily-study-constants'
import { useEffect, useState } from 'react'
import { NavigationButton } from '../navigation-button.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { DailyStudyTimeCard } from './daily-study-time-card.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { usePatchDailyStudyMinutes } from '@/hooks/api/user/user-hooks.ts'
import { accountActions } from '@/state/slices/account-slice'
import { useDispatch } from 'react-redux'
import { useLingui } from '@lingui/react/macro'

export const ChooseDailyStudyTimeView = () => {
  const { t } = useLingui()

  const navigate = useNavigate()
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)
  const dispatch = useDispatch()

  const { mutate, isPending } = usePatchDailyStudyMinutes({
    onSuccess: () => {
      dispatch(accountActions.setDailyStudyMinutes(selectedMinutes))
      navigate(ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS)
    },
  })

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const onPreviousClick = () => {
    navigate(ROUTE_PATHS.ONBOARDING_TOPICS)
  }

  const onNextClick = () => {
    if (selectedMinutes) {
      mutate({ dailyStudyMinutes: selectedMinutes })
    }
  }

  const handleMinutesClick = (minutes: number) => {
    if (selectedMinutes === minutes) {
      setSelectedMinutes(null)
    } else {
      setSelectedMinutes(minutes)
    }
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-col'>
        <div className='flex w-full items-center px-4 py-4'>
          <div className='mx-auto flex h-full w-full items-center md:w-3/4 lg:w-2/3 3xl:w-1/2'>
            <button onClick={onPreviousClick} className='text-gray-500 hover:text-gray-700' disabled={isPending}>
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className='mb-52 flex justify-center'>
          <div className='flex w-full flex-col items-center gap-y-4 px-4 pt-0 md:w-2/3 lg:w-1/3 3xl:w-1/3'>
            <div className='flex max-w-md flex-col items-center'>
              <h1 className='max-w-xl text-center text-4xl font-bold tracking-tighter'>
                {t`Choose your daily goal for learning`}
              </h1>
              <span className='text-md max-w-xl text-center tracking-tighter text-gray-400'>
                {t`(You can always change it later)`}
              </span>
            </div>
            <div className='flex w-full flex-col gap-y-2'>
              {DAILY_STUDY_TIME_ONBOARDING_OPTIONS.map((minutes) => (
                <DailyStudyTimeCard
                  key={minutes}
                  minutes={minutes}
                  handleClick={handleMinutesClick}
                  isSelected={selectedMinutes === minutes}
                />
              ))}
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 w-full bg-gray-50'>
          <div className='pointer-events-none absolute bottom-full left-0 right-0 h-20 bg-gradient-to-b from-transparent to-gray-50' />
          <div className='lg:w-2/2 mx-auto flex w-full px-4 pb-8 pt-4 md:w-2/3 lg:w-1/3 3xl:w-1/3'>
            <NavigationButton
              onClick={onNextClick}
              disabled={!selectedMinutes || isPending}
              className='w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
            >
              {isPending ? t`Loading...` : t`Continue`}
            </NavigationButton>
          </div>
        </div>
      </div>
    </WithNavbar>
  )
}
