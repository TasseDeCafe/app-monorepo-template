import { Skeleton } from '../../../shadcn/skeleton.tsx'

export const NarrowSkeleton = () => {
  return (
    <div className='flex h-6 flex-col justify-center'>
      <Skeleton className='h-1' />
    </div>
  )
}
