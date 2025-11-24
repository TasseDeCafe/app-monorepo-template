import { Skeleton } from '../../shadcn/skeleton.tsx'
import { useLingui } from '@lingui/react/macro'

export const ExerciseSkeleton = () => {
  const { t } = useLingui()

  return (
    <div className='mt-8 flex flex-col items-center justify-center md:max-w-3xl'>
      <h1 className='text-center text-3xl font-bold text-gray-600'>{t`Getting your exercise ready...`}</h1>
      <div className='mt-8 flex w-full flex-col items-center justify-center gap-y-2 px-2'>
        <Skeleton className='h-8 w-full md:max-w-4xl' />
        <Skeleton className='h-8 w-full md:max-w-4xl' />
        <Skeleton className='h-8 w-full md:max-w-4xl' />
        <Skeleton className='mt-10 h-20 w-20 rounded-full' />
      </div>
    </div>
  )
}
