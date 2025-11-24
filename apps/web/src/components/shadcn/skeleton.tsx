import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { HTMLAttributes } from 'react'

const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />
}

export { Skeleton }
