import { ReactNode } from 'react'
import { cn } from '@template-app/core/utils/tailwind-utils'

export const Title = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <h1 className={cn('px-8 text-center text-2xl font-bold text-gray-800 md:px-0 md:text-3xl', className)}>
      {children}
    </h1>
  )
}
