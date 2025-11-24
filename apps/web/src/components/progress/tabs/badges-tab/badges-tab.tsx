import { useLocation, useNavigate } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { FC, Fragment, useEffect, useState } from 'react'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { ROUTE_PATHS } from '../../../../routing/route-paths.ts'
import { WordsBadgesSubTab } from './badges-subtabs/words-badges-sub-tab/words-badges-sub-tab.tsx'
import { StreakBadgesSubTab } from './badges-subtabs/streak-badges-sub-tab/streak-badges-sub-tab.tsx'
import { LanguagesBadgesSubTab } from './badges-subtabs/languages-badges-sub-tab/languages-badges-sub-tab.tsx'
import { AllBadgesSubTab } from './badges-subtabs/all-badges-sub-tab/all-badges-sub-tab.tsx'
import { Award } from 'lucide-react'
import { useLingui } from '@lingui/react/macro'

// we need separate visibility flag for each tab to make sure the animation of tab moving up on tab switch works
const initialVisibilityState = {
  all: false,
  streak: false,
  words: false,
  languages: false,
}

const getCurrentBadgesTab = (pathname: string): BadgesSubTab => {
  if (pathname === ROUTE_PATHS.PROGRESS_BADGES_ALL) {
    return 'all'
  } else if (pathname === ROUTE_PATHS.PROGRESS_BADGES_STREAK) {
    return 'streak'
  } else if (pathname === ROUTE_PATHS.PROGRESS_BADGES_WORDS) {
    return 'words'
  } else if (pathname === ROUTE_PATHS.PROGRESS_BADGES_LANGUAGES) {
    return 'languages'
  } else {
    return 'all'
  }
}

type BadgesSubTab = keyof typeof initialVisibilityState

type BadgeSubTabsMapping = { value: BadgesSubTab; label: string; component: FC; route: string }

export const BadgesTab = () => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const location = useLocation()
  const currentBadgesTabTab = getCurrentBadgesTab(location.pathname)
  const [isVisible, setIsVisible] = useState<Record<BadgesSubTab, boolean>>(initialVisibilityState)

  useEffect(() => {
    setIsVisible({ ...initialVisibilityState, [currentBadgesTabTab]: true })
    return () => {
      setIsVisible(initialVisibilityState)
    }
  }, [currentBadgesTabTab])

  const badgesSubTabsMappings: BadgeSubTabsMapping[] = [
    { value: 'all', label: t`All`, component: AllBadgesSubTab, route: ROUTE_PATHS.PROGRESS_BADGES_ALL },
    { value: 'streak', label: t`Streak`, component: StreakBadgesSubTab, route: ROUTE_PATHS.PROGRESS_BADGES_STREAK },
    { value: 'words', label: t`Words`, component: WordsBadgesSubTab, route: ROUTE_PATHS.PROGRESS_BADGES_WORDS },
    {
      value: 'languages',
      label: t`Multi Language`,
      component: LanguagesBadgesSubTab,
      route: ROUTE_PATHS.PROGRESS_BADGES_LANGUAGES,
    },
  ]

  const handleTabChange = (value: string) => {
    setIsVisible({ ...initialVisibilityState })
    navigate(badgesSubTabsMappings.find((tab) => tab.value === value)?.route ?? ROUTE_PATHS.PROGRESS_BADGES_ALL)
  }

  return (
    <div className='flex w-full flex-col items-center space-y-6'>
      <h1 className='flex flex-row items-center gap-x-2 text-3xl font-bold tracking-tight'>
        <Award size={24} className='text-yellow-500' />
        {t`Badges`}
      </h1>
      <Tabs.Root
        value={currentBadgesTabTab}
        onValueChange={handleTabChange}
        className='flex w-full flex-col items-center'
      >
        <Tabs.List className='flex w-full rounded-full bg-indigo-50 p-1 md:w-[540px]'>
          {badgesSubTabsMappings.map((tab) => (
            <Fragment key={tab.value}>
              <Tabs.Trigger
                value={tab.value}
                className='relative flex-1 rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-100 ease-in-out hover:bg-indigo-100 hover:text-gray-900 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75'
              >
                {tab.value === currentBadgesTabTab && (
                  <motion.div
                    layoutId='active-badges-tab'
                    className='absolute inset-0 rounded-full bg-indigo-500 shadow-sm'
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span
                  className={cn(
                    'color-transition relative z-10 duration-300',
                    { 'text-white': tab.value === currentBadgesTabTab },
                    { 'text-gray-900': tab.value !== currentBadgesTabTab }
                  )}
                >
                  {tab.label}
                </span>
              </Tabs.Trigger>
            </Fragment>
          ))}
        </Tabs.List>
        <div className='mt-6 flex w-full flex-col justify-center'>
          {badgesSubTabsMappings.map((tab) => (
            <Tabs.Content key={tab.value} value={tab.value} className='flex w-full flex-col items-center space-y-6'>
              <div
                className={`flex w-full flex-col items-center space-y-6 transition-all duration-500 ease-in-out ${
                  isVisible[currentBadgesTabTab] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
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
