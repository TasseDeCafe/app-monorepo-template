import { ReactNode } from 'react'
import { cn } from '@template-app/core/utils/tailwind-utils'

export const TitleWithGradient = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <h1 className='text-2xl font-extrabold md:text-3xl'>
      <span className={cn('bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent', className)}>
        {children}
      </span>
    </h1>
  )
}
