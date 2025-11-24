import { Skeleton } from '../../shadcn/skeleton'
import { useLingui } from '@lingui/react/macro'

export const StressExerciseSkeleton = () => {
  const { t } = useLingui()

  return (
    <div className='mx-auto flex h-full w-full flex-col overflow-hidden'>
      <div className='space-y-2 pb-4 text-center'>
        <div className='text-2xl font-semibold text-gray-600'>{t`Getting your exercise ready...`}</div>
        <Skeleton className='mx-auto h-6 w-1/2' />
      </div>
      <div className='flex-1 space-y-8 overflow-y-auto'>
        {/* Title */}
        <div className='space-y-2 text-center'>
          <Skeleton className='mx-auto h-8 w-64' />
        </div>

        {/* Context sentence */}
        <div className='space-y-4'>
          <Skeleton className='mx-auto h-6 w-11/12' />

          {/* Target word */}
          <div className='flex flex-col items-center gap-2'>
            <Skeleton className='my-4 h-8 w-48' />
          </div>

          {/* Syllable buttons */}
          <div className='flex justify-center gap-3'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-12 w-20 rounded-xl' />
            ))}
          </div>

          {/* Feedback placeholder */}
          <div className='flex h-8 justify-center'>
            <Skeleton className='h-6 w-32' />
          </div>
        </div>
      </div>
      {/* Action button */}
      <div className='flex flex-shrink-0 flex-col gap-1 border-t border-gray-200 pt-2'>
        <Skeleton className='mx-auto h-12 w-full rounded-xl md:w-1/2' />
      </div>
    </div>
  )
}
