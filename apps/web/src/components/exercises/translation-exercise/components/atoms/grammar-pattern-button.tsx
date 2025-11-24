import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Ref } from 'react'

interface GrammarPatternButtonProps {
  text: string
  selected: boolean
  onClick: () => void
  className?: string
  ref?: Ref<HTMLDivElement>
}

export const GrammarPatternButton = ({
  text,
  selected,
  onClick,
  className,
  ref,
  ...props
}: GrammarPatternButtonProps) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'flex h-8 cursor-pointer items-center rounded-xl border border-gray-200 bg-white transition-colors duration-100 md:h-10',
        {
          'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700': selected,
          'hover:bg-gray-100 active:bg-gray-200': !selected,
        },
        className
      )}
      {...props}
    >
      <span
        className={cn('w-full px-2 md:px-4', {
          'text-white': selected,
          'text-gray-700 md:text-gray-600': !selected,
        })}
      >
        {text}
      </span>
    </div>
  )
}
