import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { AudioSlider } from '@/components/ui/audio-slider'
import { AudioPlayerControls } from './components/audio-player-controls'
import { shareAudioFile } from './audio-utils'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import type { AudioSpeedType } from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'
import colors from 'tailwindcss/colors'
import {
  useAudioSpeedOfClonePronunciation,
  useAudioSpeedOfUserPronunciation,
} from '@/hooks/api/user-settings/user-settings-hooks'
import { useAudioPlayerWithSlider } from './hooks/use-audio-player-with-slider'
import type { PLAYER_TYPE } from './audio-player-types'

type AudioPlayerProps = {
  audioSource: string | null
  fileName?: string
  title?: string
  audioSpeedType?: AudioSpeedType
  playerType?: PLAYER_TYPE
}

export const VisibleAudioPlayer = ({
  audioSource,
  fileName = 'audio',
  title,
  audioSpeedType,
  playerType,
}: AudioPlayerProps) => {
  const clonePronunciationSpeed = useAudioSpeedOfClonePronunciation()
  const userPronunciationSpeed = useAudioSpeedOfUserPronunciation()

  const getInitialPlaybackRate = () => {
    if (!audioSpeedType) {
      return 1.0
    }
    return audioSpeedType === 'clonePronunciation' ? clonePronunciationSpeed : userPronunciationSpeed
  }

  const [playbackRate, setPlaybackRate] = useState(getInitialPlaybackRate())
  const openSheet = useBottomSheetStore((state) => state.open)
  const updateSheetProps = useBottomSheetStore((state) => state.updateProps)

  const {
    audioUri,
    isLoading,
    status,
    play,
    pause,
    toggleMute,
    currentTimeSV,
    minimumValueSV,
    maximumValueSV,
    isScrubbing,
    startScrubbing,
    completeScrubbing,
  } = useAudioPlayerWithSlider({
    audioSource,
    fileName,
    playbackRate,
    playerType,
  })

  const { isLoaded, isPlaying, isMuted } = status

  // Update playback rate when stored speeds change
  useEffect(() => {
    if (audioSpeedType) {
      const newSpeed = audioSpeedType === 'clonePronunciation' ? clonePronunciationSpeed : userPronunciationSpeed
      setPlaybackRate(newSpeed)
    }
  }, [clonePronunciationSpeed, userPronunciationSpeed, audioSpeedType])

  const togglePlay = async () => {
    if (!isLoaded || isScrubbing.value) return

    if (isPlaying) {
      await pause()
      return
    }

    await play()
  }

  const handleDownload = async () => {
    await shareAudioFile(audioUri, fileName)
  }

  const handleSpeedChange = (rateString: string) => {
    try {
      const rate = parseFloat(rateString)
      if (isNaN(rate) || rate === playbackRate) return

      setPlaybackRate(rate)

      // Mirror the new speed into the sheet props so the picker UI re-renders immediately
      updateSheetProps(IndividualSheetName.SPEED_PICKER, (prev) => {
        if (!prev) return prev

        return { ...prev, currentSpeed: rate }
      })
    } catch (error) {
      logWithSentry('Error changing playback rate in AudioPlayer', error)
    }
  }

  const handlePressSpeed = async () => {
    if (isPlaying && !isScrubbing.value) {
      await pause()
    }
    openSheet(IndividualSheetName.SPEED_PICKER, {
      currentSpeed: playbackRate,
      onSpeedChange: handleSpeedChange,
      audioSpeedType,
    })
  }

  return (
    <View className='w-full rounded-lg py-2'>
      <View className='mb-3 w-full'>
        <AudioSlider
          value={currentTimeSV}
          minimumValue={minimumValueSV}
          maximumValue={maximumValueSV}
          isBusy={isScrubbing}
          disabled={isLoading || !audioUri || !isLoaded}
          minimumTrackTintColor={colors.indigo[600]}
          maximumTrackTintColor={colors.gray[300]}
          thumbTintColor={colors.indigo[600]}
          onSlidingStart={startScrubbing}
          onSlidingComplete={completeScrubbing}
        />
      </View>

      <AudioPlayerControls
        isLoading={isLoading}
        audioUri={audioUri}
        isPlaying={isPlaying}
        isMuted={isMuted}
        playbackRate={playbackRate}
        title={title}
        togglePlay={togglePlay}
        toggleMute={toggleMute}
        handlePressSpeed={handlePressSpeed}
        handleDownload={handleDownload}
      />
    </View>
  )
}
