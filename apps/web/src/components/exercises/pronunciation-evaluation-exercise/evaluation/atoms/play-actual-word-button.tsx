import { useRef, useState, useEffect } from 'react'
import { Button } from '../../../../design-system/button'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Play, Volume2 } from 'lucide-react'
import { logWithSentry } from '../../../../../analytics/sentry/log-with-sentry'
import { AudioPlayerInstance, PLAYER_TYPE } from '../../../../audio-player/audio-player-types.ts'
import { HeadlessAudioPlayer } from '../../../../audio-player/headless-audio-player.tsx'
import { RoundedLoader } from '../../../../loader/rounded-loader'
import { createAudioSlice } from './play-actual-word-utils'

export const PlayActualWordButton = ({
  recordedAudioBlob,
  startTimeInSeconds,
  endTimeInSeconds,
}: {
  recordedAudioBlob: Blob | null
  startTimeInSeconds: number | null
  endTimeInSeconds: number | null
}) => {
  const actualWordPlayerRef = useRef<AudioPlayerInstance>(null)
  const [playing, setPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [wordAudioSlice, setWordAudioSlice] = useState<Blob | null>(null)
  const ALIGNMENT_BUFFER_IN_SECONDS = 0.3

  useEffect(() => {
    const prepareAudioSlice = async () => {
      if (!recordedAudioBlob || !startTimeInSeconds || !endTimeInSeconds) return

      try {
        setIsLoading(true)
        // the slicing below was tested in the below browsers by Kamil
        // Chrome Desktop
        // Safari Desktop
        // Firefox Desktop
        // Safari iOs
        // Chrome iOs
        // Chrome Android
        const slice = await createAudioSlice(
          recordedAudioBlob,
          startTimeInSeconds - ALIGNMENT_BUFFER_IN_SECONDS,
          endTimeInSeconds + ALIGNMENT_BUFFER_IN_SECONDS
        )
        setWordAudioSlice(slice)
      } catch (error) {
        logWithSentry('Error creating audio slice', error, { playerType: PLAYER_TYPE.ACTUAL_WORD_PRONUNCIATION })
      } finally {
        setIsLoading(false)
      }
    }

    prepareAudioSlice().then()
  }, [recordedAudioBlob, startTimeInSeconds, endTimeInSeconds])

  const onClick = async () => {
    if (!actualWordPlayerRef.current || !wordAudioSlice) return

    try {
      setPlaying(true)
      await actualWordPlayerRef.current.play().then(() => {
        const duration = actualWordPlayerRef.current?.getDuration() || 0
        if (duration > 0) {
          setTimeout(() => {
            setPlaying(false)
          }, duration * 1000)
        }
      })
    } catch (error) {
      logWithSentry('Error creating audio slice', error, { playerType: PLAYER_TYPE.ACTUAL_WORD_PRONUNCIATION })
      setPlaying(false)
    }
  }

  return (
    <div className='flex items-center'>
      <div className='relative h-10 w-10'>
        {isLoading ? (
          <RoundedLoader />
        ) : (
          <Button
            onClick={onClick}
            disabled={!wordAudioSlice}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 p-0',
              playing ? 'bg-indigo-500' : 'bg-indigo-600'
            )}
          >
            {playing ? (
              <Volume2 className='h-5 min-h-5 w-5 min-w-5 text-white' />
            ) : (
              <Play className='h-5 min-h-5 w-5 min-w-5 text-white' />
            )}
          </Button>
        )}
      </div>
      {wordAudioSlice && (
        <HeadlessAudioPlayer
          playerType={PLAYER_TYPE.ACTUAL_WORD_PRONUNCIATION}
          audioSource={wordAudioSlice}
          sourceType='blob'
          ref={actualWordPlayerRef}
          playbackRate={0.8}
        />
      )}
    </div>
  )
}
