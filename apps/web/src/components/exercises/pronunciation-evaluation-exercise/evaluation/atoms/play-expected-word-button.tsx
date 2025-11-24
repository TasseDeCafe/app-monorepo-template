import { useRef, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { RoundedLoader } from '../../../../loader/rounded-loader'
import { Button } from '../../../../design-system/button'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Play, Volume2 } from 'lucide-react'
import { AudioPlayerInstance, PLAYER_TYPE } from '../../../../audio-player/audio-player-types.ts'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { HeadlessAudioPlayer } from '../../../../audio-player/headless-audio-player.tsx'

export const PlayExpectedWordButton = ({
  audioIndividualWord,
  isWaitingForData = false,
}: {
  audioIndividualWord: string | null
  isWaitingForData?: boolean
}) => {
  const expectedWordPlayerRef = useRef<AudioPlayerInstance>(null)
  const isFetchingAudioIndividualWord = useIsFetching({
    queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD],
  })
  const [playing, setPlaying] = useState(false)

  const handlePlay = () => {
    if (expectedWordPlayerRef.current) {
      expectedWordPlayerRef.current
        .play()
        .then(() => {
          setPlaying(true)

          // Get the duration and set up the state reset
          const duration = expectedWordPlayerRef.current?.getDuration() || 0
          if (duration > 0) {
            setTimeout(() => {
              setPlaying(false)
            }, duration * 1000)
          }
        })
        .catch((error) => {
          setPlaying(false)
          logWithSentry('Error playing audio in player', error, { playerType: PLAYER_TYPE.EXPECTED_WORD_PRONUNCIATION })
        })
    }
  }

  return (
    <div className='flex items-center'>
      <div className='relative h-10 w-10'>
        {isFetchingAudioIndividualWord || isWaitingForData ? (
          <RoundedLoader />
        ) : (
          <Button
            onClick={handlePlay}
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
      <HeadlessAudioPlayer
        playerType={PLAYER_TYPE.EXPECTED_WORD_PRONUNCIATION}
        audioSource={audioIndividualWord}
        sourceType='base64'
        ref={expectedWordPlayerRef}
        playbackRate={0.9}
      />
    </div>
  )
}
