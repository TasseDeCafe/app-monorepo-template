import React, { useRef, useState } from 'react'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import { Play, Volume2 } from 'lucide-react-native'
import { HeadlessAudioPlayer, AudioPlayerInstance } from '@/components/ui/audio-player/headless-audio-player'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { useIsFetching } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { PLAYER_TYPE } from '@/components/ui/audio-player/audio-player-types'

type PlayAudioWordButtonProps = {
  audioIndividualWord: string | null
}

export const PlayExpectedWordButton = ({ audioIndividualWord }: PlayAudioWordButtonProps) => {
  const wordPlayerRef = useRef<AudioPlayerInstance>(null)
  const [playing, setPlaying] = useState(false)

  const isFetchingAudioIndividualWord = useIsFetching({
    queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD],
  })

  const handlePlay = () => {
    if (wordPlayerRef.current && audioIndividualWord) {
      wordPlayerRef.current
        .play()
        .then(() => {
          setPlaying(true)

          const duration = wordPlayerRef.current?.getDuration() || 0
          if (duration > 0) {
            setTimeout(() => {
              setPlaying(false)
            }, duration * 1000)
          }
        })
        .catch((error) => {
          setPlaying(false)
          logWithSentry('Error playing audio in player', error)
        })
    }
  }

  return (
    <View className='relative'>
      {!!isFetchingAudioIndividualWord ? (
        <View className='h-10 w-10 items-center justify-center'>
          <ActivityIndicator color='#4f46e5' size='small' />
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePlay}
          className={cn(
            'h-10 w-10 items-center justify-center rounded-full',
            playing ? 'bg-indigo-500' : 'bg-indigo-600'
          )}
          disabled={!audioIndividualWord}
        >
          {playing ? <Volume2 size={20} color='#fff' /> : <Play size={20} color='#fff' />}
        </TouchableOpacity>
      )}
      {audioIndividualWord && (
        <HeadlessAudioPlayer
          audioSource={audioIndividualWord}
          playbackRate={0.9}
          ref={wordPlayerRef}
          playerType={PLAYER_TYPE.EXPECTED_WORD_PRONUNCIATION}
        />
      )}
    </View>
  )
}
