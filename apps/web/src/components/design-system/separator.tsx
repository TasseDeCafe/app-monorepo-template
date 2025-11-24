import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export const Separator = ({ orientation = 'horizontal', className }: SeparatorProps) => {
  return (
    <div
      className={cn(
        'shrink-0 bg-gray-200',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      role='separator'
    />
  )
}
