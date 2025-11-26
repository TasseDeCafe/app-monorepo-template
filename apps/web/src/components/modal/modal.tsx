import { useDispatch, useSelector } from 'react-redux'
import { modalActions, selectIsOpen, selectModalId } from '@/state/slices/modal-slice.ts'
import {
  ACCOUNT_MODAL_ID,
  CONTACT_MODAL_ID,
  CONTACT_US_MODAL_ID,
  PROMPT_SIGN_IN_MODAL_ID,
  RATE_LIMITING_MODAL_ID,
  SOMETHING_WENT_WRONG_MODAL_ID,
} from './modal-ids.ts'
import { SomethingWentWrongModalContent } from './modal-contents/something-went-wrong/something-went-wrong-modal-content.tsx'
import { Dialog } from '../shadcn/dialog.tsx'
import { ContactModalContent } from './modal-contents/contact/contact-modal-content.tsx'
import { AccountModalContent } from './modal-contents/account-modal/account-modal-content.tsx'
import { selectIsSignedIn } from '@/state/slices/account-slice.ts'
import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { PromptToSignInModalContent } from './modal-contents/prompt-to-sign-in-modal-content.tsx'
import { isHashEnabledModalId } from './modal-utils.ts'
import { ContactUsModalContent } from './modal-contents/contact-us-modal-content.tsx'
import { RateLimitingModalContent } from './modal-contents/rate-limiting/rate-limiting-modal-content.tsx'

export const Modal = () => {
  const isSignedIn: boolean = useSelector(selectIsSignedIn)
  const isOpen: boolean = useSelector(selectIsOpen)
  const dialogId: string = useSelector(selectModalId)
  const dispatch = useDispatch()

  const modalId = useSelector(selectModalId)
  // hash-enabled modals should wait for auth to avoid mounting queries before access tokens load
  const isModalVisible = isOpen && (isSignedIn || !isHashEnabledModalId(modalId))

  useEffect(() => {
    if (modalId && isOpen) {
      POSTHOG_EVENTS.viewModal(modalId)
    }
  }, [modalId, isOpen])

  const handleCloseModal = () => dispatch(modalActions.closeModal())
  return (
    <Dialog
      // hash enabled modals require sign in
      open={isModalVisible}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCloseModal()
        }
      }}
    >
      {isModalVisible && dialogId === SOMETHING_WENT_WRONG_MODAL_ID && <SomethingWentWrongModalContent />}
      {isModalVisible && dialogId === ACCOUNT_MODAL_ID && <AccountModalContent />}
      {isModalVisible && dialogId === CONTACT_MODAL_ID && <ContactModalContent />}
      {isModalVisible && dialogId === PROMPT_SIGN_IN_MODAL_ID && <PromptToSignInModalContent />}
      {isModalVisible && dialogId === CONTACT_US_MODAL_ID && <ContactUsModalContent />}
      {isModalVisible && dialogId === RATE_LIMITING_MODAL_ID && <RateLimitingModalContent />}
    </Dialog>
  )
}
