import { BigCard } from '../design-system/big-card'
import { TrendingUp, Trophy } from 'lucide-react'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import { useState } from 'react'
import {
  LanguageFilter,
  LanguageFilterValue,
} from '../progress/tabs/stats-tab/stats-subtabs/learned-words/language-filter'
import { TimePeriodFilter, TimePeriodFilterValue } from './time-period-filter'
import { FullViewSquaresLoader } from '../loader/full-view-squares-loader.tsx'
import { WithNavbar } from '../navbar/with-navbar.tsx'
import { useUserNickname } from '@/hooks/api/user/user-hooks'
import { LeaderboardEntry } from '@yourbestaccent/api-client/orpc-contracts/leaderboard-contract'
import { useGetLeaderboard } from '@/hooks/api/leaderboard/leaderboard-hooks'
import { useLingui } from '@lingui/react/macro'

const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => {
  const { t } = useLingui()

  const { data: nickname } = useUserNickname()

  const getTrophyForPosition = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className='h-5 w-5 text-yellow-500' />
      case 1:
        return <Trophy className='h-5 w-5 text-slate-400' />
      case 2:
        return <Trophy className='h-5 w-5 text-amber-700' />
      default:
        return null
    }
  }

  if (!entries || entries.length === 0) {
    return (
      <div className='py-8 text-center text-slate-400'>{t`No entries yet. Be the first one to make it to the leaderboard!`}</div>
    )
  }

  return (
    <div className='space-y-3'>
      {entries.map((entry, index) => {
        const isCurrentUser = entry.nickname === nickname
        return (
          <div
            key={index}
            className={`flex items-center justify-between rounded-2xl border px-6 py-4 shadow-sm transition-colors ${isCurrentUser ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-white'}`}
          >
            <div className='flex w-full items-center gap-4'>
              {index < 3 ? (
                <div className='min-w-[32px]'>{getTrophyForPosition(index)}</div>
              ) : (
                <span className='min-w-[32px] font-medium text-slate-400'>{index + 1}</span>
              )}
              <div className='flex flex-1 flex-row items-center'>
                <span className={`font-medium ${isCurrentUser ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {entry.nickname || t`Anonymous User`}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-indigo-600'>{entry.xp}</span>
                <span className='text-slate-400'>xp</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const UserPosition = ({ entries }: { entries: LeaderboardEntry[] }) => {
  const { t } = useLingui()

  const { data: nickname } = useUserNickname()
  const userPosition = entries.findIndex((entry) => entry.nickname === nickname)

  if (userPosition >= 0 && userPosition < 3) {
    return null
  }

  return (
    <div className='flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50'>
        {userPosition === -1 ? (
          <TrendingUp className='h-5 w-5 text-indigo-500' />
        ) : (
          <Trophy className='h-5 w-5 text-indigo-500' />
        )}
      </div>
      <div className='flex flex-col'>
        <span className='text-sm font-medium text-slate-600'>{t`Your Position`}</span>
        <>
          {userPosition === -1 && (
            <span className='text-sm text-slate-500'>{t`You're not on the leaderboard yet. Practice some exercises to start competing with others!`}</span>
          )}
          {userPosition !== 1 && (
            <div className='flex items-baseline gap-2'>
              <span className='text-lg font-bold text-slate-800'>#{userPosition + 1}</span>
              <span className='text-sm text-slate-500'>
                {t`of`} {entries.length}
              </span>
            </div>
          )}
        </>
      </div>
    </div>
  )
}

export const LeaderboardView = () => {
  const { t } = useLingui()

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilterValue>(undefined)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodFilterValue>('allTime')
  const { entries, isLoading } = useGetLeaderboard(selectedLanguage, selectedTimePeriod)

  const handleLanguageChange = (value: LanguageFilterValue) => {
    setSelectedLanguage(value)
  }

  const handleTimePeriodChange = (value: TimePeriodFilterValue) => {
    setSelectedTimePeriod(value)
  }

  return (
    <WithNavbar>
      <div className='w-full flex-col items-center p-2 py-4 md:container lg:flex 3xl:py-12'>
        <BigCard className='flex flex-col items-start gap-6 p-6 sm:p-8'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-semibold text-gray-800'>{t`Leaderboard`}</h1>
            <p className='text-slate-400'>{t`See how you rank against other learners`}</p>
          </div>

          <div className='w-full space-y-3'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                <div className='w-full sm:w-48'>
                  <TimePeriodFilter onTimePeriodSelect={handleTimePeriodChange} defaultValue='allTime' />
                </div>
                <div className='w-full sm:w-48'>
                  <LanguageFilter
                    onLanguageSelect={handleLanguageChange}
                    langCodes={[undefined, ...SUPPORTED_STUDY_LANGUAGES]}
                    defaultValue={undefined}
                  />
                </div>
              </div>
            </div>

            {!isLoading && 0 < entries.length && <UserPosition entries={entries} />}

            {isLoading ? (
              <div className='flex justify-center py-8'>
                <FullViewSquaresLoader />
              </div>
            ) : (
              <LeaderboardTable entries={entries} />
            )}
          </div>
        </BigCard>
      </div>
    </WithNavbar>
  )
}
