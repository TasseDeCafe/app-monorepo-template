import { useEffect, useMemo } from 'react'
import { ArrowLeft, Calendar, FileText, Globe, Hash, History } from 'lucide-react'
import { useLoadMoreOnDocumentScroll } from '@/hooks/use-load-more-on-document-scroll.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { CustomCircularFlag } from '../../../design-system/custom-circular-flag'
import { BigCard } from '../../../design-system/big-card'
import { Button } from '../../../design-system/button'
import { WithNavbar } from '../../../navbar/with-navbar'
import { SquaresLoader } from '../../../loader/squares-loader'
import { useRetrievePronunciationEvaluationExerciseHistory } from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

export const HistoryTab = () => {
  const { t, i18n } = useLingui()

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } =
    useRetrievePronunciationEvaluationExerciseHistory()

  const { resetLoading } = useLoadMoreOnDocumentScroll({
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage().then(() => {})
      }
    },
    hasMore: hasNextPage,
  })

  useEffect(() => {
    if (!isFetchingNextPage) {
      resetLoading()
    }
  }, [isFetchingNextPage, resetLoading])

  const allExercises = useMemo(() => {
    return data?.pages.flatMap((page) => page?.exercises || []) || []
  }, [data])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleGoToProgress = () => {
    POSTHOG_EVENTS.click('go_back')
  }

  if (status === 'pending') {
    return (
      <WithNavbar>
        <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
          <BigCard className='container relative flex flex-1 flex-col items-center justify-center'>
            <Button
              href={ROUTE_PATHS.PROGRESS}
              onClick={handleGoToProgress}
              className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
            >
              <ArrowLeft className='' />
            </Button>
            <div className='flex flex-col items-center space-y-4'>
              <History size={48} className='animate-pulse text-indigo-500' />
              <p className='text-gray-600'>{t`Loading your exercise history...`}</p>
            </div>
          </BigCard>
        </div>
      </WithNavbar>
    )
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
        <BigCard className='container relative flex flex-1 flex-col'>
          <Button
            href={ROUTE_PATHS.PROGRESS}
            onClick={handleGoToProgress}
            className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
          >
            <ArrowLeft className='' />
          </Button>
          <h1 className='mb-6 flex flex-row items-center justify-center gap-x-2 text-3xl font-bold tracking-tight'>
            <History size={24} className='text-indigo-500' />
            {t`Exercise History`}
          </h1>

          {allExercises.length === 0 ? (
            <div className='flex flex-1 flex-col items-center justify-center space-y-4'>
              <History size={48} className='text-gray-400' />
              <p className='whitespace-pre-line text-center text-gray-600'>{t`No pronunciation exercises found yet.
Start practicing to see your history here!`}</p>
            </div>
          ) : (
            <div className='flex w-full flex-1 flex-col items-center'>
              <div className='w-full max-w-6xl'>
                {/* Table Header */}
                <div className='hidden gap-4 rounded-t-lg border-x border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 lg:grid lg:grid-cols-12'>
                  <div className='col-span-1 flex items-center gap-2'>
                    <Hash size={16} />
                  </div>
                  <div className='col-span-2 flex items-center gap-2'>
                    <Calendar size={16} />
                    {t`Date`}
                  </div>
                  <div className='col-span-2 flex items-center gap-2'>
                    <Globe size={16} />
                    {t`Language`}
                  </div>
                  <div className='col-span-6 flex items-center gap-2'>
                    <FileText size={16} />
                    {t`Exercise Text`}
                  </div>
                  <div className='col-span-1 text-center'>{t`Attempts`}</div>
                </div>

                {/* Table Body */}
                <div className='divide-y divide-gray-200 rounded-b-lg border border-gray-200 bg-white'>
                  {allExercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className='grid grid-cols-1 gap-4 px-4 py-4 transition-colors hover:bg-gray-50 lg:grid-cols-12'
                    >
                      {/* Mobile layout */}
                      <div className='space-y-2 lg:hidden'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium text-gray-900'>#{index + 1}</span>
                          <span className='text-sm text-gray-500'>{formatDate(exercise.createdAt)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <CustomCircularFlag languageOrDialectCode={exercise.language} className='h-4 w-4' />
                          <span className='text-sm font-medium text-gray-700'>
                            {i18n._(langNameMessages[exercise.language])}
                          </span>
                        </div>
                        <p className='line-clamp-2 text-sm text-gray-700'>{exercise.text}</p>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-500'>
                            {exercise.attempts.length} attempt{exercise.attempts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className='hidden lg:contents'>
                        <div className='col-span-1 flex items-center'>
                          <span className='text-sm font-medium text-gray-900'>{index + 1}</span>
                        </div>
                        <div className='col-span-2 flex items-center'>
                          <span className='text-sm text-gray-600'>{formatDate(exercise.createdAt)}</span>
                        </div>
                        <div className='col-span-2 flex items-center'>
                          <span className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700'>
                            <CustomCircularFlag languageOrDialectCode={exercise.language} className='h-3 w-3' />
                            {i18n._(langNameMessages[exercise.language])}
                          </span>
                        </div>
                        <div className='col-span-6 flex items-center'>
                          <p className='line-clamp-2 text-sm text-gray-700'>{exercise.text}</p>
                        </div>
                        <div className='col-span-1 flex items-center justify-center'>
                          <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700'>
                            {exercise.attempts.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loading indicator for infinite scroll */}
                {isFetching && (
                  <div className='flex w-full justify-center py-4'>
                    <SquaresLoader />
                  </div>
                )}
              </div>
            </div>
          )}
        </BigCard>
      </div>
    </WithNavbar>
  )
}
