import type { Reducer } from '@reduxjs/toolkit'
import type { AppReducer } from './app-reducer'
import type { AccountState } from './slices/account-slice'
import type { ModalState } from './slices/modal-slice.ts'
import type { PreferencesState } from './slices/preferences-slice.ts'
import type { AudioPlayerState } from './slices/audio-player-slice'
import type { ConversationExerciseState } from './slices/conversation-exercise-slice.ts'

export class ReducerBuilder {
  private account?: Reducer<AccountState>
  private modal?: Reducer<ModalState>
  private preferences?: Reducer<PreferencesState>
  private audioPlayer?: Reducer<AudioPlayerState>
  private conversationExercise?: Reducer<ConversationExerciseState>

  setAccountReducer(account: Reducer<AccountState>) {
    this.account = account
    return this
  }

  setModalReducer(modal: Reducer<ModalState>) {
    this.modal = modal
    return this
  }

  setPreferencesReducer(preferences: Reducer<PreferencesState>) {
    this.preferences = preferences
    return this
  }

  setAudioPlayerReducer(audioPlayer: Reducer<AudioPlayerState>) {
    this.audioPlayer = audioPlayer
    return this
  }

  setConversationExerciseReducer(conversationExerciseState: Reducer<ConversationExerciseState>) {
    this.conversationExercise = conversationExerciseState
    return this
  }

  build(): AppReducer {
    if (!this.account || !this.modal || !this.preferences || !this.audioPlayer || !this.conversationExercise) {
      throw new Error('All reducers must be set before building')
    }
    return {
      account: this.account,
      modal: this.modal,
      preferences: this.preferences,
      audioPlayer: this.audioPlayer,
      conversationExercise: this.conversationExercise,
    }
  }
}
