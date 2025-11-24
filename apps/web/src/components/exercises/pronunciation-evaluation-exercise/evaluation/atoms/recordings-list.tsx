import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../../../design-system/button.tsx'
import { VisibleAudioPlayer } from '../../../../audio-player/visible-audio-player.tsx'
import { PLAYER_TYPE } from '../../../../audio-player/audio-player-types.ts'
import { createFilename } from '../../../../audio-player/audio-player-utils.ts'
import { Recording } from '../../../../../hooks/audio/use-audio-recorder.ts'
import { useLingui } from '@lingui/react/macro'

interface RecordingsListProps {
  recordings: Recording[]
  text: string
  playbackRate: number
}

export const RecordingsList = ({ recordings, text, playbackRate }: RecordingsListProps) => {
  const { t } = useLingui()

  const [showPreviousAttempts, setShowPreviousAttempts] = useState(false)
  const hasMultipleRecordings = recordings.length > 1

  return (
    <div className='flex w-full flex-col items-center justify-center'>
      {recordings.length > 0 && (
        <VisibleAudioPlayer
          key={recordings[recordings.length - 1].id}
          className='w-full max-w-5xl'
          playerType={PLAYER_TYPE.USER_PRONUNCIATION}
          title={t`Your pronunciation`}
          audioSource={recordings[recordings.length - 1].blob}
          sourceType='blob'
          fileName={createFilename(`your-pronunciation-${recordings.length}`, text)}
          audioSpeedType='userPronunciation'
          playbackRate={playbackRate}
        />
      )}
      {hasMultipleRecordings && (
        <Button
          onClick={() => setShowPreviousAttempts(!showPreviousAttempts)}
          className='h-4 text-sm text-gray-400 hover:text-gray-700'
        >
          <span className='mr-2'>{showPreviousAttempts ? t`Hide previous attempts` : t`Show previous attempts`}</span>
          {showPreviousAttempts ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </Button>
      )}
      {showPreviousAttempts && (
        <div
          className={`mt-4 flex w-full flex-col-reverse items-center gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
            showPreviousAttempts ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {recordings.slice(0, -1).map((recording, index) => {
            const attemptNumber = index + 1
            return (
              <div
                key={recording.id}
                className={`w-full max-w-5xl translate-y-0 transform opacity-100 transition-all duration-300 ease-out ${
                  showPreviousAttempts ? '' : 'translate-y-4 opacity-0'
                }`}
              >
                <VisibleAudioPlayer
                  className='w-full'
                  playerType={PLAYER_TYPE.USER_PRONUNCIATION}
                  title={t`Your Pronunciation #${attemptNumber}`}
                  audioSource={recording.blob}
                  sourceType='blob'
                  fileName={createFilename(`your-pronunciation-${attemptNumber}`, text)}
                  audioSpeedType='userPronunciation'
                  playbackRate={playbackRate}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
