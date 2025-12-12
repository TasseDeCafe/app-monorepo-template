import { create } from 'zustand'
import { USER_FACING_ERROR_CODE } from '@template-app/core/constants/user-facing-error-code'
import { ModalId } from '@/components/modal/modal-ids'

type ModalStore = {
  modalId: string
  isOpen: boolean
  userFacingErrorCode: USER_FACING_ERROR_CODE
  openModal: (modalId: string) => void
  openErrorModal: (errorCode: USER_FACING_ERROR_CODE) => void
  closeModal: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  modalId: '',
  isOpen: false,
  userFacingErrorCode: USER_FACING_ERROR_CODE.GENERIC_ERROR,

  openModal: (modalId) => {
    set({ isOpen: true, modalId })
  },

  openErrorModal: (errorCode) => {
    set({
      isOpen: true,
      modalId: ModalId.SOMETHING_WENT_WRONG,
      userFacingErrorCode: errorCode,
    })
  },

  closeModal: () => {
    set({ isOpen: false })
  },
}))
