import type { Reducer } from '@reduxjs/toolkit'
import type { AppReducer } from './app-reducer'
import type { AccountState } from './slices/account-slice'
import type { ModalState } from './slices/modal-slice.ts'

export class ReducerBuilder {
  private account?: Reducer<AccountState>
  private modal?: Reducer<ModalState>

  setAccountReducer(account: Reducer<AccountState>) {
    this.account = account
    return this
  }

  setModalReducer(modal: Reducer<ModalState>) {
    this.modal = modal
    return this
  }

  build(): AppReducer {
    if (!this.account || !this.modal) {
      throw new Error('All reducers must be set before building')
    }
    return {
      account: this.account,
      modal: this.modal,
    }
  }
}
