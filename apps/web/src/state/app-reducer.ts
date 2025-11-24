import type { Reducer } from '@reduxjs/toolkit'
import type { AccountState } from './slices/account-slice'
import type { ModalState } from './slices/modal-slice.ts'
import type { PreferencesState } from './slices/preferences-slice.ts'
import type { AudioPlayerState } from './slices/audio-player-slice.ts'
import type { ConversationExerciseState } from './slices/conversation-exercise-slice.ts'

export type RootState = {
  account: AccountState
  modal: ModalState
  preferences: PreferencesState
  audioPlayer: AudioPlayerState
  conversationExercise: ConversationExerciseState
}

export type AppReducer = {
  [Key in keyof RootState]: Reducer<RootState[Key]>
}
