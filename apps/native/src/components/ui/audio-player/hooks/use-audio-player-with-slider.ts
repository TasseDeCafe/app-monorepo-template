import { useEffect, useRef } from 'react'
import { useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { useAudioPlayer, type AudioPlayerProgress } from './use-audio-player'
import type { PLAYER_TYPE } from '../audio-player-types'

type UseAudioPlayerWithSliderOptions = {
  audioSource: string | null
  fileName?: string
  playbackRate?: number
  playerType?: PLAYER_TYPE
}

export const useAudioPlayerWithSlider = ({
  audioSource,
  fileName = 'audio',
  playbackRate = 1,
  playerType,
}: UseAudioPlayerWithSliderOptions) => {
  // Slider state management
  const currentTimeSV = useSharedValue(0)
  const durationSV = useSharedValue(0)
  const minimumValueSV = useSharedValue(0)
  const isScrubbing = useSharedValue(false)
  const wasPlayingBeforeScrub = useRef(false)

  const handleProgress = ({ currentTime, duration }: AudioPlayerProgress) => {
    durationSV.value = duration
    if (!isScrubbing.value) {
      currentTimeSV.value = currentTime
    }
  }

  const { audioUri, isLoading, status, play, pause, seek, toggleMute } = useAudioPlayer({
    audioSource,
    fileName,
    playbackRate,
    playerType,
    onProgress: handleProgress,
  })

  const { isLoaded, isPlaying } = status

  // Reset scrubbing state when audio changes
  useEffect(() => {
    isScrubbing.value = false
    wasPlayingBeforeScrub.current = false
  }, [audioUri, isScrubbing])

  const startScrubbing = () => {
    if (!isLoaded) return

    isScrubbing.value = true
    wasPlayingBeforeScrub.current = isPlaying

    if (isPlaying) {
      pause()
    }
  }

  const completeScrubbing = async (value: number) => {
    if (!isLoaded) {
      isScrubbing.value = false
      wasPlayingBeforeScrub.current = false
      return
    }

    try {
      await seek(value)

      if (wasPlayingBeforeScrub.current) {
        await play()
      }

      // Update the visual position after seek completes
      currentTimeSV.value = value

      // Small delay to let playback stabilize before allowing polling to update position
      // This prevents the wobble effect when flicking during playback
      setTimeout(() => {
        isScrubbing.value = false
        wasPlayingBeforeScrub.current = false
      }, 50)
    } catch (error) {
      logWithSentry('Error seeking/resuming on scrub complete', error)
      isScrubbing.value = false
      wasPlayingBeforeScrub.current = false
    }
  }

  const maximumValueSV = useDerivedValue(() => {
    return Math.max(1, durationSV.value)
  }, [durationSV])

  return {
    audioUri,
    isLoading,
    status,
    play,
    pause,
    toggleMute,
    // Slider state and controls
    currentTimeSV,
    minimumValueSV,
    maximumValueSV,
    isScrubbing,
    startScrubbing,
    completeScrubbing,
  }
}
