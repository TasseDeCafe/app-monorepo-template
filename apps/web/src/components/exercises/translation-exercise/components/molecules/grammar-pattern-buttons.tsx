import { useState } from 'react'
import { Button } from '@/components/design-system/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover'
import type { GrammarPattern } from '../../types'
import { GrammarPatternButton } from '../atoms/grammar-pattern-button'

interface GrammarPatternButtonsProps {
  patterns: GrammarPattern[]
  selectedPatterns: GrammarPattern[]
  onPatternToggle: (pattern: GrammarPattern) => void
  maxVisible?: number
  className?: string
}

export const GrammarPatternButtons = ({
  patterns,
  selectedPatterns,
  onPatternToggle,
  maxVisible = 5,
  className = '',
}: GrammarPatternButtonsProps) => {
  const [showAll, setShowAll] = useState(false)
  const [openPopovers, setOpenPopovers] = useState<Set<string>>(new Set())

  if (patterns.length === 0) {
    return null
  }

  const visiblePatterns = showAll ? patterns : patterns.slice(0, maxVisible)

  const hasMore = patterns.length > maxVisible

  const isSelected = (pattern: GrammarPattern) => {
    return selectedPatterns.some(
      (selected) => selected.structure === pattern.structure && selected.concept === pattern.concept
    )
  }

  const getPatternKey = (pattern: GrammarPattern, index: number) => {
    return `${pattern.structure}-${pattern.concept}-${index}`
  }

  const handlePatternClick = (pattern: GrammarPattern, index: number) => {
    const key = getPatternKey(pattern, index)
    const wasSelected = isSelected(pattern)

    // If it was selected (being deselected now), don't open popover
    if (wasSelected) {
      setOpenPopovers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    } else {
      // If it wasn't selected (being selected now), open popover
      setOpenPopovers((prev) => {
        const newSet = new Set(prev)
        newSet.add(key)
        return newSet
      })
    }

    onPatternToggle(pattern)
  }

  return (
    <div className={className}>
      <div className='mb-2 flex flex-wrap gap-2'>
        {visiblePatterns.map((pattern, index) => {
          const selected = isSelected(pattern)
          const patternKey = getPatternKey(pattern, index)
          const isPopoverOpen = openPopovers.has(patternKey)

          return (
            <div key={`${pattern.structure}-${index}`}>
              {pattern.hint ? (
                <Popover
                  open={isPopoverOpen}
                  onOpenChange={(open) => {
                    if (!open) {
                      setOpenPopovers((prev) => {
                        const newSet = new Set(prev)
                        newSet.delete(patternKey)
                        return newSet
                      })
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <GrammarPatternButton
                      text={pattern.structure}
                      selected={selected}
                      onClick={() => handlePatternClick(pattern, index)}
                    />
                  </PopoverTrigger>
                  <PopoverContent className='bg-white shadow-lg'>
                    <div className='rounded-md px-2 py-1 text-center text-stone-900'>{pattern.hint}</div>
                  </PopoverContent>
                </Popover>
              ) : (
                <GrammarPatternButton
                  text={pattern.structure}
                  selected={selected}
                  onClick={() => onPatternToggle(pattern)}
                />
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <Button
          onClick={() => setShowAll(!showAll)}
          variant='ghost'
          size='sm'
          className='text-gray-600 hover:text-gray-800'
        >
          {showAll ? (
            <>
              <ChevronUp className='mr-1 h-4 w-4' />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className='mr-1 h-4 w-4' />
              Show More ({patterns.length - maxVisible} more)
            </>
          )}
        </Button>
      )}
    </div>
  )
}
