import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { ReactNode } from 'react'
import { Button } from '../../design-system/button.tsx'

type ButtonProps = {
  onClick: () => void
  disabled?: boolean
  className?: string
  children?: ReactNode
}

export const NavigationButton = ({ onClick, disabled = false, className = '', children }: ButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-12 w-full items-center justify-center border border-gray-200 bg-white',
        { 'cursor-not-allowed text-gray-500': disabled },
        className
      )}
    >
      {children}
    </Button>
  )
}
