import {
  CONTACT_US_MODAL_ID,
  PRICING_MODAL_ID,
  RATE_LIMITING_MODAL_ID,
  SOMETHING_WENT_WRONG_MODAL_ID,
} from './modal-ids.ts'
import { SomethingWentWrongModalContent } from './modal-contents/something-went-wrong/something-went-wrong-modal-content.tsx'
import { Dialog } from '../shadcn/dialog.tsx'
import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { isHashEnabledModalId } from './modal-utils.ts'
import { ContactUsModalContent } from './modal-contents/contact-us/contact-us-modal-content.tsx'
import { RateLimitingModalContent } from './modal-contents/rate-limiting/rate-limiting-modal-content.tsx'
import { PricingModalContent } from './modal-contents/pricing/pricing-modal-content.tsx'
import { getIsSignedIn, useAuthStore } from '@/stores/auth-store'
import { useModalStore } from '@/stores/modal-store'

export const ModalController = () => {
  const isSignedIn = useAuthStore(getIsSignedIn)
  const isOpen = useModalStore((state) => state.isOpen)
  const modalId = useModalStore((state) => state.modalId)
  const closeModal = useModalStore((state) => state.closeModal)

  // hash-enabled modals should wait for auth to avoid mounting queries before access tokens load
  const isModalVisible = isOpen && (isSignedIn || !isHashEnabledModalId(modalId))

  useEffect(() => {
    if (modalId && isOpen) {
      POSTHOG_EVENTS.viewModal(modalId)
    }
  }, [modalId, isOpen])

  const handleCloseModal = () => closeModal()
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
      {isModalVisible && modalId === SOMETHING_WENT_WRONG_MODAL_ID && <SomethingWentWrongModalContent />}
      {isModalVisible && modalId === CONTACT_US_MODAL_ID && <ContactUsModalContent />}
      {isModalVisible && modalId === RATE_LIMITING_MODAL_ID && <RateLimitingModalContent />}
      {isModalVisible && modalId === PRICING_MODAL_ID && <PricingModalContent />}
    </Dialog>
  )
}
