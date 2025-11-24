import { Textarea } from '@/components/design-system/textarea'
import { CompactAudioRecorder } from '@/components/audio-recorder/compact-audio-recorder'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover'
import { CircleHelp } from 'lucide-react'
import { useLingui } from '@lingui/react/macro'

interface TranslationInputProps {
  value: string
  onChange: (translation: string) => void
  placeholder?: string
  className?: string
  isRecording?: boolean
  isTranscribing?: boolean
  startRecording?: () => void
  stopRecording?: () => void
  helpText?: string
}

export const TranslationInput = ({
  value,
  onChange,
  placeholder,
  className = '',
  isRecording = false,
  isTranscribing = false,
  startRecording,
  stopRecording,
  helpText,
}: TranslationInputProps) => {
  const { t } = useLingui()
  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <div className='mb-2 flex items-center gap-2'>
          <h4 className='text-sm font-medium text-slate-600'>{t`Your translation attempt`}</h4>
          {helpText && (
            <Popover>
              <PopoverTrigger>
                <CircleHelp className='h-4 w-4 text-stone-400' />
              </PopoverTrigger>
              <PopoverContent className='bg-white text-center text-sm shadow-lg'>{helpText}</PopoverContent>
            </Popover>
          )}
        </div>
        <div className='relative'>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                return // Allow new line with Shift+Enter
              }
            }}
            placeholder={placeholder}
            className={startRecording && stopRecording ? 'pr-12' : ''}
          />
          {startRecording && stopRecording && (
            <div className='absolute right-2 top-2'>
              <CompactAudioRecorder
                recordingState={isTranscribing ? 'loading' : isRecording ? 'recording' : 'idle'}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
