import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../app-reducer'

export interface PreferencesState {
  areLocalStorageUserPreferencesLoaded: boolean
  shouldShowIpa: boolean
  shouldShowTransliteration: boolean
}

const initialPreferencesState: PreferencesState = {
  areLocalStorageUserPreferencesLoaded: false,
  shouldShowIpa: false,
  shouldShowTransliteration: false,
}

const preferencesSlice = createSlice({
  name: 'modal',
  initialState: initialPreferencesState,
  reducers: {
    setShouldShowIpa: (state, action: PayloadAction<boolean>) => {
      state.shouldShowIpa = action.payload
    },
    setShouldShowTransliteration: (state, action: PayloadAction<boolean>) => {
      state.shouldShowTransliteration = action.payload
    },
    initializeFromLocalStorage: (
      state,
      {
        payload,
      }: PayloadAction<{
        shouldShowIpa: boolean
        shouldShowTransliteration: boolean
      }>
    ) => {
      state.shouldShowIpa = payload.shouldShowIpa
      state.shouldShowTransliteration = payload.shouldShowTransliteration
      state.areLocalStorageUserPreferencesLoaded = true
    },
  },
})
export const preferencesActions = preferencesSlice.actions

export const selectShouldShowIpa = (state: RootState): boolean => state.preferences.shouldShowIpa
export const selectShouldShowTransliteration = (state: RootState): boolean =>
  state.preferences.shouldShowTransliteration
export default preferencesSlice.reducer
