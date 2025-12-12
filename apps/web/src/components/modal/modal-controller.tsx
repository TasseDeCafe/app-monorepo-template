import {
  CONTACT_US_MODAL_ID,
  PRICING_MODAL_ID,
  RATE_LIMITING_MODAL_ID,
  SOMETHING_WENT_WRONG_MODAL_ID,
  URL_PARAM_TO_MODAL_ID,
  MODAL_ID_TO_URL_PARAM,
} from './modal-ids.ts'
import { SomethingWentWrongModalContent } from './modal-contents/something-went-wrong/something-went-wrong-modal-content.tsx'
import { Dialog } from '../shadcn/dialog.tsx'
import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { ContactUsModalContent } from './modal-contents/contact-us/contact-us-modal-content.tsx'
import { RateLimitingModalContent } from './modal-contents/rate-limiting/rate-limiting-modal-content.tsx'
import { PricingModalContent } from './modal-contents/pricing/pricing-modal-content.tsx'
import { getIsSignedIn, useAuthStore } from '@/stores/auth-store'
import { useModalStore } from '@/stores/modal-store'
import { useSearch, useRouter } from '@tanstack/react-router'
import { Route as RootRoute } from '@/routes/__root'

export const ModalController = () => {
  const isSignedIn = useAuthStore(getIsSignedIn)
  const storeIsOpen = useModalStore((state) => state.isOpen)
  const storeModalId = useModalStore((state) => state.modalId)
  const closeModal = useModalStore((state) => state.closeModal)

  const router = useRouter()
  const { modal: modalParam } = useSearch({ from: RootRoute.id })

  // URL-based modal (requires sign in)
  const urlModalId = modalParam && isSignedIn ? URL_PARAM_TO_MODAL_ID[modalParam] : null

  // Store-based modal (only for non-URL modals)
  const storeModalId_nonUrl = storeIsOpen && !MODAL_ID_TO_URL_PARAM[storeModalId] ? storeModalId : null

  // Active modal: URL takes precedence
  const activeModalId = urlModalId ?? storeModalId_nonUrl
  const isModalVisible = !!activeModalId

  useEffect(() => {
    if (activeModalId) {
      POSTHOG_EVENTS.viewModal(activeModalId)
    }
  }, [activeModalId])

  const handleCloseModal = () => {
    if (modalParam) {
      // Close URL modal by clearing the param
      const currentSearch = { ...router.state.location.search }
      delete currentSearch.modal
      void router.navigate({
        to: router.state.location.pathname,
        search: currentSearch,
      })
    } else {
      closeModal()
    }
  }

  return (
    <Dialog open={isModalVisible} onOpenChange={(open) => !open && handleCloseModal()}>
      {activeModalId === SOMETHING_WENT_WRONG_MODAL_ID && <SomethingWentWrongModalContent />}
      {activeModalId === CONTACT_US_MODAL_ID && <ContactUsModalContent />}
      {activeModalId === RATE_LIMITING_MODAL_ID && <RateLimitingModalContent />}
      {activeModalId === PRICING_MODAL_ID && <PricingModalContent />}
    </Dialog>
  )
}
