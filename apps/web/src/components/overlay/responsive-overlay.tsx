'use client'

import * as React from 'react'
import { createContext, useContext } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../shadcn/dialog'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../shadcn/sheet'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { cn } from '@template-app/core/utils/tailwind-utils'

// Context to share mobile state with child components
interface OverlayContextValue {
  isMobile: boolean
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

const useOverlayContext = () => {
  const context = useContext(OverlayContext)
  if (!context) {
    throw new Error('Overlay components must be used within a ResponsiveOverlay')
  }
  return context
}

// Root component that renders either Dialog or Sheet
interface ResponsiveOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const ResponsiveOverlay = ({ open, onOpenChange, children }: ResponsiveOverlayProps) => {
  const isMobile = useIsMobile()

  // Don't render until we know the screen size to avoid hydration mismatch
  if (isMobile === undefined) {
    return null
  }

  return (
    <OverlayContext.Provider value={{ isMobile }}>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          {children}
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      )}
    </OverlayContext.Provider>
  )
}

// Content wrapper that renders DialogContent or SheetContent
interface OverlayContentProps {
  className?: string
  children: React.ReactNode
  showCloseButton?: boolean
}

export const OverlayContent = ({ className, children, showCloseButton = true }: OverlayContentProps) => {
  const { isMobile } = useOverlayContext()

  if (isMobile) {
    return (
      <SheetContent side='bottom' className={cn('max-h-[90vh] overflow-y-auto rounded-t-xl pb-8', className)}>
        {children}
      </SheetContent>
    )
  }

  return (
    <DialogContent className={className} showCloseButton={showCloseButton}>
      {children}
    </DialogContent>
  )
}

// Header wrapper
interface OverlayHeaderProps {
  className?: string
  children: React.ReactNode
}

export const OverlayHeader = ({ className, children }: OverlayHeaderProps) => {
  const { isMobile } = useOverlayContext()

  if (isMobile) {
    return <SheetHeader className={className}>{children}</SheetHeader>
  }

  return <DialogHeader className={className}>{children}</DialogHeader>
}

// Title wrapper
interface OverlayTitleProps {
  className?: string
  children: React.ReactNode
}

export const OverlayTitle = ({ className, children }: OverlayTitleProps) => {
  const { isMobile } = useOverlayContext()

  if (isMobile) {
    return <SheetTitle className={className}>{children}</SheetTitle>
  }

  return <DialogTitle className={className}>{children}</DialogTitle>
}

// Description wrapper
interface OverlayDescriptionProps {
  className?: string
  children?: React.ReactNode
}

export const OverlayDescription = ({ className, children }: OverlayDescriptionProps) => {
  const { isMobile } = useOverlayContext()

  if (isMobile) {
    return <SheetDescription className={className}>{children}</SheetDescription>
  }

  return <DialogDescription className={className}>{children}</DialogDescription>
}

// Footer wrapper
interface OverlayFooterProps {
  className?: string
  children: React.ReactNode
}

export const OverlayFooter = ({ className, children }: OverlayFooterProps) => {
  const { isMobile } = useOverlayContext()

  if (isMobile) {
    return <SheetFooter className={className}>{children}</SheetFooter>
  }

  return <DialogFooter className={className}>{children}</DialogFooter>
}
