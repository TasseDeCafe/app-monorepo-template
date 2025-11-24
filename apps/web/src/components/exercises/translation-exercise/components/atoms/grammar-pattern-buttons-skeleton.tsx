export const GrammarPatternButtonsSkeleton = () => (
  <div className='space-y-3'>
    <div className='flex flex-wrap gap-2'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='h-8 w-24 animate-pulse rounded-xl bg-gray-200'></div>
      ))}
    </div>
  </div>
)
