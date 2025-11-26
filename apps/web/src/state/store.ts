import { configureStore } from '@reduxjs/toolkit'
import type { EnhancedStore } from '@reduxjs/toolkit'
import { ReducerBuilder } from './reducer-builder'
import { getConfig } from '@/config/environment-config'
import accountSlice from './slices/account-slice.ts'
import type { AppReducer, RootState } from './app-reducer.ts'
import modalSlice from './slices/modal-slice.ts'
import { localStorageMiddleware } from './middleware/local-storage-middleware'

const reducerBuilder = new ReducerBuilder()
reducerBuilder.setAccountReducer(accountSlice)
reducerBuilder.setModalReducer(modalSlice)
const appReducer: AppReducer = reducerBuilder.build()

export const store: EnhancedStore<RootState> = configureStore({
  reducer: appReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
  devTools: getConfig().areReduxDevToolsEnabled,
})

export type AppDispatch = typeof store.dispatch
export type { RootState } from './app-reducer.ts'
