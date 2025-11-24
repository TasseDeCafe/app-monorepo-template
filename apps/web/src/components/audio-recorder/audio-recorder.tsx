import { cn } from '@template-app/core/utils/tailwind-utils'
import { CircleX, Mic, Square } from 'lucide-react'
import { ShadcnTooltip } from '../design-system/tooltip.tsx'
import { Button } from '../design-system/button.tsx'
import { useLingui } from '@lingui/react/macro'

export type AudioRecorderProps = {
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void
  cancelRecording: () => void
}

export const AudioRecorder = ({ isRecording, startRecording, stopRecording, cancelRecording }: AudioRecorderProps) => {
  const { t } = useLingui()

  const startStopRecordingTooltipContent = isRecording ? t`Stop Recording` : t`Start Recording`
  const cancelTooltipContent = t`Cancel Recording`

  return (
    <div className='relative z-10 flex h-24 w-40 flex-col items-center justify-center md:h-32'>
      <div
        className={`rounded-full shadow-lg transition-all duration-300 ease-in-out ${isRecording ? 'bg-red-400' : 'bg-gray-200'}`}
        style={{ height: 82, width: 82 }}
      />
      {isRecording && (
        <div className='absolute animate-ping rounded-full bg-red-500 opacity-75' style={{ height: 90, width: 90 }} />
      )}
      <ShadcnTooltip content={startStopRecordingTooltipContent} side='top' sideOffset={15}>
        <Button
          aria-pressed={isRecording}
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            'absolute flex h-20 w-20 cursor-pointer items-center justify-center rounded-full text-white hover:shadow-xl active:scale-95',
            {
              'bg-indigo-600': !isRecording,
              'bg-red-500': isRecording,
            }
          )}
        >
          <div className='relative flex h-full w-full items-center justify-center'>
            <div className='absolute'>
              <Mic
                className={cn('h-10 w-10 transition-opacity duration-300 ease-in-out', {
                  'opacity-0': isRecording,
                  'opacity-100': !isRecording,
                })}
              />
            </div>
            <div className='absolute'>
              <Square
                className={cn('h-10 w-10 text-white transition-opacity duration-300 ease-in-out', {
                  'opacity-100': isRecording,
                  'opacity-0': !isRecording,
                })}
              />
            </div>
          </div>
        </Button>
      </ShadcnTooltip>
      {isRecording && (
        <ShadcnTooltip content={cancelTooltipContent} side='top' sideOffset={15}>
          <div className='absolute bottom-0 left-40 top-4 text-gray-400'>
            <button onClick={cancelRecording}>
              <CircleX className='h-5 w-5' />
            </button>
          </div>
        </ShadcnTooltip>
      )}
    </div>
  )
}
