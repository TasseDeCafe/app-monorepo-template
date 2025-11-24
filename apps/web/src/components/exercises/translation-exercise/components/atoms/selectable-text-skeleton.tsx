import { Skeleton } from '@/components/shadcn/skeleton'

export const SelectableTextSkeleton = () => (
  <div className='flex flex-wrap justify-center gap-2'>
    {Array.from({ length: 10 }, (_, index) => {
      const widths = ['w-12', 'w-16', 'w-20', 'w-14', 'w-18', 'w-24', 'w-10', 'w-22', 'w-16', 'w-20']
      return <Skeleton key={index} className={`h-8 ${widths[index]} rounded-xl md:h-10`} />
    })}
  </div>
)
