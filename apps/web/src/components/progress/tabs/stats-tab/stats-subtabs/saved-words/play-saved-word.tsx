import { useRef, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { RoundedLoader } from '../../../../../loader/rounded-loader'
import { Button } from '../../../../../design-system/button'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Play, Volume2 } from 'lucide-react'
import { AudioPlayerInstance, PLAYER_TYPE } from '../../../../../audio-player/audio-player-types.ts'
import { logWithSentry } from '../../../../../../analytics/sentry/log-with-sentry.ts'
import { HeadlessAudioPlayer } from '../../../../../audio-player/headless-audio-player.tsx'

export const PlaySavedWord = ({ audioIndividualWord }: { audioIndividualWord: string | null }) => {
  const savedWordPlayerRef = useRef<AudioPlayerInstance>(null)
  const isFetchingAudioIndividualWord = useIsFetching({
    queryKey: [QUERY_KEYS.AUDIO_SAVED_WORD],
  })

  const [playing, setPlaying] = useState(false)

  const onClick = () => {
    if (savedWordPlayerRef.current) {
      savedWordPlayerRef.current
        .play()
        .then(() => {
          setPlaying(true)

          const duration = savedWordPlayerRef.current?.getDuration() || 0
          if (duration > 0) {
            setTimeout(() => {
              setPlaying(false)
            }, duration * 1000)
          }
        })
        .catch((error) => {
          logWithSentry('Error playing audio in player', error, { playerType: PLAYER_TYPE.SAVED_WORD_PRONUNCIATION })
          setPlaying(false)
        })
    }
  }

  return (
    <div className='flex items-center'>
      <div className='relative h-10 w-10'>
        {isFetchingAudioIndividualWord ? (
          <RoundedLoader />
        ) : (
          <Button
            onClick={onClick}
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
        playerType={PLAYER_TYPE.SAVED_WORD_PRONUNCIATION}
        audioSource={audioIndividualWord}
        sourceType='base64'
        ref={savedWordPlayerRef}
        playbackRate={0.9}
      />
    </div>
  )
}
