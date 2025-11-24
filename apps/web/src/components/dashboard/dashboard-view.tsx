import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { BigCard } from '../design-system/big-card.tsx'
import { ExerciseCard } from './exercise-card.tsx'
import { StreakCards } from './streak-cards'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { AudioLines, FileAudio, Languages, MessageSquareMoreIcon, Mic } from 'lucide-react'
import { StreakProgressBar } from './streak-progress-bar.tsx'
import { EXTERNAL_LINKS } from '@yourbestaccent/core/constants/external-links.ts'
import { ExercisesList } from './exercises-list.tsx'
import { MobileStreakCard } from './mobile-streak-card.tsx'
import { MobileStreakProgressBar } from './mobile-streak-progress-bar.tsx'
import { useSelector } from 'react-redux'
import { selectEmail, selectStudyLanguageOrEnglish } from '@/state/slices/account-slice.ts'
import { getConfig } from '@/config/environment-config.ts'
import { WithNavbar } from '../navbar/with-navbar.tsx'
import { checkIsTestUser } from '@/utils/test-users-utils'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

const DashboardDesktop = () => {
  const { t, i18n } = useLingui()

  const email = useSelector(selectEmail)
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const isTestUser = checkIsTestUser(email)

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const NUMBER_OF_ROWS = getConfig().featureFlags.isTranslationExerciseEnabled() || isTestUser ? 3 : 2
  const GAP_BETWEEN_ROWS = 6
  const EXERCISE_CARD_HEIGHT = 60
  const totalGapHeight = (NUMBER_OF_ROWS - 1) * GAP_BETWEEN_ROWS
  const totalCardHeight = NUMBER_OF_ROWS * EXERCISE_CARD_HEIGHT
  // We need to divide by 4 to go from tailwind units to rems
  const totalGridHeightInRems = (totalCardHeight + totalGapHeight) / 4

  const studyLanguageName = i18n._(langNameMessages[studyLanguage])

  return (
    <div className='hidden w-full flex-col items-center p-2 py-4 md:container lg:flex 3xl:py-16'>
      <BigCard className='flex flex-col items-start gap-2 md:gap-y-6'>
        <div className='grid w-full grid-cols-1 gap-6 md:grid-cols-[1fr,1fr,1px,1fr]'>
          <div className='col-span-2 md:col-span-3'>
            <h1 className='text-3xl text-[32px] font-semibold text-gray-800'>{t`Exercises`}</h1>
            <p className='mt-2 text-slate-400'>{t`Continue where you left off or explore new exercises.`}</p>
          </div>
          <div>
            <h2 className='text-3xl font-semibold text-gray-800'>{t`Your Learning Streak`}</h2>
            <p className='mt-2 text-slate-400'>{t`Explore your progress`}</p>
          </div>
          {/* Exercise cards container - spans first 2 columns only */}
          <div className='col-span-2 grid grid-cols-2 gap-6'>
            {/* First Row */}
            {(getConfig().featureFlags.isTranslationExerciseEnabled() || isTestUser) && (
              <Link to={ROUTE_PATHS.TRANSLATION_EXERCISE_START} className='w-full'>
                <ExerciseCard
                  name={t`Adaptive translation practice`}
                  description={t`Translate sentences adapted to your level`}
                  icon={Languages}
                  isMainExercise={true}
                />
              </Link>
            )}
            <Link to={ROUTE_PATHS.CONVERSATION_EXERCISE} className='w-full'>
              <ExerciseCard
                name={t`Conversation Practice`}
                description={t`Real-world conversations`}
                icon={MessageSquareMoreIcon}
              />
            </Link>
            {/* Second Row */}
            <Link to={ROUTE_PATHS.PRONUNCIATION_EVALUATION_STANDARD_EXERCISE_START} className='w-full'>
              <ExerciseCard
                name={t`Pronunciation practice`}
                description={t`Pronounce words tailored to your language level`}
                icon={Mic}
              />
            </Link>
            <Link to={ROUTE_PATHS.STRESS_EXERCISE} className='w-full'>
              <ExerciseCard
                name={t`Stress practice`}
                description={t`Master word stress patterns in sentences`}
                icon={AudioLines}
                disabledText={t`Not available for ${studyLanguageName}`}
              />
            </Link>
            {/* Third Row */}
            <Link to={ROUTE_PATHS.PRONUNCIATION_EVALUATION_CUSTOM_EXERCISE_START} className='w-full'>
              <ExerciseCard
                name={t`Custom pronunciation practice`}
                description={t`Use your own text for targeted practice`}
                icon={FileAudio}
              />
            </Link>
          </div>
          {/* Vertical line and streak cards */}
          <div className='relative'>
            <VerticalDashedLine
              className='absolute right-0 top-0 text-slate-100'
              width={2}
              dashLength={16}
              gapLength={15}
              height={`${totalGridHeightInRems}rem`}
            />
          </div>
          <div className='row-span-3 flex flex-col'>
            <StreakCards />
            <StreakProgressBar />
            <HorizontalDashedLine className='mt-6 w-full text-slate-100' height={2} dashLength={15} gapLength={15} />
            <div className='flex flex-col gap-y-6 py-6'>
              <Link
                to={ROUTE_PATHS.PROGRESS_STATS_SAVED_WORDS}
                className='h-14 w-full rounded-2xl border p-4 text-center font-medium text-slate-800 hover:bg-slate-50'
              >
                {t`Go to saved words`}
              </Link>
              <Link
                to={EXTERNAL_LINKS.BETA_VERSION_FEEDBACK_FORM_IN_ENGLISH}
                className='h-14 w-full rounded-2xl border p-4 text-center font-medium text-slate-800 hover:bg-slate-50'
                target='_blank'
                rel='noopener noreferrer'
              >
                {t`Share your feedback`}
              </Link>
            </div>
          </div>
        </div>
      </BigCard>
    </div>
  )
}

