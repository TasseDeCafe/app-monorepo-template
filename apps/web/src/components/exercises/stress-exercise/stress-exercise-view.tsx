import { useEffect, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { BigCard } from '../../design-system/big-card'
import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { TextForStressExercise } from './text-for-stress-exercise'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { useSelector } from 'react-redux'
import { StressExerciseSkeleton } from './stress-exercise-skeleton'
import { Button } from '../../design-system/button'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { StressExerciseControls } from './controls/stress-exercise-controls'
import { WithNavbar } from '../../navbar/with-navbar.tsx'
import { useGetStressExercises } from '@/hooks/api/stress-exercise/stress-exercise-hooks'
import { useFrequencySliderPosition } from '@/hooks/api/user-settings/user-settings-hooks'
import { Eye, ArrowRight } from 'lucide-react'
import { Trans, useLingui } from '@lingui/react/macro'

export const StressExerciseView = () => {
  const { t } = useLingui()

  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const studyDialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const position = useFrequencySliderPosition(studyLanguage)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [selectedSyllable, setSelectedSyllable] = useState<number | null>(null)
  const [isEvaluated, setIsEvaluated] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { data, fetchNextPage, isLoading, isFetchingNextPage } = useGetStressExercises()

  const allExercises = data?.pages.flat() ?? []
  const currentExercise = allExercises[currentExerciseIndex]

  const stressedSyllable = currentExercise?.syllables[currentExercise.stressIndex]?.text

  const handleEvaluate = () => {
    if (selectedSyllable !== null) {
      setIsCorrect(selectedSyllable === currentExercise.stressIndex)
      setIsEvaluated(true)
    }
  }

  const handleNext = () => {
    // If we're 4 exercises away from the end, fetch more
    // We don't fetch the next page if a request is already in flight.
    if (currentExerciseIndex >= allExercises.length - 4 && !isFetchingNextPage) {
      fetchNextPage()
    }

    setCurrentExerciseIndex((prev) => prev + 1)
    setSelectedSyllable(null)
    setIsEvaluated(false)
    setIsCorrect(false)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentExercise) return

      const syllableCount = currentExercise.syllables.length

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          if (!isEvaluated) {
            setSelectedSyllable((prev) => {
              if (prev === null) return syllableCount - 1
              return prev === 0 ? syllableCount - 1 : prev - 1
            })
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          if (!isEvaluated) {
            setSelectedSyllable((prev) => {
              if (prev === null) return 0
              return prev === syllableCount - 1 ? 0 : prev + 1
            })
          }
          break
        case 'Enter':
          event.preventDefault()
          if (!isEvaluated && selectedSyllable !== null) {
            handleEvaluate()
          } else if (isEvaluated) {
            handleNext()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentExercise, handleEvaluate, handleNext, isEvaluated, selectedSyllable])

  // Reset the current pronunciation-exercise index when the settings change
  useEffect(() => {
    setCurrentExerciseIndex(0)
    setSelectedSyllable(null)
    setIsEvaluated(false)
    setIsCorrect(false)
  }, [studyLanguage, studyDialect, position])

  const handleSyllableClick = (index: number) => {
    if (!isEvaluated) {
      setSelectedSyllable(index)
    }
  }

  const handleGoToDashboard = () => {
    POSTHOG_EVENTS.click('go_back')
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
        <BigCard className='container relative flex h-full flex-col overflow-hidden p-2 md:pb-2 md:pt-2 lg:pb-1 lg:pt-2'>
          <Button
            href={ROUTE_PATHS.DASHBOARD}
            onClick={handleGoToDashboard}
            className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
          >
            <ArrowLeft className='' />
          </Button>
          <StressExerciseControls />
          {isLoading || !currentExercise ? (
            <StressExerciseSkeleton />
          ) : (
            <div className='mx-auto flex h-full w-full flex-col overflow-hidden'>
              {/* Main content */}
              <div className='flex-1 space-y-8 overflow-y-auto'>
                <div className='space-y-2 text-center'>
                  <div className='text-2xl font-semibold'>{t`Choose the stressed syllable`}</div>
                </div>

                <div className='space-y-4'>
                  <TextForStressExercise text={currentExercise.sentence} studyLanguage={LangCode.ENGLISH} />

                  <div className='flex flex-col items-center gap-2'>
                    <div className='my-4 text-2xl font-bold'>{currentExercise.word}</div>
                  </div>

                  <div className='space-y-4'>
                    {/* Syllable buttons */}
                    <div className='flex flex-wrap justify-center gap-3'>
                      {currentExercise.syllables.map((syllable, index) => (
                        <button
                          key={index}
                          onClick={() => handleSyllableClick(index)}
                          className={`group relative flex h-12 items-center rounded-xl border px-4 transition-all duration-100 ${
                            !isEvaluated
                              ? selectedSyllable === index
                                ? 'scale-110 border-indigo-500 bg-indigo-500 text-white shadow-lg'
                                : 'border-gray-200 hover:scale-105 hover:bg-gray-50 active:bg-gray-100'
                              : index === currentExercise.stressIndex
                                ? 'scale-110 border-green-500 bg-green-500 text-white shadow-lg'
                                : selectedSyllable === index
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : 'border-gray-200'
                          }`}
                        >
                          <span
                            className={`text-xl ${!isEvaluated && selectedSyllable !== index ? 'text-gray-700' : ''}`}
                          >
                            {syllable.text}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Fixed-height feedback container */}
                    <div className='flex h-8 justify-center'>
                      {isEvaluated &&
                        (isCorrect ? (
                          <div className='flex items-center gap-2 text-green-500'>
                            <Check size={24} />
                            <span>{t`Correct!`}</span>
                          </div>
                        ) : (
                          <div className='flex items-center gap-2 text-red-500'>
                            <X size={24} />
                            <span>
                              <Trans>Try again! The stress is on &ldquo;{stressedSyllable}&rdquo;</Trans>
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex flex-shrink-0 flex-col gap-1 border-t border-gray-200 pt-2'>
                {!isEvaluated ? (
                  <Button
                    onClick={handleEvaluate}
                    disabled={selectedSyllable === null}
                    className='w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 md:w-1/2 md:self-center'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t`Show Answer`}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className='w-full bg-indigo-600 text-white hover:bg-indigo-700 md:w-1/2 md:self-center'
                  >
                    <ArrowRight className='mr-2 h-4 w-4' />
                    {t`Next Word`}
                  </Button>
                )}
              </div>
            </div>
          )}
        </BigCard>
      </div>
    </WithNavbar>
  )
}
