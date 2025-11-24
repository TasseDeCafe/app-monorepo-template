import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useAudioRecorder as useExpoAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  IOSOutputFormat,
  AudioQuality,
  type AudioRecorder,
} from 'expo-audio'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { Alert, Linking, Platform } from 'react-native'
import { playbackAudioMode, recordingAudioMode } from '@/utils/audio-mode'
import { useAudioPlayerStore } from '@/stores/audio-player-store'

export const useAudioRecorder = () => {
  const pauseAllPlayers = useAudioPlayerStore((state) => state.pauseAllPlayers)

  const recorderRef = useRef<AudioRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [durationMillis, setDurationMillis] = useState(0)
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [isPermissionLoading, setIsPermissionLoading] = useState(true)

  const recordingSettings = useMemo(
    () => ({
      ...RecordingPresets.HIGH_QUALITY,
      ios: {
        extension: '.m4a',
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: AudioQuality.MAX,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    }),
    []
  )

  const recorder = useExpoAudioRecorder(recordingSettings)

  // Store the recorder in a ref for access in callbacks
  useEffect(() => {
    recorderRef.current = recorder
  }, [recorder])

  const openSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:')
      } else {
        await Linking.openSettings()
      }
    } catch (err) {
      logWithSentry('Failed to open settings', err)
    }
  }, [])

  const requestPermissions = useCallback(async () => {
    try {
      setIsPermissionLoading(true)
      const { status } = await requestRecordingPermissionsAsync()
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied')
      return status === 'granted'
    } catch (err) {
      logWithSentry('Failed to request audio permissions', err)
      setPermissionStatus('denied')
      return false
    } finally {
      setIsPermissionLoading(false)
    }
  }, [])

  // Check permissions on component mount and request them immediately if needed
  useEffect(() => {
    const initPermissions = async () => {
      try {
        setIsPermissionLoading(true)
        const { status } = await getRecordingPermissionsAsync()

        if (status === 'granted') {
          setPermissionStatus('granted')
          setIsPermissionLoading(false)
        } else {
          // Immediately request permissions if they're not granted
          await requestPermissions()
        }
      } catch (err) {
        logWithSentry('Failed to initialize audio permissions', err)
        setPermissionStatus('unknown')
        setIsPermissionLoading(false)
      }
    }

    initPermissions().then()
  }, [requestPermissions])

  const startRecording = useCallback(async () => {
    if (isRecording || !recorderRef.current) {
      // already recording or recorder not ready
      return
    }

    // If permission status is unknown or denied, show the appropriate dialog
    if (permissionStatus === 'unknown') {
      const granted = await requestPermissions()
      if (!granted) {
        Alert.alert('Error', 'Permission to access microphone is required!', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings },
        ])
        return
      }
    } else if (permissionStatus === 'denied') {
      Alert.alert('Error', 'Permission to access microphone is required!', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ])
      return
    }

    // Pause all audio players before recording
    pauseAllPlayers()

    // Update state first for immediate UI feedback
    setIsRecording(true)
    setAudioUri(null)
    setDurationMillis(0)

    try {
      // Recording mode routes audio through the receiver on iOS and is required while capturing
      await setAudioModeAsync(recordingAudioMode)

      // Pass settings explicitly to ensure a new recording file is created each time
      await recorderRef.current.prepareToRecordAsync(recordingSettings)
      recorderRef.current.record()

      const updateInterval = setInterval(() => {
        if (recorderRef.current && recorderRef.current.isRecording) {
          setDurationMillis(recorderRef.current.currentTime * 1000)
        }
      }, 100)

      // Store interval ID so we can clear it later
      ;(recorderRef.current as any)._updateInterval = updateInterval
    } catch (err) {
      logWithSentry('Failed to start recording', err)
      setIsRecording(false)
      try {
        await setAudioModeAsync(playbackAudioMode)
      } catch (audioModeErr) {
        logWithSentry('Failed to reset audio mode after start error', audioModeErr)
      }
    }
  }, [isRecording, permissionStatus, requestPermissions, openSettings, recordingSettings, pauseAllPlayers])

  const stopRecording = useCallback(async (): Promise<void> => {
    const currentRecorder = recorderRef.current
    if (!currentRecorder || !isRecording) {
      if (isRecording) setIsRecording(false)
      return
    }

    // Update state first for immediate UI feedback
    setIsRecording(false)

    try {
      // Clear the update interval
      const updateInterval = (currentRecorder as any)._updateInterval
      if (updateInterval) {
        clearInterval(updateInterval)
      }

      await currentRecorder.stop()
      const uri = currentRecorder.uri

      if (uri) {
        setAudioUri(uri)
      }

      // Flip iOS back to speaker output immediately after recording so playback isn't quiet
      // Immediately restore playback mode so the next player uses the loudspeaker again
      await setAudioModeAsync(playbackAudioMode)
    } catch (err) {
      logWithSentry('Failed to stop recording', err)

      setIsRecording(false)
      setAudioUri(null)

      try {
        await setAudioModeAsync(playbackAudioMode)
      } catch (audioModeErr) {
        logWithSentry('Failed to reset audio mode after stop error', audioModeErr)
      }
    }
  }, [isRecording])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // Cleanup function on unmount
  useEffect(() => {
    return () => {
      const currentRecorder = recorderRef.current
      if (currentRecorder) {
        // Clear the update interval
        const updateInterval = (currentRecorder as any)._updateInterval
        if (updateInterval) {
          clearInterval(updateInterval)
        }

        // Note: The recorder instance is managed by useAudioRecorder hook,
        // so we don't need to manually stop it - the hook handles cleanup
        // We just reset the audio mode
        setAudioModeAsync(playbackAudioMode).catch((err) => {
          logWithSentry('Failed to reset audio mode on unmount', err)
        })
      }
    }
  }, [])

  const resetRecording = useCallback(async () => {
    const currentRecorder = recorderRef.current
    if (currentRecorder && currentRecorder.isRecording) {
      // Clear the update interval
      const updateInterval = (currentRecorder as any)._updateInterval
      if (updateInterval) {
        clearInterval(updateInterval)
      }

      try {
        await currentRecorder.stop()
      } catch (err) {
        logWithSentry('Error in resetRecording', err)
      }
    }

    setAudioUri(null)
    setDurationMillis(0)
    setIsRecording(false)

    try {
      await setAudioModeAsync(playbackAudioMode)
    } catch (err) {
      logWithSentry('Failed to reset audio mode in resetRecording', err)
    }
  }, [])

  return {
    isRecording,
    durationMillis,
    audioUri,
    startRecording,
    stopRecording,
    toggleRecording,
    isPermissionLoading,
    resetRecording,
  }
}
