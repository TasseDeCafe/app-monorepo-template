import { Ref } from 'react'

export type AudioSource = string | Blob | null
export type SourceType = 'base64' | 'blob'

export interface AudioPlayerInstance {
  play: () => Promise<void>
  pause: () => void
  getCurrentTime: () => number
  getDuration: () => number
  seek: (time: number) => void
}

export type VisibleAudioPlayerProps = {
  title?: string
  audioSource?: AudioSource
  sourceType?: SourceType
  onPlayRequest?: () => void
  onDownloadRequest?: () => void
  playerType: PLAYER_TYPE
  playbackRate?: number
  fileName?: string
  className?: string
  audioSpeedType?: AudioSpeedType
  ref?: Ref<AudioPlayerInstance>
}

export type HeadlessAudioPlayerProps = {
  audioSource?: AudioSource
  sourceType?: SourceType
  onPlayRequest?: () => void
  onDownloadRequest?: () => void
  playerType: PLAYER_TYPE
  playbackRate?: number
  fileName?: string
  ref?: Ref<AudioPlayerInstance>
}

export type TranslationAudioPlayerProps = {
  translationText: string
  playerType?: PLAYER_TYPE
  playbackRate?: number
  fileName?: string
  title?: string
  className?: string
  audioSpeedType?: AudioSpeedType
  ref?: Ref<AudioPlayerInstance>
}

export enum PLAYER_TYPE {
  USER_PRONUNCIATION = 'user_pronunciation',
  USER_CLONED_PRONUNCIATION = 'user_cloned_pronunciation',
  USER_CLONED_VOICE_DEMO_ON_ONBOARDING = 'user_cloned_voice_demo_on_onboarding',
  EXPECTED_WORD_PRONUNCIATION = 'expected_word_pronunciation',
  ACTUAL_WORD_PRONUNCIATION = 'actual_word_pronunciation',
  SAVED_WORD_PRONUNCIATION = 'saved_word_pronunciation',
  MESSAGE_AUDIO = 'message_audio',
  MESSAGE_WORD_AUDIO = 'message_word_audio',
  TRANSLATED_SENTENCE = 'translated_sentence',
}

export type AudioSpeedType = 'userPronunciation' | 'clonePronunciation'
