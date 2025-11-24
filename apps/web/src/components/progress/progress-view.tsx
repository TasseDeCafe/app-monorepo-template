import { useLocation, useNavigate } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { StreakTab } from './tabs/streak/streak-tab'
import { StatsTab } from './tabs/stats-tab/stats-tab'
import { FC, Fragment, useEffect, useState } from 'react'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { ROUTE_PATHS } from '../../routing/route-paths.ts'
import { BadgesTab } from './tabs/badges-tab/badges-tab.tsx'

import { TrendingUp, History } from 'lucide-react'
import { WithNavbar } from '../navbar/with-navbar.tsx'
import { Button } from '../design-system/button.tsx'
import { useLingui } from '@lingui/react/macro'

// we need separate visibility flag for each tab to make sure the animation of tab moving up on tab switch works
const initialVisibilityState = {
  streak: false,
  badges: false,
  stats: false,
}

const getCurrentProgressTab = (pathname: string): ProgressTab => {
  if (
    [
      ROUTE_PATHS.PROGRESS_BADGES_ALL,
      ROUTE_PATHS.PROGRESS_BADGES_STREAK,
      ROUTE_PATHS.PROGRESS_BADGES_LANGUAGES,
      ROUTE_PATHS.PROGRESS_BADGES_WORDS,
    ].includes(pathname)
  ) {
    return 'badges'
  } else if (
    [
      ROUTE_PATHS.PROGRESS_STATS_SAVED_WORDS,
      ROUTE_PATHS.PROGRESS_STATS_LEARNED_WORDS,
      ROUTE_PATHS.PROGRESS_STATS,
    ].includes(pathname)
  ) {
    return 'stats'
  } else if (pathname === ROUTE_PATHS.PROGRESS_STREAK) {
    return 'streak'
  } else {
    return 'streak'
  }
}

type ProgressTab = keyof typeof initialVisibilityState

type TabMapping = { value: ProgressTab; label: string; component: FC; route: string }

export const ProgressView = () => {
  const { t } = useLingui()

  const navigate = useNavigate()
  const location = useLocation()
  const currentProgressTab = getCurrentProgressTab(location.pathname)
  const [isVisible, setIsVisible] = useState<Record<ProgressTab, boolean>>(initialVisibilityState)

  useEffect(() => {
    setIsVisible({ ...initialVisibilityState, [currentProgressTab]: true })
    return () => {
      setIsVisible(initialVisibilityState)
    }
  }, [currentProgressTab])

  const tabs: TabMapping[] = [
    { value: 'streak', label: t`Streak`, component: StreakTab, route: ROUTE_PATHS.PROGRESS_STREAK },
    { value: 'badges', label: t`Badges`, component: BadgesTab, route: ROUTE_PATHS.PROGRESS_BADGES_ALL },
    { value: 'stats', label: t`Stats`, component: StatsTab, route: ROUTE_PATHS.PROGRESS_STATS },
  ]

  const handleTabChange = (value: string) => {
    setIsVisible({ ...initialVisibilityState })
    navigate(tabs.find((tab) => tab.value === value)?.route ?? ROUTE_PATHS.PROGRESS_STREAK)
  }

  const handleHistoryClick = () => {
    navigate(ROUTE_PATHS.PROGRESS_HISTORY)
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-col items-center space-y-6 p-2'>
        <h1 className='flex flex-row items-center gap-x-2 text-3xl font-bold tracking-tight'>
          <TrendingUp size={24} />
          {t`Progress`}
        </h1>
        <Tabs.Root
          value={currentProgressTab}
          onValueChange={handleTabChange}
          className='flex w-full flex-col items-center'
        >
          <Tabs.List className='flex w-full rounded-full bg-indigo-50 p-1 md:w-[440px]'>
            {tabs.map((tab) => (
              <Fragment key={tab.value}>
                <Tabs.Trigger
                  value={tab.value}
                  className='relative flex-1 rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-100 ease-in-out hover:bg-indigo-100 hover:text-gray-900 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75'
                >
                  {tab.value === currentProgressTab && (
                    <motion.div
                      layoutId='active-progress-tab'
                      className='absolute inset-0 rounded-full bg-indigo-500 shadow-sm'
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span
                    className={cn(
                      'color-transition relative z-10 duration-300',
                      { 'text-white': tab.value === currentProgressTab },
                      { 'text-gray-900': tab.value !== currentProgressTab }
                    )}
                  >
                    {tab.label}
                  </span>
                </Tabs.Trigger>
              </Fragment>
            ))}
          </Tabs.List>

          {/* History Button */}
          <div className='mt-4'>
            <Button
              onClick={handleHistoryClick}
              className='inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900'
            >
              <History size={16} />
              {t`History`}
            </Button>
          </div>

          <div className='mt-6 w-full'>
            {tabs.map((tab) => (
              <Tabs.Content key={tab.value} value={tab.value}>
                <div
                  className={`flex w-full flex-col items-center space-y-6 transition-all duration-500 ease-in-out ${
                    isVisible[currentProgressTab] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  {tab.component && <tab.component />}
                </div>
              </Tabs.Content>
            ))}
          </div>
        </Tabs.Root>
      </div>
    </WithNavbar>
  )
}
