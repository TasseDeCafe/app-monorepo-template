import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

interface TextareaProps {
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  rows?: number
  autoFocus?: boolean
}

export interface TextareaRef {
  focus: () => void
  resetHeight: () => void
}

export const Textarea = forwardRef<TextareaRef, TextareaProps>(
  ({ value, onChange, onKeyDown, placeholder, className = '', disabled = false, rows = 1, autoFocus = false }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const resetTextareaHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }

    const handleTextareaInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
      onChange(e)
    }

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus()
      },
      resetHeight: resetTextareaHeight,
    }))

    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        textareaRef.current.focus()
      }
    }, [autoFocus])

    useEffect(() => {
      if (value === '') {
        resetTextareaHeight()
      }
    }, [value])

    return (
      <div className='rounded-2xl bg-gray-50 p-2'>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaInput}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(
            'min-h-[60px] w-full resize-none overflow-hidden rounded-xl bg-gray-50 px-2 focus:outline-none md:px-4 md:py-2',
            className
          )}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
