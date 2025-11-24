import { configureStore } from '@reduxjs/toolkit'
import type { EnhancedStore } from '@reduxjs/toolkit'
import { ReducerBuilder } from './reducer-builder'
import { getConfig } from '../config/environment-config.ts'
import accountSlice from './slices/account-slice.ts'
import type { AppReducer, RootState } from './app-reducer.ts'
import modalSlice from './slices/modal-slice.ts'
import preferencesSlice from './slices/preferences-slice.ts'
import audioPlayerSlice from './slices/audio-player-slice'
import conversationExerciseSlice from './slices/conversation-exercise-slice.ts'
import { localStorageMiddleware } from './middleware/local-storage-middleware'

const reducerBuilder = new ReducerBuilder()
reducerBuilder.setAccountReducer(accountSlice)
reducerBuilder.setModalReducer(modalSlice)
reducerBuilder.setPreferencesReducer(preferencesSlice)
reducerBuilder.setAudioPlayerReducer(audioPlayerSlice)
reducerBuilder.setConversationExerciseReducer(conversationExerciseSlice)
const appReducer: AppReducer = reducerBuilder.build()

export const store: EnhancedStore<RootState> = configureStore({
  reducer: appReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
  devTools: getConfig().areReduxDevToolsEnabled,
})

export type AppDispatch = typeof store.dispatch
export type { RootState } from './app-reducer.ts'
