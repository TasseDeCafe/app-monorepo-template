import { cn } from '@template-app/core/utils/tailwind-utils'

export const Toggle = ({
  isToggled,
  onClick,
  size = 'sm',
  disabled = false,
}: {
  isToggled: boolean
  onClick: (isToggled: boolean) => void
  size?: 'sm' | 'lg'
  disabled?: boolean
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(!isToggled)
    }
  }

  return (
    <button
      className={cn(
        'relative rounded-full',
        size === 'lg' ? 'h-6 w-12' : 'h-[18px] w-[34px]',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      <div
        className={cn('rounded-full transition', size === 'lg' ? 'h-6 w-12' : 'h-[18px] w-[34px]', {
          'bg-gray-200': !isToggled,
          'bg-indigo-500': isToggled,
        })}
      ></div>
      <div
        className={cn(
          'absolute left-[2px] top-[2px] inline-flex transform items-center justify-center rounded-full bg-white shadow-sm transition-all duration-75 ease-in-out',
          size === 'lg' ? 'h-5 w-5' : 'h-[14px] w-[14px]',
          {
            'translate-x-0': !isToggled,
            [size === 'lg' ? 'translate-x-6' : 'translate-x-4']: isToggled,
          }
        )}
      />
    </button>
  )
}
