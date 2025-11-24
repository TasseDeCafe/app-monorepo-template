import { type AudioMode } from 'expo-audio'

// Expo on iOS routes audio through the receiver whenever the session still allows recording.
// Centralize the recording vs playback configurations so we can reliably flip the flag and keep
// full-speaker volume after we finish recording.
export const playbackAudioMode: Partial<AudioMode> = {
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  interruptionMode: 'doNotMix',
  interruptionModeAndroid: 'doNotMix',
  shouldRouteThroughEarpiece: false,
  allowsRecording: false,
}

export const recordingAudioMode: Partial<AudioMode> = {
  allowsRecording: true,
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'doNotMix',
  interruptionModeAndroid: 'doNotMix',
  shouldRouteThroughEarpiece: false,
}
