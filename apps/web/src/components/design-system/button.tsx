import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { Link } from 'react-router-dom'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick?: () => void
  children: ReactNode
  className?: string
  href?: string
  shouldHaveHoverAndActiveStyles?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
}

const getVariantStyles = (variant: ButtonVariant): string => {
  const variants = {
    default: '',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  }
  return variants[variant]
}

const getSizeStyles = (size: ButtonSize): string => {
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-12 px-4 text-base',
    lg: 'h-14 px-6 text-lg',
  }
  return sizes[size]
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick = () => {},
      children,
      className,
      href,
      shouldHaveHoverAndActiveStyles = true,
      variant = 'default',
      size = 'md',
      ...rest
    },
    ref
  ) => {
    const sharedClassNames = cn(
      'flex items-center justify-center rounded-xl transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
      getSizeStyles(size),
      getVariantStyles(variant),
      {
        'cursor-pointer hover:brightness-95 active:brightness-90 disabled:hover:brightness-100 disabled:active:brightness-100':
          shouldHaveHoverAndActiveStyles && variant === 'default',
      },
      {
        'cursor-not-allowed': !shouldHaveHoverAndActiveStyles,
      },
      className
    )

    return (
      <>
        {href ? (
          <Link to={href} onClick={onClick} className={sharedClassNames}>
            {children}
          </Link>
        ) : (
          <button {...rest} ref={ref} onClick={onClick} className={sharedClassNames}>
            {children}
          </button>
        )}
      </>
    )
  }
)

Button.displayName = 'Button'