const DashboardMobile = () => {
  const { t } = useLingui()

  return (
    <div className='flex w-full flex-col items-center gap-2 p-2 py-4 lg:hidden'>
      <h1 className='mb-1 mt-2 w-full text-left text-base font-semibold text-gray-800'>{t`Your Learning Streak`}</h1>
      <MobileStreakCard />
      <MobileStreakProgressBar />
      <h1 className='mb-1 mt-2 w-full text-left text-base font-semibold text-gray-800'>{t`Our Exercises`}</h1>
      <div className={'max-h-[1000px] w-full overflow-hidden transition-all duration-300 ease-in-out'}>
        <ExercisesList />
      </div>
      <HorizontalDashedLine className='mb-1 mt-1 w-full text-slate-100' height={2} dashLength={15} gapLength={15} />
      <div className='flex w-full flex-row gap-1'>
        <Link
          to={ROUTE_PATHS.PROGRESS_STATS_SAVED_WORDS}
          className='flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-center text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 active:brightness-90'
        >
          {t`Go to saved words`}
        </Link>
        <Link
          to={EXTERNAL_LINKS.BETA_VERSION_FEEDBACK_FORM_IN_ENGLISH}
          className='flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-center text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 active:brightness-90'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t`Share your feedback`}
        </Link>
      </div>
    </div>
  )
}

export const DashboardView = () => {
  return (
    <WithNavbar>
      <DashboardDesktop />
      <DashboardMobile />
    </WithNavbar>
  )
}

const HorizontalDashedLine = ({
  className = 'w-full',
  height = 1,
  dashLength = 5,
  gapLength = 3,
  color = 'currentColor',
}) => {
  const dashArray = `${dashLength} ${gapLength}`

  return (
    <div className={`${className} flex items-center`}>
      <svg width='100%' height={height} className='overflow-visible'>
        <line
          x1='0'
          y1={height / 2}
          x2='100%'
          y2={height / 2}
          stroke={color}
          strokeWidth={height}
          strokeDasharray={dashArray}
          strokeLinecap='round'
        />
      </svg>
    </div>
  )
}

const VerticalDashedLine = ({
  className = 'h-full',
  width = 1,
  dashLength = 5,
  gapLength = 3,
  color = 'currentColor',
  height = '100%',
}) => {
  const dashArray = `${dashLength} ${gapLength}`

  return (
    <div className={`${className} inline-flex justify-center`} style={{ height }}>
      <svg height='100%' width={width} className='overflow-visible'>
        <line
          x1={width / 2}
          y1='0'
          x2={width / 2}
          y2='100%'
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dashArray}
          strokeLinecap='round'
        />
      </svg>
    </div>
  )
}
