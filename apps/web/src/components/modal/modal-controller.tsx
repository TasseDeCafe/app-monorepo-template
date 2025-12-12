import {
  CONTACT_US_MODAL_ID,
  PRICING_MODAL_ID,
  RATE_LIMITING_MODAL_ID,
  SOMETHING_WENT_WRONG_MODAL_ID,
  URL_PARAM_TO_MODAL_ID,
  MODAL_ID_TO_URL_PARAM,
  UrlParamModalName,
} from './modal-ids.ts'
import { SomethingWentWrongModalContent } from './modal-contents/something-went-wrong/something-went-wrong-modal-content.tsx'
import { Dialog } from '../shadcn/dialog.tsx'
import { useEffect, useRef } from 'react'
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
  const isOpen = useModalStore((state) => state.isOpen)
  const modalId = useModalStore((state) => state.modalId)
  const openModal = useModalStore((state) => state.openModal)
  const closeModal = useModalStore((state) => state.closeModal)

  const router = useRouter()
  const { modal: modalParam } = useSearch({ from: RootRoute.id })

  // Track when we're closing to prevent immediate reopen
  const isClosingRef = useRef(false)

  // Sync URL param → modal state (when URL has modal param but modal is not open)
  useEffect(() => {
    if (modalParam && !isOpen && !isClosingRef.current) {
      const modalIdFromParam = URL_PARAM_TO_MODAL_ID[modalParam as UrlParamModalName]
      if (modalIdFromParam && isSignedIn) {
        openModal(modalIdFromParam)
      }
    }
    // Reset closing flag when URL param is cleared
    if (!modalParam) {
      isClosingRef.current = false
    }
  }, [modalParam, isOpen, isSignedIn, openModal])

  // Sync modal state → URL param (when modal is open but URL doesn't have param)
  useEffect(() => {
    const urlParamName = MODAL_ID_TO_URL_PARAM[modalId]
    if (isOpen && urlParamName && !modalParam) {
      // Modal is open and is URL-enabled, but URL doesn't have the param - add it
      const currentSearch = router.state.location.search as Record<string, unknown>
      router.navigate({
        to: router.state.location.pathname,
        search: { ...currentSearch, modal: urlParamName } as Record<string, unknown>,
      })
    }
  }, [isOpen, modalId, modalParam, router])

  // URL-param modals require sign in
  const isModalVisible = isOpen && (isSignedIn || !MODAL_ID_TO_URL_PARAM[modalId])

  useEffect(() => {
    if (modalId && isOpen) {
      POSTHOG_EVENTS.viewModal(modalId)
    }
  }, [modalId, isOpen])

  const handleCloseModal = () => {
    // Set closing flag to prevent immediate reopen from URL sync
    if (MODAL_ID_TO_URL_PARAM[modalId]) {
      isClosingRef.current = true
    }
    closeModal()
    // Clear URL param if this is a URL-enabled modal
    if (MODAL_ID_TO_URL_PARAM[modalId]) {
      const currentSearch = router.state.location.search as Record<string, unknown>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modal: _, ...restSearch } = currentSearch
      router.navigate({
        to: router.state.location.pathname,
        search: restSearch as Record<string, unknown>,
      })
    }
  }

  return (
    <Dialog
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
