import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/popover.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../../../shadcn/drawer.tsx'
import { useMediaQuery } from 'usehooks-ts'
import { ReactNode } from 'react'
import { Level } from '@yourbestaccent/core/utils/cefr-level-selector-utils.ts'
import { ExerciseControlsSettingsIcon } from '../atoms/exercise-controls-settings-icon.tsx'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useLingui } from '@lingui/react/macro'

type Props =
  | {
      children: ReactNode | ReactNode[]
      shouldShowLevel: false
      currentLevel: null
    }
  | {
      children: ReactNode | ReactNode[]
      shouldShowLevel: true
      currentLevel: Level
    }

export const ExerciseControlsSettingsButton = ({ children, shouldShowLevel, currentLevel }: Props) => {
  const { t } = useLingui()

  const isSmOrLarger = useMediaQuery('(min-width: 640px)')
  return (
    <>
      {isSmOrLarger ? (
        <Popover>
          <PopoverTrigger>
            <div className='flex items-center justify-center gap-2'>
              {shouldShowLevel && (
                <div className='rounded-lg px-2 py-1 text-lg font-semibold text-slate-800 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white'>
                  {`${t`Level:`} ${currentLevel.name}`}
                </div>
              )}
              <ExerciseControlsSettingsIcon />
            </div>
          </PopoverTrigger>
          <PopoverContent className={cn('flex flex-col gap-4 bg-white p-6', 'w-[400px] max-w-[90vw]')}>
            {children}
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer>
          <DrawerTrigger asChild>
            <div className='flex items-center justify-center gap-2'>
              {shouldShowLevel && (
                <div className='font-semibold text-slate-800'>
                  <span className='hidden text-lg md:flex'>{`${t`Level:`} ${currentLevel.name}`}</span>
                  <span className='flex text-sm md:hidden'>{`${t`Level:`}${currentLevel.name}`}</span>
                </div>
              )}
              <ExerciseControlsSettingsIcon />
            </div>
          </DrawerTrigger>
          <DrawerContent className='bg-white pb-10'>
            <div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' />
            <DrawerHeader>
              <DrawerTitle>{t`Exercise Settings`}</DrawerTitle>
              {/* Add hidden description for accessibility and to prevent "Missing Description" warning */}
              <VisuallyHidden>
                <DrawerDescription>Settings</DrawerDescription>
              </VisuallyHidden>
            </DrawerHeader>
            <div className='mx-auto w-11/12 px-4'>{children}</div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
