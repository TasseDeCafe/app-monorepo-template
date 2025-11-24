import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../app-reducer'
import {
  ACCOUNT_MODAL_ID,
  DANGER_ZONE_MODAL_ID,
  PROMPT_SIGN_IN_MODAL_ID,
  SOMETHING_WENT_WRONG_MODAL_ID,
} from '../../components/modal/modal-ids.ts'
import { isHashEnabledModalId } from '../../components/modal/modal-utils.ts'
import { USER_FACING_ERROR_CODE } from '../../components/modal/modal-contents/something-went-wrong/types.ts'

export interface ModalState {
  modalId: string
  isOpen: boolean
  isHashLoaded: boolean
  signUpPromptText: string
  userFacingErrorCode: USER_FACING_ERROR_CODE
}

const initialModalState: ModalState = {
  modalId: '',
  isOpen: false,
  isHashLoaded: false,
  signUpPromptText: '',
  userFacingErrorCode: USER_FACING_ERROR_CODE.GENERIC_ERROR,
}

type OpenTranslationModalPayload = {
  modalId: string
}

const modalSlice = createSlice({
  name: 'modal',
  initialState: initialModalState,
  reducers: {
    openModal: (state, action: PayloadAction<string>) => {
      state.isOpen = true
      state.modalId = action.payload
    },
    openErrorModal: (state, action: PayloadAction<USER_FACING_ERROR_CODE>) => {
      state.isOpen = true
      state.modalId = SOMETHING_WENT_WRONG_MODAL_ID
      state.userFacingErrorCode = action.payload
    },
    openSignUpPromptModal: (state, action: PayloadAction<string>) => {
      state.isOpen = true
      state.modalId = PROMPT_SIGN_IN_MODAL_ID
      state.signUpPromptText = action.payload
    },
    openTranslationModal: (state, action: PayloadAction<OpenTranslationModalPayload>) => {
      state.isOpen = true
      state.modalId = action.payload.modalId
    },
    closeModal: (state) => {
      if ([DANGER_ZONE_MODAL_ID].includes(state.modalId)) {
        state.modalId = ACCOUNT_MODAL_ID
      } else {
        state.isOpen = false
      }
    },
    setIsHashLoaded: (state, { payload }: PayloadAction<boolean>) => {
      state.isHashLoaded = payload
    },
  },
})
export const modalActions = modalSlice.actions

export const selectModalId = (state: RootState): string => state.modal.modalId
export const selectUserFacingErrorCode = (state: RootState): USER_FACING_ERROR_CODE => state.modal.userFacingErrorCode
export const selectShouldUrlHaveModalHash = (state: RootState): boolean => {
  return state.modal.isOpen && isHashEnabledModalId(state.modal.modalId)
}
export const selectIsOpen = (state: RootState): boolean => state.modal.isOpen

export const selectIsHashLoaded = (state: RootState): boolean => state.modal.isHashLoaded

export const selectSignUpPromptText = (state: RootState): string => state.modal.signUpPromptText

export default modalSlice.reducer
