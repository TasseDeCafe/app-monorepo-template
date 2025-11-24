import { LucideIcon } from 'lucide-react'
import { useLingui } from '@lingui/react/macro'

export type BadgeData = {
  icon: LucideIcon
  title: string
  description: string
  progress: number
  maxProgress: number
  achieved: boolean
}

type BadgeCardProps = BadgeData & {
  isNext: boolean
}

export const BadgeCard = ({
  icon: Icon,
  title,
  description,
  progress,
  maxProgress,
  achieved,
  isNext,
}: BadgeCardProps) => {
  const { t } = useLingui()
  const iconSize = 16
  const progressWidth = maxProgress > 0 ? Math.min((progress / maxProgress) * 100, 100) : 0

  return (
    <div
      className={`flex items-center rounded-lg border bg-white p-4 shadow-lg shadow-indigo-100/50${
        achieved ? 'border-2 border-green-400' : ''
      }`}
    >
      <div
        className={`mr-4 flex items-center justify-center rounded-full p-3 ${
          achieved ? 'bg-green-100' : 'bg-gray-100'
        }`}
        style={{ width: `${iconSize + 24}px`, height: `${iconSize + 24}px` }}
      >
        <Icon
          className={`h-${iconSize} w-${iconSize} ${
            achieved ? 'text-green-500' : isNext ? 'text-indigo-500' : 'text-gray-400'
          }`}
        />
      </div>
      <div className='flex-grow'>
        <h3 className={`mb-1 text-lg font-semibold ${achieved || isNext ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </h3>
        <p className={`mb-2 text-sm ${achieved || isNext ? 'text-gray-600' : 'text-gray-400'}`}>{description}</p>
        {isNext && !achieved && (
          <>
            <div className='h-2.5 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-in'
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <p className='mt-1 text-xs text-gray-500'>
              {progress} / {maxProgress}
            </p>
          </>
        )}
        {achieved && <p className='text-sm font-semibold text-green-500'>{t`Completed!`}</p>}
      </div>
    </div>
  )
}
