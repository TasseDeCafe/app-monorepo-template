import { ReactNode, forwardRef } from 'react'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

export const BigCard = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={cn('flex w-full flex-col rounded-3xl bg-white p-2 md:p-6 lg:p-10', className)}>
        {children}
      </div>
    )
  }
)

BigCard.displayName = 'BigCard'
