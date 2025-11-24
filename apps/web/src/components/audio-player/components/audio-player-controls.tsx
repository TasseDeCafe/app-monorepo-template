import { Dispatch, RefObject, SetStateAction } from 'react'
import { Download, Pause, Play, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { SpeedSettingsContent } from './atoms/speed-settings-content.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../../shadcn/popover.tsx'
import { ShadcnTooltip } from '../../design-system/tooltip.tsx'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../shadcn/drawer.tsx'
import { formatTime } from '../audio-player-utils.ts'
import { AudioSpeedType } from '../audio-player-types.ts'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useLingui } from '@lingui/react/macro'

type AudioPlayerControlsProps = {
  title?: string
  isSmOrLarger: boolean
  togglePlay: () => void
  isPlaying: boolean
  audioRef: RefObject<HTMLAudioElement | null>
  isMuted: boolean
  setIsMuted: Dispatch<SetStateAction<boolean>>
  currentTime: number
  duration: number
  playbackRate: number
  audioSpeedType?: AudioSpeedType
  handleDownload: () => void
  fileName?: string
  onSpeedChange: (speed: number) => void
  isPlayLoading?: boolean
  isDownloadLoading?: boolean
}

export const AudioPlayerControls = ({
  title,
  isSmOrLarger,
  togglePlay,
  isPlaying,
  audioRef,
  isMuted,
  setIsMuted,
  currentTime,
  duration,
  playbackRate,
  audioSpeedType,
  handleDownload,
  fileName,
  onSpeedChange,
  isPlayLoading = false,
  isDownloadLoading = false,
}: AudioPlayerControlsProps) => {
  const { t } = useLingui()

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2 md:gap-4'>
        <button
          onClick={togglePlay}
          className='rounded-full p-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 md:p-2'
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={isPlayLoading}
        >
          {isPlayLoading ? (
            <Loader2 className='h-6 w-6 animate-spin md:h-7 md:w-7' />
          ) : isPlaying ? (
            <Pause className='h-6 w-6 md:h-7 md:w-7' />
          ) : (
            <Play className='h-6 w-6 md:h-7 md:w-7' />
          )}
        </button>

        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !isMuted
              setIsMuted(!isMuted)
            }
          }}
          className='rounded-full p-1.5 text-gray-600 hover:bg-gray-100 md:p-2'
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className='h-6 w-6 md:h-7 md:w-7' /> : <Volume2 className='h-6 w-6 md:h-7 md:w-7' />}
        </button>

        <div className='hidden text-sm text-gray-600 md:flex'>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {title && <div className='absolute left-1/2 -translate-x-1/2 text-xs text-gray-500 md:text-base'>{title}</div>}

      <div className='flex items-center gap-1 md:gap-2'>
        {audioSpeedType &&
          (isSmOrLarger ? (
            <Popover>
              <ShadcnTooltip content={t`Change speed`} side='top'>
                <PopoverTrigger asChild>
                  <div className='flex h-8 cursor-pointer items-center rounded px-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-100 md:h-10'>
                    {playbackRate.toFixed(2)}x
                  </div>
                </PopoverTrigger>
              </ShadcnTooltip>
              <PopoverContent side='top' className='z-50 bg-white' sideOffset={20}>
                <div className='pb-2 text-center text-lg font-semibold leading-none tracking-tight'>Speed</div>
                <SpeedSettingsContent
                  audioSpeedType={audioSpeedType}
                  currentSpeed={playbackRate}
                  onSpeedChange={(speed: number) => {
                    if (audioRef.current) {
                      audioRef.current.playbackRate = speed
                      onSpeedChange(speed)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Drawer autoFocus={true}>
              <DrawerTrigger>
                <div className='flex h-8 items-center px-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-100 md:h-10'>
                  {playbackRate.toFixed(2)}x
                </div>
              </DrawerTrigger>
              <DrawerContent className='bg-white pb-10'>
                <div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' />
                <DrawerHeader>
                  {/*TODO: add a translation*/}
                  <DrawerTitle>Speed</DrawerTitle>
                  {/* Add hidden description for accessibility and to prevent "Missing Description" warning */}
                  <VisuallyHidden>
                    <DrawerDescription>Speed</DrawerDescription>
                  </VisuallyHidden>
                </DrawerHeader>
                <div className='mx-auto w-11/12'>
                  <SpeedSettingsContent
                    audioSpeedType={audioSpeedType}
                    currentSpeed={playbackRate}
                    onSpeedChange={(speed: number) => {
                      if (audioRef.current) {
                        audioRef.current.playbackRate = speed
                        onSpeedChange(speed)
                      }
                    }}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          ))}

        {fileName && (
          <button
            onClick={handleDownload}
            className='rounded-full p-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 md:p-2'
            aria-label={t`Download audio`}
            disabled={isDownloadLoading}
          >
            {isDownloadLoading ? (
              <Loader2 className='h-6 w-6 animate-spin md:h-7 md:w-7' />
            ) : (
              <Download className='h-6 w-6 md:h-7 md:w-7' />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
