import { useLocation, useNavigate } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { FC, Fragment, useEffect, useState } from 'react'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { ROUTE_PATHS } from '../../../../routing/route-paths.ts'
import { ChartNoAxesColumn } from 'lucide-react'
import { LearnedWordsSubTab } from './stats-subtabs/learned-words/learned-words-sub-tab.tsx'
import { SavedWordsSubTab } from './stats-subtabs/saved-words/saved-words-sub-tab.tsx'
import { useLingui } from '@lingui/react/macro'

// we need separate visibility flag for each tab to make sure the animation of tab moving up on tab switch works
const initialVisibilityState = {
  'learned-words': false,
  'saved-words': false,
}

const getCurrentStatsTab = (pathname: string): StatsSubTab => {
  if (pathname === ROUTE_PATHS.PROGRESS_STATS_LEARNED_WORDS) {
    return 'learned-words'
  } else if (pathname === ROUTE_PATHS.PROGRESS_STATS_SAVED_WORDS) {
    return 'saved-words'
  } else {
    return 'learned-words'
  }
}

type StatsSubTab = keyof typeof initialVisibilityState

type StatsSubTabsMapping = { value: StatsSubTab; label: string; component: FC; route: string }

export const StatsTab = () => {
  const { t } = useLingui()

  const navigate = useNavigate()
  const location = useLocation()
  const currentStatsTabTab = getCurrentStatsTab(location.pathname)
  const [isVisible, setIsVisible] = useState<Record<StatsSubTab, boolean>>(initialVisibilityState)

  useEffect(() => {
    setIsVisible({ ...initialVisibilityState, [currentStatsTabTab]: true })
    return () => {
      setIsVisible(initialVisibilityState)
    }
  }, [currentStatsTabTab])

  const statsSubTabsMappings: StatsSubTabsMapping[] = [
    {
      value: 'learned-words',
      label: t`Learned Words`,
      component: LearnedWordsSubTab,
      route: ROUTE_PATHS.PROGRESS_STATS_LEARNED_WORDS,
    },
    {
      value: 'saved-words',
      label: t`Saved Words`,
      component: SavedWordsSubTab,
      route: ROUTE_PATHS.PROGRESS_STATS_SAVED_WORDS,
    },
  ]

  const handleTabChange = (value: string) => {
    setIsVisible({ ...initialVisibilityState })
    navigate(statsSubTabsMappings.find((tab) => tab.value === value)?.route ?? ROUTE_PATHS.PROGRESS_STATS_LEARNED_WORDS)
  }

  return (
    <div className='flex w-full flex-col items-center space-y-6'>
      <h1 className='flex flex-row items-center gap-x-2 text-3xl font-bold tracking-tight'>
        <ChartNoAxesColumn size={24} className='text-yellow-500' />
        {t`Stats`}
      </h1>
      <Tabs.Root
        value={currentStatsTabTab}
        onValueChange={handleTabChange}
        className='flex w-full flex-col items-center'
      >
        <Tabs.List className='flex w-full rounded-full bg-indigo-50 p-1 md:w-[540px]'>
          {statsSubTabsMappings.map((tab) => (
            <Fragment key={tab.value}>
              <Tabs.Trigger
                value={tab.value}
                className='relative flex-1 rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-100 ease-in-out hover:bg-indigo-100 hover:text-gray-900 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75'
              >
                {tab.value === currentStatsTabTab && (
                  <motion.div
                    layoutId='active-stats-tab'
                    className='absolute inset-0 rounded-full bg-indigo-500 shadow-sm'
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span
                  className={cn(
                    'color-transition relative z-10 duration-300',
                    { 'text-white': tab.value === currentStatsTabTab },
                    { 'text-gray-900': tab.value !== currentStatsTabTab }
                  )}
                >
                  {tab.label}
                </span>
              </Tabs.Trigger>
            </Fragment>
          ))}
        </Tabs.List>
        <div className='mt-6 flex w-full flex-col justify-center'>
          {statsSubTabsMappings.map((tab) => (
            <Tabs.Content key={tab.value} value={tab.value} className='flex w-full flex-col items-center space-y-6'>
              <div
                className={`flex w-full flex-col items-center space-y-6 transition-all duration-500 ease-in-out ${
                  isVisible[currentStatsTabTab] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                {tab.component && <tab.component />}
              </div>
            </Tabs.Content>
          ))}
        </div>
      </Tabs.Root>
    </div>
  )
}
