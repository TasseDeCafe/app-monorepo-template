import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getSupportedMimeType } from '../../components/audio-player/audio-player-utils'
import { logWithSentry } from '../../analytics/sentry/log-with-sentry.ts'
import { useLingui } from '@lingui/react/macro'

export interface AudioRecorderState {
  isRecording: boolean
  isAudioRecorded: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  recording: Blob | null
  resetAudioRecorder: () => void
}

export const useSimpleAudioRecorder = (): AudioRecorderState => {
  const { t } = useLingui()
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isAudioRecorded, setIsAudioRecorded] = useState<boolean>(false)
  const [recording, setRecording] = useState<Blob | null>(null)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)
  const audioChunks = useRef<Blob[]>([])

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

  const handleRecordingStop = useCallback(() => {
    const mimeType = getSupportedMimeType()
    if (mimeType) {
      const audioBlob = new Blob(audioChunks.current, { type: mimeType })
      setRecording(audioBlob)
      setIsAudioRecorded(true)
      setIsRecording(false)
      cleanupAudio()
    }
  }, [cleanupAudio])

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
      recorder.addEventListener('stop', handleRecordingStop)

      mediaRecorder.current = recorder
      recorder.start()
      setIsRecording(true)
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
  }, [handleDataAvailable, handleRecordingStop, t])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
    }
  }, [])

  const resetAudioRecorder = useCallback(() => {
    setIsAudioRecorded(false)
    setRecording(null)
  }, [])

  useEffect(() => {
    return () => {
      if (mediaRecorder.current) {
        mediaRecorder.current.removeEventListener('dataavailable', handleDataAvailable)
        mediaRecorder.current.removeEventListener('stop', handleRecordingStop)
      }
      cleanupAudio()
    }
  }, [cleanupAudio, handleDataAvailable, handleRecordingStop])

  return {
    isRecording,
    isAudioRecorded,
    startRecording,
    stopRecording,
    recording,
    resetAudioRecorder,
  }
}
