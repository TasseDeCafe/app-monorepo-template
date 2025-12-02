import { create } from 'zustand'
import { USER_FACING_ERROR_CODE } from '@/components/modal/modal-contents/something-went-wrong/types'
import { ACCOUNT_MODAL_ID, DANGER_ZONE_MODAL_ID, SOMETHING_WENT_WRONG_MODAL_ID } from '@/components/modal/modal-ids'
import { isHashEnabledModalId } from '@/components/modal/modal-utils'

type ModalStore = {
  modalId: string
  isOpen: boolean
  isHashLoaded: boolean
  userFacingErrorCode: USER_FACING_ERROR_CODE
  openModal: (modalId: string) => void
  openErrorModal: (errorCode: USER_FACING_ERROR_CODE) => void
  closeModal: () => void
  setIsHashLoaded: (loaded: boolean) => void
}

export const useModalStore = create<ModalStore>((set, get) => ({
  modalId: '',
  isOpen: false,
  isHashLoaded: false,
  userFacingErrorCode: USER_FACING_ERROR_CODE.GENERIC_ERROR,

  openModal: (modalId) => {
    set({ isOpen: true, modalId })
  },

  openErrorModal: (errorCode) => {
    set({
      isOpen: true,
      modalId: SOMETHING_WENT_WRONG_MODAL_ID,
      userFacingErrorCode: errorCode,
    })
  },

  closeModal: () => {
    const currentModalId = get().modalId
    if ([DANGER_ZONE_MODAL_ID].includes(currentModalId)) {
      set({ modalId: ACCOUNT_MODAL_ID })
    } else {
      set({ isOpen: false })
    }
  },

  setIsHashLoaded: (loaded) => {
    set({ isHashLoaded: loaded })
  },
}))

// Selector for checking if URL should have modal hash
export const getShouldUrlHaveModalHash = (state: ModalStore) => {
  return state.isOpen && isHashEnabledModalId(state.modalId)
}
