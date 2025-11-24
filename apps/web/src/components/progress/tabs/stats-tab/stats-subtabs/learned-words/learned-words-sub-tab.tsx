import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys.ts'
import { useLoadMoreOnDocumentScroll } from '../../../../../../hooks/use-load-more-on-document-scroll.tsx'
import { Button } from '../../../../../design-system/button.tsx'
import { ROUTE_PATHS } from '../../../../../../routing/route-paths.ts'
import { useLocation, useNavigate } from 'react-router-dom'
import { LearnedWordsTable } from './learned-words-table.tsx'
import { POSTHOG_EVENTS } from '../../../../../../analytics/posthog/posthog-events.ts'
import { SquaresLoader } from '../../../../../loader/squares-loader.tsx'
import { LanguageCountersPieChart } from './language-counters-pie-chart.tsx'
import { LanguageFilter, LanguageFilterValue } from './language-filter.tsx'
import { SUPPORTED_STUDY_LANGUAGES } from '@template-app/core/constants/lang-codes'
import {
  useGetLearnedWords,
  useGetNumberOfLanguagesLearned,
  useNumberOfLearnedWords,
} from '@/hooks/api/words/words-hooks.ts'
import { useLingui } from '@lingui/react/macro'

export const LearnedWordsSubTab = () => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const numberOfLearnedWords = useNumberOfLearnedWords()
  const languagesLearned = useGetNumberOfLanguagesLearned()
  const [languageFilter, setLanguageFilter] = useState<LanguageFilterValue>(undefined)

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, refetch } =
    useGetLearnedWords(languageFilter)

  useEffect(() => {
    refetch().then()
  }, [languageFilter, refetch])

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { resetLoading } = useLoadMoreOnDocumentScroll({
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage().then(() => {})
      }
    },
    hasMore: hasNextPage,
  })

  useEffect(() => {
    const refetchData = async () => {
      await queryClient.resetQueries({ queryKey: [QUERY_KEYS.GET_LEARNED_WORDS, languageFilter] })
    }

    if (location.pathname.includes(ROUTE_PATHS.PROGRESS)) {
      const queryData = queryClient.getQueryData([QUERY_KEYS.GET_LEARNED_WORDS, languageFilter])
      if (queryData) {
        refetchData().then()
      }
    }
  }, [location.pathname, queryClient, languageFilter])
  useEffect(() => {
    if (!isFetchingNextPage) {
      resetLoading()
    }
  }, [isFetchingNextPage, resetLoading])

  const handleClick = () => {
    navigate(ROUTE_PATHS.DASHBOARD)
  }

  const filteredData = useMemo(() => {
    return data?.pages.flatMap((page) => page.userPronunciations ?? []) ?? []
  }, [data])

  const handleLanguageChange = (value: LanguageFilterValue) => {
    setLanguageFilter(value)
  }

  if (status === 'pending') {
    return (
      <div className='mt-8 flex w-full justify-center'>
        <SquaresLoader />
      </div>
    )
  }

  return (
    <div className='flex h-full w-full flex-col items-center py-4'>
      {data?.pages && data.pages.length > 0 && numberOfLearnedWords > 0 ? (
        <div className='flex h-full w-full flex-col items-center justify-between gap-y-8 p-1 md:gap-y-32 md:p-2'>
          {languagesLearned > 1 && <LanguageCountersPieChart />}
          <div className='flex w-full flex-col gap-y-4 pb-4 md:max-w-4xl lg:max-w-6xl'>
            <div className='w-full lg:w-1/4'>
              <LanguageFilter
                onLanguageSelect={handleLanguageChange}
                langCodes={[undefined, ...SUPPORTED_STUDY_LANGUAGES]}
                defaultValue={undefined}
              />
            </div>
            <LearnedWordsTable data={filteredData} languageFilter={languageFilter} />
            {(isFetching || isFetchingNextPage) && (
              <div className='flex h-full w-full justify-center'>
                <SquaresLoader />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='flex h-full w-full flex-col justify-center gap-y-4 px-2 py-4 pb-20 md:max-w-screen-xs md:gap-y-8 md:pb-40'>
          <h1 className='text-center text-4xl font-bold tracking-tighter text-stone-800'>
            {t`You don't have any words learned yet`}
          </h1>
          <h2 className='text-center text-2xl font-bold tracking-tighter text-stone-800'>
            {t`Go to exercises to learn new words`}
          </h2>
          <Button
            onClick={handleClick}
            className='border-white bg-gradient-to-r from-indigo-500 to-indigo-400 text-white hover:from-indigo-600 hover:to-indigo-600'
          >
            {t`Go to exercises`}
          </Button>
        </div>
      )}
    </div>
  )
}
