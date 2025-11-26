import type { Reducer } from '@reduxjs/toolkit'
import type { AccountState } from './slices/account-slice'
import type { ModalState } from './slices/modal-slice.ts'

export type RootState = {
  account: AccountState
  modal: ModalState
}

export type AppReducer = {
  [Key in keyof RootState]: Reducer<RootState[Key]>
}
