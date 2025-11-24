import { cn } from '@template-app/core/utils/tailwind-utils'
import { Loader2, Mic, Square } from 'lucide-react'
import { ShadcnTooltip } from '../design-system/tooltip.tsx'
import { Button } from '../design-system/button.tsx'
import { useLingui } from '@lingui/react/macro'

export type RecordingState = 'recording' | 'loading' | 'idle'

export type CompactAudioRecorderProps = {
  recordingState: RecordingState
  startRecording: () => void
  stopRecording: () => void
}

export const CompactAudioRecorder = ({ recordingState, startRecording, stopRecording }: CompactAudioRecorderProps) => {
  const { t } = useLingui()

  const isRecording = recordingState === 'recording'
  const isLoading = recordingState === 'loading'

  const startStopRecordingTooltipContent = isRecording ? t`Stop Recording` : t`Start Recording`

  return (
    <div className='relative flex flex-col items-center justify-center'>
      <div
        className={cn('rounded-xl shadow-lg transition-all duration-300 ease-in-out', {
          'bg-red-400': isRecording,
          'bg-gray-200': !isRecording,
        })}
        style={{ height: 40, width: 40 }}
      />
      {isRecording && (
        <div className='absolute animate-ping rounded-xl bg-red-500 opacity-75' style={{ height: 40, width: 40 }} />
      )}
      <ShadcnTooltip content={startStopRecordingTooltipContent} side='top' sideOffset={8}>
        <Button
          aria-pressed={isRecording}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={cn(
            'absolute flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white hover:shadow-xl active:scale-95 disabled:cursor-not-allowed',
            {
              'bg-indigo-600': !isRecording && !isLoading,
              'bg-red-500': isRecording,
              'bg-gray-400': isLoading,
            }
          )}
        >
          <div className='relative flex h-full w-full items-center justify-center'>
            <>
              <div className='absolute'>
                {isLoading ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                  <Mic
                    className={cn('h-5 w-5 transition-opacity duration-300 ease-in-out', {
                      'opacity-0': isRecording,
                      'opacity-100': !isRecording,
                    })}
                  />
                )}
              </div>
              <div className='absolute'>
                <Square
                  className={cn('h-5 w-5 text-white transition-opacity duration-300 ease-in-out', {
                    'opacity-100': isRecording,
                    'opacity-0': !isRecording,
                  })}
                />
              </div>
            </>
          </div>
        </Button>
      </ShadcnTooltip>
    </div>
  )
}
