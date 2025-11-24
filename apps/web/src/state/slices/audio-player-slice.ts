import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../app-reducer'

import { PLAYER_TYPE } from '@/components/audio-player/audio-player-types.ts'

export interface AudioPlayerState {
  currentlyPlayingType: PLAYER_TYPE | null
}

const initialState: AudioPlayerState = {
  currentlyPlayingType: null,
}

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    setCurrentlyPlaying: (state, action: PayloadAction<PLAYER_TYPE | null>) => {
      state.currentlyPlayingType = action.payload
    },
  },
})

export const { setCurrentlyPlaying } = audioPlayerSlice.actions
export const selectCurrentlyPlayingType = (state: RootState) => state.audioPlayer.currentlyPlayingType
export default audioPlayerSlice.reducer
