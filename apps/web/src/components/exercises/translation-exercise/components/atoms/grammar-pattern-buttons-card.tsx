import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover'
import { CircleHelp } from 'lucide-react'
import { ReactNode } from 'react'

interface GrammarPatternButtonsCardProps {
  title: string
  children: ReactNode
  className?: string
  helpText?: string
}

export const GrammarPatternButtonsCard = ({
  title,
  children,
  className = '',
  helpText,
}: GrammarPatternButtonsCardProps) => (
  <div className='mb-6'>
    <div className='mb-2 flex items-center gap-2'>
      <h4 className='text-sm font-semibold text-slate-600 md:text-base'>{title}</h4>
      {helpText && (
        <Popover>
          <PopoverTrigger>
            <CircleHelp className='h-4 w-4 text-stone-400' />
          </PopoverTrigger>
          <PopoverContent className='bg-white text-center text-sm shadow-lg'>{helpText}</PopoverContent>
        </Popover>
      )}
    </div>
    <div className={`space-y-2 ${className}`}>{children}</div>
  </div>
)
