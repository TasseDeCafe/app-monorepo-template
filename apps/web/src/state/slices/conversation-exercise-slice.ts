import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../app-reducer'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract.ts'
import { CustomVoice, VoiceOption } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'

export interface ConversationExerciseState {
  // these eventually will be stored in the user settings in the db in the future, and we will migrate it to react-query
  personality: PersonalityCode | null
  voiceOption: VoiceOption
}

const initialConversationExerciseState: ConversationExerciseState = {
  personality: null,
  voiceOption: CustomVoice.NAMI,
}

const conversationExerciseSlice = createSlice({
  name: 'conversationExercise',
  initialState: initialConversationExerciseState,
  reducers: {
    setPersonality: (state, action: PayloadAction<PersonalityCode | null>) => {
      state.personality = action.payload
    },
    setTutor: (state, action: PayloadAction<VoiceOption>) => {
      state.voiceOption = action.payload
    },
  },
})

export const conversationExerciseActions = conversationExerciseSlice.actions

export const selectPersonality = (state: RootState): PersonalityCode | null => state.conversationExercise.personality
export const selectVoiceOption = (state: RootState): VoiceOption => state.conversationExercise.voiceOption

export default conversationExerciseSlice.reducer
