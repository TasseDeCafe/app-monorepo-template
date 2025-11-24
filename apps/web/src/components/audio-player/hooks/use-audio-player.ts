import { useCallback, useEffect, useRef, useState, Ref } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentlyPlayingType, setCurrentlyPlaying } from '@/state/slices/audio-player-slice'
import { base64ToBlob, blobToBase64, getSupportedMimeType } from '../audio-player-utils'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { useConvertAudioToMp3 } from '@/hooks/api/audio/audio-hooks'
import type { AudioSource, SourceType, PLAYER_TYPE, AudioPlayerInstance } from '../audio-player-types'

interface UseAudioPlayerOptions {
  audioSource?: AudioSource
  sourceType?: SourceType
  playerType: PLAYER_TYPE
  playbackRate?: number
  fileName?: string
  onPlayRequest?: () => void
  onDownloadRequest?: () => void
  ref?: Ref<AudioPlayerInstance>
}

export const useAudioPlayer = ({
  audioSource,
  sourceType,
  playerType,
  playbackRate,
  fileName,
  onPlayRequest,
  onDownloadRequest,
  ref,
}: UseAudioPlayerOptions) => {
  const dispatch = useDispatch()
  const currentlyPlayingType = useSelector(selectCurrentlyPlayingType)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState(playbackRate || 1)

  const audioRef = useRef<HTMLAudioElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastRenderedTimeRef = useRef<number>(0)

  const convertAudioMutation = useConvertAudioToMp3()

  useEffect(() => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      ref.current = {
        play: async () => {
          if (audioRef.current) {
            return audioRef.current.play().then(() => {
              setIsPlaying(true)
            })
          }
          return Promise.resolve()
        },
        pause: () => {
          if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
          }
        },
        getCurrentTime: () => audioRef.current?.currentTime || 0,
        getDuration: () => audioRef.current?.duration || 0,
        seek: (time: number) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time
          }
        },
      }
    } else if (ref && typeof ref === 'function') {
      ref({
        play: async () => {
          if (audioRef.current) {
            return audioRef.current.play().then(() => {
              setIsPlaying(true)
            })
          }
          return Promise.resolve()
        },
        pause: () => {
          if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
          }
        },
        getCurrentTime: () => audioRef.current?.currentTime || 0,
        getDuration: () => audioRef.current?.duration || 0,
        seek: (time: number) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time
          }
        },
      })
    }
  }, [ref, audioRef])

  useEffect(() => {
    const initializeAudioSource = () => {
      if (!audioSource) {
        setAudioUrl(null)
        return
      }

      let blob: Blob
      if (sourceType === 'base64' && typeof audioSource === 'string') {
        blob = base64ToBlob(audioSource)
      } else if (sourceType === 'blob' && audioSource instanceof Blob) {
        blob = audioSource
      } else {
        setAudioUrl(null)
        return
      }

      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      return () => URL.revokeObjectURL(url)
    }

    initializeAudioSource()
  }, [audioSource, sourceType])

  // Update audio element src when audioUrl changes
  useEffect(() => {
    if (audioRef.current) {
      if (audioUrl) {
        audioRef.current.src = audioUrl
        // For Safari and WebKit browsers: force load after setting src
        audioRef.current.load()
      } else {
        audioRef.current.removeAttribute('src')
      }
    }
  }, [audioUrl])

  // Custom requestAnimationFrame loop for smoother slider updates
  const updateTimeWithRAF = useCallback(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      if (audio.ended) {
        setCurrentTime(0)
        lastRenderedTimeRef.current = 0
        setIsPlaying(false)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        return
      }

      const candidateTime = audio.currentTime

      // Safari sometimes momentarily jumps backward, so ignore very small negative deltas
      if (candidateTime < lastRenderedTimeRef.current - 0.01) {
        // Skip updating the slider to hide that Safari quirk
      } else {
        setCurrentTime(candidateTime)
        lastRenderedTimeRef.current = candidateTime
        setDuration(audio.duration || 0)
      }

      animationFrameRef.current = requestAnimationFrame(updateTimeWithRAF)
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTimeWithRAF)
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, updateTimeWithRAF])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      audio.playbackRate = currentPlaybackRate
    }

    const handlePlay = () => {
      dispatch(setCurrentlyPlaying(playerType))
      POSTHOG_EVENTS.playAudio(playerType)
      setIsPlaying(true)
    }

    const handlePause = () => {
      if (currentlyPlayingType === playerType) {
        dispatch(setCurrentlyPlaying(null))
      }
      setIsPlaying(false)
    }

    const handleEnded = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        setCurrentTime(0)
        lastRenderedTimeRef.current = 0
        setIsPlaying(false)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentPlaybackRate, audioUrl, playerType, dispatch, currentlyPlayingType])

  // Global player coordination - only one playing at a time
  useEffect(() => {
    if (currentlyPlayingType && currentlyPlayingType !== playerType && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [currentlyPlayingType, playerType])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = currentPlaybackRate
    }
  }, [currentPlaybackRate])

  const togglePlay = useCallback(() => {
    if (onPlayRequest) {
      onPlayRequest()
      return
    }

    if (!audioRef.current) return

    const audio = audioRef.current

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      // Ensure audio is ready before playing
      if (audio.readyState >= 2) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
            if (!animationFrameRef.current) {
              animationFrameRef.current = requestAnimationFrame(updateTimeWithRAF)
            }
          })
          .catch((error) => {
            logWithSentry('Error playing audio in player', error, { playerType })
            setIsPlaying(false)
          })
      } else {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay)
          audio
            .play()
            .then(() => {
              setIsPlaying(true)
              if (!animationFrameRef.current) {
                animationFrameRef.current = requestAnimationFrame(updateTimeWithRAF)
              }
            })
            .catch((error) => {
              logWithSentry('Error playing audio in player', error, { playerType })
              setIsPlaying(false)
            })
        }
        audio.addEventListener('canplay', handleCanPlay)
      }
    }
  }, [isPlaying, playerType, updateTimeWithRAF, onPlayRequest])

  const handleDownload = useCallback(async () => {
    if (onDownloadRequest) {
      onDownloadRequest()
      return
    }

    if (audioSource) {
      let audioToDownload: string | Blob = audioSource
      let fileExtension = 'mp3' // Default extension

      if (audioSource instanceof Blob) {
        const supportedMimeType = getSupportedMimeType()
        const fromFormat = supportedMimeType?.split('/')[1] || 'webm'

        const base64Audio = await blobToBase64(audioSource)
        const result = await convertAudioMutation.mutateAsync({
          audio: base64Audio,
          fromFormat,
          toFormat: 'mp3',
        })

        audioToDownload = result.data.convertedAudio
        fileExtension = result.data.format
      } else {
        audioToDownload = audioSource
        fileExtension = 'mp3'
      }

      let blob: Blob
      if (typeof audioToDownload === 'string') {
        blob = base64ToBlob(audioToDownload)
      } else {
        blob = audioToDownload
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileNameToUse = fileName || 'audio'
      a.download = `${fileNameToUse}.${fileExtension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [audioSource, fileName, convertAudioMutation, onDownloadRequest])

  const handleSliderChange = useCallback(
    (value: number[]) => {
      if (audioRef.current) {
        const newTime = (value[0] / 100) * duration
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
        lastRenderedTimeRef.current = newTime
      }
    },
    [duration]
  )

  const calculateSliderValue = useCallback((current: number, total: number): number => {
    if (!total) return 0
    return (current / total) * 100
  }, [])

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    setIsMuted,
    audioUrl,
    currentPlaybackRate,
    setCurrentPlaybackRate,
    togglePlay,
    handleDownload,
    handleSliderChange,
    calculateSliderValue,
  }
}
