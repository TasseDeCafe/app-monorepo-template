import { ComponentType } from 'react'
import { useEffect } from 'react'
import { ModalId, URL_MODAL_IDS } from './modal-ids.ts'
import { SomethingWentWrongModalContent } from './modal-contents/something-went-wrong/something-went-wrong-modal-content.tsx'
import { Dialog } from '../shadcn/dialog.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { ContactUsModalContent } from './modal-contents/contact-us/contact-us-modal-content.tsx'
import { RateLimitingModalContent } from './modal-contents/rate-limiting/rate-limiting-modal-content.tsx'
import { PricingModalContent } from './modal-contents/pricing/pricing-modal-content.tsx'
import { DeleteAccountModalContent } from './modal-contents/delete-account/delete-account-modal-content.tsx'
import { getIsSignedIn, useAuthStore } from '@/stores/auth-store'
import { useModalStore } from '@/stores/modal-store'
import { useSearch, useRouter } from '@tanstack/react-router'
import { Route as RootRoute } from '@/routes/__root'

interface ModalConfig {
  component: ComponentType
}

const MODAL_CONFIG: Record<ModalId, ModalConfig> = {
  [ModalId.SOMETHING_WENT_WRONG]: {
    component: SomethingWentWrongModalContent,
  },
  [ModalId.CONTACT_US]: {
    component: ContactUsModalContent,
  },
  [ModalId.RATE_LIMITING]: {
    component: RateLimitingModalContent,
  },
  [ModalId.PRICING]: {
    component: PricingModalContent,
  },
  [ModalId.DELETE_ACCOUNT]: {
    component: DeleteAccountModalContent,
  },
}

const URL_MODAL_IDS_SET = new Set<string>(URL_MODAL_IDS)

export const ModalController = () => {
  const isSignedIn = useAuthStore(getIsSignedIn)
  const storeIsOpen = useModalStore((state) => state.isOpen)
  const storeModalId = useModalStore((state) => state.modalId)
  const closeModal = useModalStore((state) => state.closeModal)

  const router = useRouter()
  const { modal: modalParam } = useSearch({ from: RootRoute.id })

  // URL-based modal (requires sign in) - modalParam IS the modal ID
  const urlModalId = modalParam && isSignedIn ? modalParam : null

  // Store-based modal (only for non-URL modals)
  const storeModalId_nonUrl = storeIsOpen && !URL_MODAL_IDS_SET.has(storeModalId) ? storeModalId : null

  // Active modal: URL takes precedence
  const activeModalId = urlModalId ?? storeModalId_nonUrl
  const isModalVisible = !!activeModalId
  const ActiveModalContent = activeModalId ? MODAL_CONFIG[activeModalId as ModalId]?.component : null

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
      {ActiveModalContent && <ActiveModalContent />}
    </Dialog>
  )
}
