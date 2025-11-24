import { LucideIcon } from 'lucide-react'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { useLingui } from '@lingui/react/macro'

type ExerciseCardProps = {
  name: string
  description: string
  icon: LucideIcon
  disabled?: boolean
  disabledText?: string
  isMainExercise?: boolean
}

export const ExerciseCard = ({
  name,
  description,
  icon: Icon,
  disabled,
  disabledText,
  isMainExercise,
}: ExerciseCardProps) => {
  const { t } = useLingui()
  return (
    <div
      className={cn(`relative flex h-40 rounded-2xl border p-1 lg:h-60 lg:rounded-3xl lg:p-2`, {
        'bg-white': disabled,
      })}
    >
      <div
        className={cn('flex h-full w-full flex-col gap-y-3 rounded-xl bg-slate-50 p-3 lg:rounded-2xl lg:p-4', {
          'hover:bg-slate-100 active:bg-slate-200': !disabled,
          'bg-white': disabled,
          'bg-gradient-to-r from-sky-50 to-sky-50 hover:from-sky-100 hover:to-sky-100': isMainExercise,
        })}
      >
        {disabled && disabledText && (
          <span className='absolute right-3 top-3 hidden rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400 lg:right-6 lg:top-6 lg:flex'>
            {disabledText}
          </span>
        )}
        {isMainExercise && (
          <div className='absolute right-3 top-3 rounded-full bg-blue-400 px-3 py-1 text-xs font-medium text-white md:text-base lg:right-6 lg:top-6 lg:flex'>
            {t`New`}
          </div>
        )}
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white lg:h-[72px] lg:w-[72px] lg:rounded-2xl lg:p-5',
            { 'bg-slate-50': disabled }
          )}
        >
          <Icon className={cn('h-5 w-5 text-slate-700 lg:h-8 lg:w-8', { 'text-indigo-300': disabled })} />
        </div>
        <div className='flex flex-col gap-y-1 lg:gap-y-3'>
          <h2 className={cn('text-sm font-medium lg:text-2xl', { 'text-slate-400': disabled })}>{name}</h2>
          <p className={cn('font-regular text-xs text-slate-400 lg:text-base', { 'text-slate-400': disabled })}>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
