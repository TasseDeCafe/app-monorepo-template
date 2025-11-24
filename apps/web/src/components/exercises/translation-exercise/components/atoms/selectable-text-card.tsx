import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover'
import { CircleHelp } from 'lucide-react'
import { ReactNode } from 'react'

interface TranslationCardProps {
  title: string
  children: ReactNode
  className?: string
  helpText?: string
}

export const SelectableTextCard = ({ title, children, className = '', helpText }: TranslationCardProps) => (
  <div className='mb-6'>
    <div className='mb-2 flex items-center gap-2'>
      <h2 className='text-sm font-semibold text-slate-600 md:text-base'>{title}</h2>
      {helpText && (
        <Popover>
          <PopoverTrigger>
            <CircleHelp className='h-4 w-4 text-stone-400' />
          </PopoverTrigger>
          <PopoverContent className='bg-white text-center text-sm shadow-lg'>{helpText}</PopoverContent>
        </Popover>
      )}
    </div>
    <div className={`rounded-xl ${className}`}>{children}</div>
  </div>
)
