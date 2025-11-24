import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChartNoAxesCombined } from 'lucide-react'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { Button } from '../design-system/button.tsx'
import { ShadcnTooltip } from '../design-system/tooltip.tsx'
import { useLingui } from '@lingui/react/macro'

import { useTotalXp } from '@/hooks/api/user/user-hooks'

export const XpCounter = () => {
  const { t } = useLingui()
  const totalXp = useTotalXp()
  const [displayedNumber, setDisplayedNumber] = useState(totalXp)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (totalXp !== displayedNumber) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setDisplayedNumber(totalXp)
        setIsTransitioning(false)
      }, 1000) // This should match the CSS transition duration duration-1000
      return () => clearTimeout(timer)
    }
  }, [totalXp, displayedNumber])

  const handleClick = () => {
    POSTHOG_EVENTS.click('word_counter_in_nav_bar')
    navigate(ROUTE_PATHS.PROGRESS_BADGES)
  }

  return (
    <ShadcnTooltip content={t`Number of words you learnt. Click to know more.`} side='top' sideOffset={15}>
      <div>
        <Button
          onClick={handleClick}
          className='flex h-10 flex-row items-center gap-x-1 bg-gradient-to-r from-indigo-50 to-violet-50 px-2 font-semibold text-indigo-800 drop-shadow-sm md:gap-x-2 md:px-4'
        >
          <ChartNoAxesCombined size={24} />
          <span className={`transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {displayedNumber}
          </span>
        </Button>
      </div>
    </ShadcnTooltip>
  )
}
