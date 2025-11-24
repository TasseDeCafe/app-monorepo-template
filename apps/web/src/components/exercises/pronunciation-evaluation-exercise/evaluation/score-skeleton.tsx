import { Skeleton } from '../../../shadcn/skeleton.tsx'

export const ScoreSkeleton = () => {
  return (
    <div className='flex w-full flex-col items-center py-2 md:py-4'>
      <div className='hidden h-[150px] w-full justify-center md:flex'>
        <Skeleton className='h-[150px] w-[150px] rounded-full' />
      </div>
      <div className='flex w-[300px] md:hidden'>
        <Skeleton className='h-5 w-full rounded-full' />
      </div>
    </div>
  )
}
