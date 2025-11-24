export const EmptySlotForExpectedWord = () => {
  return (
    <div className='group relative flex h-8 items-center rounded-xl border-l border-r border-t border-gray-200 md:h-10'>
      <div className='absolute bottom-0 left-1 right-1 h-[2px] rounded-b-xl bg-red-200 transition-colors duration-100' />
    </div>
  )
}
