import { Platform, Alert } from 'react-native'
import { setAudioModeAsync, type AudioPlayer } from 'expo-audio'
import { File, Paths } from 'expo-file-system'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import * as Sharing from 'expo-sharing'
import { playbackAudioMode } from '@/utils/audio-mode'

export const getPlaybackUri = (uri: string): string => {
  if (Platform.OS === 'android' && uri.startsWith('file://')) {
    return uri.replace('file://', '')
  }
  return uri
}

export const getFileOperationUri = (uri: string): string => {
  if (Platform.OS === 'android' && !uri.startsWith('file://')) {
    return `file://${uri}`
  }
  return uri
}

export const isFilePath = (source: string): boolean => {
  return source.startsWith('/') || source.startsWith('file://') || source.includes('Containers/Data')
}

export const processAudioSource = async (
  audioSource: string | null,
  fileName: string,
  setAudioUri: (uri: string | null) => void,
  setIsLoading?: (loading: boolean) => void
): Promise<void> => {
  if (!audioSource) {
    setAudioUri(null)
    setIsLoading?.(false)
    return
  }

  setIsLoading?.(true)
  try {
    if (isFilePath(audioSource)) {
      setAudioUri(getPlaybackUri(audioSource))
    } else {
      const file = new File(Paths.cache, `${fileName}.mp3`)
      file.create({ overwrite: true })
      file.write(audioSource, { encoding: 'base64' })
      setAudioUri(getPlaybackUri(file.uri))
    }
  } catch (error) {
    logWithSentry('Error processing audio source', error)
  } finally {
    setIsLoading?.(false)
  }
}

export const configureAudio = async (): Promise<void> => {
  try {
    // Playback mode keeps allowsRecording=false so iOS routes audio through the loudspeaker
    await setAudioModeAsync(playbackAudioMode)
  } catch (error) {
    logWithSentry('Error setting audio mode', error)
  }
}

export const unloadSound = async (player: AudioPlayer | null): Promise<void> => {
  if (player) {
    try {
      player.remove()
    } catch (error) {
      logWithSentry('Error removing player', error)
    }
  }
}

export const shareAudioFile = async (audioUri: string | null, fileName: string): Promise<void> => {
  if (!audioUri) {
    Alert.alert('Error', 'No audio file available to download')
    return
  }

  try {
    const isAvailable = await Sharing.isAvailableAsync()
    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device')
      return
    }

    const shareUri = Platform.OS === 'android' ? getFileOperationUri(audioUri) : audioUri

    try {
      await Sharing.shareAsync(shareUri, {
        mimeType: 'audio/mpeg',
        UTI: Platform.OS === 'ios' ? 'public.audio' : undefined,
        dialogTitle: `Save ${fileName}.mp3`,
      })
    } catch (shareError) {
      logWithSentry('Error sharing audio file', shareError)
      Alert.alert('Share Failed', 'There was an error sharing the audio file')
    }
  } catch (error) {
    logWithSentry('Error downloading audio file', error)
    Alert.alert('Download Failed', 'There was an error saving the audio file')
  }
}
