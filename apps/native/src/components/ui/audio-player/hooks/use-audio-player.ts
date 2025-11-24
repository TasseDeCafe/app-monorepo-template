import { useEffect, useRef, useState } from 'react'
import { createAudioPlayer, type AudioPlayer } from 'expo-audio'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { configureAudio, processAudioSource, unloadSound } from '../audio-utils'
import { useAudioPlayerStore } from '@/stores/audio-player-store'
import type { PLAYER_TYPE } from '../audio-player-types'

export type AudioPlayerProgress = {
  currentTime: number
  duration: number
}

export type AudioPlayerStatus = {
  isLoaded: boolean
  isPlaying: boolean
  isMuted: boolean
  didJustFinish: boolean
}

type UseAudioPlayerOptions = {
  audioSource: string | null
  fileName?: string
  playbackRate?: number
  playerType?: PLAYER_TYPE
  onProgress?: (progress: AudioPlayerProgress) => void
}

const EMPTY_PROGRESS: AudioPlayerProgress = { currentTime: 0, duration: 0 }
const EMPTY_STATUS: AudioPlayerStatus = {
  isLoaded: false,
  isPlaying: false,
  isMuted: false,
  didJustFinish: false,
}

export const useAudioPlayer = ({
  audioSource,
  fileName = 'audio',
  playbackRate = 1,
  playerType,
  onProgress,
}: UseAudioPlayerOptions) => {
  const currentlyPlayingType = useAudioPlayerStore((state) => state.currentlyPlayingType)
  const setCurrentlyPlaying = useAudioPlayerStore((state) => state.setCurrentlyPlaying)
  const registerPlayer = useAudioPlayerStore((state) => state.registerPlayer)
  const unregisterPlayer = useAudioPlayerStore((state) => state.unregisterPlayer)

  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<AudioPlayerStatus>(EMPTY_STATUS)

  const playerRef = useRef<AudioPlayer | null>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playbackRateRef = useRef(playbackRate)
  const progressRef = useRef<AudioPlayerProgress>(EMPTY_PROGRESS)
  const onProgressRef = useRef(onProgress)
  const statusRef = useRef(status)
  const emitStatusRef = useRef<(playerOverride?: AudioPlayer | null) => void>(() => {})

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  useEffect(() => {
    configureAudio().catch((error) => {
      logWithSentry('Error configuring audio mode in useAudioPlayer', error)
    })
  }, [])

  useEffect(() => {
    processAudioSource(audioSource, fileName, setAudioUri, setIsLoading).catch((error) => {
      logWithSentry('Error processing audio source in useAudioPlayer', error)
    })
  }, [audioSource, fileName])

  const emitStatus = (playerOverride?: AudioPlayer | null) => {
    const player = playerOverride ?? playerRef.current

    if (!player) {
      progressRef.current = EMPTY_PROGRESS
      onProgressRef.current?.(progressRef.current)
      setStatus((prev) => (prev === EMPTY_STATUS ? prev : EMPTY_STATUS))
      return
    }

    const duration = player.duration && player.duration > 0 ? player.duration : progressRef.current.duration
    const currentTime = player.currentTime

    const nextProgress: AudioPlayerProgress = {
      currentTime,
      duration,
    }
    progressRef.current = nextProgress
    onProgressRef.current?.(nextProgress)

    const didJustFinish = !player.playing && duration > 0 && currentTime >= duration - 0.5
    const nextStatus: AudioPlayerStatus = {
      isLoaded: player.isLoaded || duration > 0,
      isPlaying: player.playing,
      isMuted: player.muted,
      didJustFinish,
    }

    setStatus((prev) => {
      if (
        prev.isLoaded === nextStatus.isLoaded &&
        prev.isPlaying === nextStatus.isPlaying &&
        prev.isMuted === nextStatus.isMuted &&
        prev.didJustFinish === nextStatus.didJustFinish
      ) {
        return prev
      }
      return nextStatus
    })
  }

  emitStatusRef.current = emitStatus

  useEffect(() => {
    const clearStatusInterval = () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
        statusIntervalRef.current = null
      }
    }

    const teardownPlayer = () => {
      clearStatusInterval()
      const currentPlayer = playerRef.current
      playerRef.current = null
      emitStatusRef.current?.(null)
      if (currentPlayer) {
        unloadSound(currentPlayer).catch((error) => {
          logWithSentry('Error unloading player in useAudioPlayer', error)
        })
      }
    }

    teardownPlayer()

    if (!audioUri) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    const loadPlayer = async () => {
      try {
        const player = createAudioPlayer({ uri: audioUri }, { updateInterval: 100 })
        if (cancelled) {
          player.remove()
          return
        }

        playerRef.current = player
        try {
          player.setPlaybackRate(playbackRateRef.current)
        } catch (error) {
          logWithSentry('Error applying initial playback rate in useAudioPlayer', error)
        }

        emitStatusRef.current?.(player)
        statusIntervalRef.current = setInterval(() => emitStatusRef.current?.(player), 100) as unknown as NodeJS.Timeout
      } catch (error) {
        logWithSentry('Error loading player in useAudioPlayer', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadPlayer()

    return () => {
      cancelled = true
      teardownPlayer()
    }
  }, [audioUri])

  useEffect(() => {
    playbackRateRef.current = playbackRate
    const player = playerRef.current
    if (!player) return

    try {
      player.setPlaybackRate(playbackRate)
    } catch (error) {
      logWithSentry('Error applying playback rate change in useAudioPlayer', error)
    }
  }, [playbackRate])

  // Register player with store on mount if playerType is provided
  useEffect(() => {
    if (!playerType) return

    const pauseFn = async () => {
      const player = playerRef.current
      if (!player || !statusRef.current.isLoaded || !statusRef.current.isPlaying) return

      try {
        player.pause()
        emitStatusRef.current?.(player)
      } catch (error) {
        logWithSentry('Error pausing playback from store in useAudioPlayer', error)
      }
    }

    registerPlayer(playerType, pauseFn)

    return () => {
      unregisterPlayer(playerType)
    }
  }, [playerType, registerPlayer, unregisterPlayer])

  // Global player coordination - pause this player when another one starts
  useEffect(() => {
    if (!playerType) return

    if (currentlyPlayingType && currentlyPlayingType !== playerType) {
      const player = playerRef.current
      if (player && statusRef.current.isPlaying) {
        try {
          player.pause()
          emitStatusRef.current?.(player)
        } catch (error) {
          logWithSentry('Error pausing due to other player in useAudioPlayer', error)
        }
      }
    }
  }, [currentlyPlayingType, playerType])

  const play = async () => {
    const player = playerRef.current
    if (!player || !statusRef.current.isLoaded) return

    try {
      const duration = player.duration || 0
      const isAtEnd = duration > 0 && player.currentTime >= duration - 0.01
      if (statusRef.current.didJustFinish || isAtEnd) {
        await player.seekTo(0)
      }
      player.setPlaybackRate(playbackRateRef.current)
      player.play()

      // Set this player as currently playing in the store
      if (playerType) {
        setCurrentlyPlaying(playerType)
      }

      emitStatus(player)
    } catch (error) {
      logWithSentry('Error starting playback in useAudioPlayer', error)
    }
  }

  const pause = async () => {
    const player = playerRef.current
    if (!player || !statusRef.current.isLoaded || !statusRef.current.isPlaying) return

    try {
      player.pause()

      // Clear currently playing from store if this player was playing
      if (playerType && currentlyPlayingType === playerType) {
        setCurrentlyPlaying(null)
      }

      emitStatus(player)
    } catch (error) {
      logWithSentry('Error pausing playback in useAudioPlayer', error)
    }
  }

  const seek = async (timeInSeconds: number) => {
    const player = playerRef.current
    if (!player || !statusRef.current.isLoaded) return

    try {
      await player.seekTo(timeInSeconds)
      emitStatus(player)
    } catch (error) {
      logWithSentry('Error seeking playback in useAudioPlayer', error)
    }
  }

  const setMuted = (muted: boolean) => {
    const player = playerRef.current
    if (!player) return

    try {
      if (player.muted !== muted) {
        player.muted = muted
        emitStatus(player)
      }
    } catch (error) {
      logWithSentry('Error toggling mute in useAudioPlayer', error)
    }
  }

  const toggleMute = () => {
    setMuted(!statusRef.current.isMuted)
  }

  const updateStatus = () => {
    emitStatus()
  }

  return {
    audioUri,
    isLoading,
    status,
    play,
    pause,
    seek,
    setMuted,
    toggleMute,
    updateStatus,
    playerRef,
    progressRef,
  }
}
