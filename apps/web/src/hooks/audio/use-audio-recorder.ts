import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry.ts'
import { getSupportedMimeType } from '@/components/audio-player/audio-player-utils.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { useLingui } from '@lingui/react/macro'

export interface Recording {
  blob: Blob
  timestamp: number
  id: string
}

export interface AudioRecorderState {
  isRecording: boolean
  recordings: Recording[]
  resetAudioRecorder: () => void
  mostRecentRecording: Blob | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  cancelRecording: () => void
}

export const useAudioRecorder = (): AudioRecorderState => {
  const { t } = useLingui()

  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordings, setRecordings] = useState<Recording[]>([])

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const recordingCount = recordings.length

  const cleanupAudio = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop())
      mediaStream.current = null
    }
    if (mediaRecorder.current) {
      mediaRecorder.current = null
    }
    audioChunks.current = []
  }, [])

  const handleDataAvailable = useCallback((event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunks.current.push(event.data)
    }
  }, [])

  const _stopRecording = useCallback(
    ({ shouldSave }: { shouldSave: boolean }) => {
      const mimeType = getSupportedMimeType()
      if (mimeType && shouldSave) {
        const audioBlob = new Blob(audioChunks.current, { type: mimeType })
        const newRecording: Recording = {
          blob: audioBlob,
          timestamp: Date.now(),
          id: crypto.randomUUID(),
        }
        setRecordings((prev) => [...prev, newRecording])
      }
      setIsRecording(false)
      cleanupAudio()
    },
    [cleanupAudio]
  )

  const handleStopAndSaveRecording = useCallback(() => {
    _stopRecording({ shouldSave: true })
  }, [_stopRecording])

  const handleCancelRecording = useCallback(() => {
    _stopRecording({ shouldSave: false })
  }, [_stopRecording])

  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.removeEventListener('stop', handleStopAndSaveRecording)
      mediaRecorder.current.addEventListener('stop', handleCancelRecording, { once: true })
      mediaRecorder.current.stop()
      toast.info(t`Recording cancelled`)
    }
  }, [handleCancelRecording, handleStopAndSaveRecording])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream.current = stream

      const mimeType = getSupportedMimeType()
      if (!mimeType) {
        logWithSentry('No supported MIME type found for audio recording')
        return
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      })

      recorder.addEventListener('dataavailable', handleDataAvailable)
      recorder.addEventListener('stop', handleStopAndSaveRecording)

      mediaRecorder.current = recorder
      recorder.start()
      setIsRecording(true)
      POSTHOG_EVENTS.recordAudio(recordingCount)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          toast.error(t`Microphone access denied. Please allow microphone access in your browser settings.`)
        } else if (error.name === 'NotFoundError') {
          toast.error(t`No microphone devices found.`)
        } else {
          toast.error(t`Failed to access the microphone. Please check your microphone settings.`)
          logWithSentry('Failed to access the microphone', error)
        }
      } else {
        toast.error(t`An unknown error occurred`)
        logWithSentry('Unknown error occurred while accessing the microphone')
      }
    }
  }, [handleDataAvailable, handleStopAndSaveRecording, recordingCount])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.removeEventListener('stop', handleStopAndSaveRecording)
      mediaRecorder.current.addEventListener('stop', handleStopAndSaveRecording, { once: true })
      mediaRecorder.current.stop()
    }
  }, [handleStopAndSaveRecording])

  const stopRecording = useCallback(() => {
    handleStopRecording()
  }, [handleStopRecording])

  // this removes all the recordings from memory
  const resetAudioRecorder = useCallback(() => {
    setRecordings([])
    cleanupAudio()
  }, [cleanupAudio])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isRecording) {
        cancelRecording()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRecording, handleStopAndSaveRecording, handleCancelRecording, cancelRecording])

  useEffect(() => {
    return () => {
      if (mediaRecorder.current) {
        mediaRecorder.current.removeEventListener('dataavailable', handleDataAvailable)
        mediaRecorder.current.removeEventListener('stop', handleStopAndSaveRecording)
        mediaRecorder.current.removeEventListener('stop', handleCancelRecording)
      }
      cleanupAudio()
    }
  }, [cleanupAudio, handleDataAvailable, handleStopAndSaveRecording, handleCancelRecording])

  return {
    isRecording,
    recordings,
    mostRecentRecording: recordings[recordings.length - 1]?.blob ?? null,
    resetAudioRecorder,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
