import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../shadcn/tooltip.tsx'
import useIsTouchDevice from '../../hooks/use-is-touch-device.ts'
import { ReactNode } from 'react'

export type ShadcnTooltipProps = {
  content: string
  side: 'top' | 'right' | 'bottom' | 'left' | undefined
  children: ReactNode | ReactNode[]
  sideOffset?: number
}

export const ShadcnTooltip = ({ content, side, children, sideOffset = 5 }: ShadcnTooltipProps) => {
  const isTouchDevice: boolean = useIsTouchDevice()

  if (isTouchDevice) {
    return <>{children}</>
  } else {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent
            side={side}
            sideOffset={sideOffset}
            className='rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white'
          >
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
}
