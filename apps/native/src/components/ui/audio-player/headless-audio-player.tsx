import { useImperativeHandle, type Ref } from 'react'
import { useAudioPlayer } from './hooks/use-audio-player'
import type { PLAYER_TYPE } from './audio-player-types'

export type AudioPlayerInstance = {
  play: () => Promise<void>
  pause: () => Promise<void>
  getCurrentTime: () => number
  getDuration: () => number
  seek: (timeInSeconds: number) => Promise<void>
}

type HeadlessAudioPlayerProps = {
  audioSource: string | null // Can be a file URI or base64 string
  playbackRate?: number
  fileName?: string
  playerType?: PLAYER_TYPE
  ref?: Ref<AudioPlayerInstance>
}

export const HeadlessAudioPlayer = ({
  audioSource,
  playbackRate = 1.0,
  fileName = 'audio',
  playerType,
  ref,
}: HeadlessAudioPlayerProps) => {
  const { status, play, pause, seek, progressRef } = useAudioPlayer({
    audioSource,
    fileName,
    playbackRate,
    playerType,
  })
  const { isLoaded, isPlaying } = status

  useImperativeHandle(
    ref,
    () => ({
      play: async () => {
        if (!isLoaded) return
        await play()
      },
      pause: async () => {
        if (!isLoaded || !isPlaying) return
        await pause()
      },
      getCurrentTime: () => {
        return progressRef.current.currentTime
      },
      getDuration: () => {
        return progressRef.current.duration
      },
      seek: async (timeInSeconds: number) => {
        if (!isLoaded) return
        await seek(timeInSeconds)
      },
    }),
    [isLoaded, isPlaying, play, pause, seek, progressRef]
  )

  return null
}

HeadlessAudioPlayer.displayName = 'HeadlessAudioPlayer'
