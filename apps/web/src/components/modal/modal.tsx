import { useDispatch, useSelector } from 'react-redux'
import { modalActions, selectIsOpen, selectModalId } from '@/state/slices/modal-slice.ts'
import {
  ABOUT_MODAL_ID,
  ACCOUNT_MODAL_ID,
  AUDIO_TOO_SHORT_FOR_CLONING_MODAL_ID,
  AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID,
  AUDIO_WITH_NOT_ENOUGH_WORDS_FOR_CLONING_MODAL_ID,
  CONTACT_MODAL_ID,
  CONTACT_US_MODAL_ID,
  DANGER_ZONE_MODAL_ID,
  PROFILE_SETTINGS_MODAL_ID,
  PROMPT_SIGN_IN_MODAL_ID,
  RATE_LIMITING_MODAL_ID,
  SOMETHING_WENT_WRONG_MODAL_ID,
  TRANSLATE_TEXT_MODAL_ID,
  VOICE_REMOVAL_SUCCESS_MODAL_ID,
} from './modal-ids.ts'
import { SomethingWentWrongModalContent } from './modal-contents/something-went-wrong/something-went-wrong-modal-content.tsx'
import { ProfileSettingsModalContent } from './modal-contents/profile-settings-modal-content.tsx'
import { Dialog } from '../shadcn/dialog.tsx'
import { AudioTooShortForCloningModal } from '@/components/modal/modal-contents/audio-too-short-for-cloning/audio-too-short-for-cloning-modal.tsx'
import { AudioWithNotEnoughWordsForCloningModalId } from './modal-contents/audio-with-not-enough-words-for-cloning-modal-id.tsx'
import { ContactModalContent } from './modal-contents/contact/contact-modal-content.tsx'
import { AccountModalContent } from './modal-contents/account-modal/account-modal-content.tsx'
import { AboutModalContent } from './modal-contents/about-modal-content.tsx'
import { TranslateTextModalContent } from './modal-contents/translate-text-modals/translate-text-modal-content.tsx'
import { selectIsSignedIn } from '@/state/slices/account-slice.ts'
import { VoiceRemovalSuccessModalContent } from './modal-contents/voice-removal-success-modal-content.tsx'
import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { DangerZoneModalContent } from './modal-contents/danger-zone-modal/danger-zone-modal-content.tsx'
import { PromptToSignInModalContent } from './modal-contents/prompt-to-sign-in-modal-content.tsx'
import { isHashEnabledModalId } from './modal-utils.ts'
import { ContactUsModalContent } from './modal-contents/contact-us-modal-content.tsx'
import { RateLimitingModalContent } from './modal-contents/rate-limiting/rate-limiting-modal-content.tsx'
import { AudioTooShortForPronunciationModal } from './modal-contents/audio-too-short-for-pronunciation/audio-too-short-for-pronunciation-modal.tsx'

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
      {isModalVisible && dialogId === DANGER_ZONE_MODAL_ID && <DangerZoneModalContent />}
      {isModalVisible && dialogId === PROFILE_SETTINGS_MODAL_ID && <ProfileSettingsModalContent />}
      {isModalVisible && dialogId === ABOUT_MODAL_ID && <AboutModalContent />}
      {isModalVisible && dialogId === CONTACT_MODAL_ID && <ContactModalContent />}
      {isModalVisible && dialogId === AUDIO_TOO_SHORT_FOR_CLONING_MODAL_ID && <AudioTooShortForCloningModal />}
      {isModalVisible && dialogId === AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID && (
        <AudioTooShortForPronunciationModal />
      )}
      {isModalVisible && dialogId === AUDIO_WITH_NOT_ENOUGH_WORDS_FOR_CLONING_MODAL_ID && (
        <AudioWithNotEnoughWordsForCloningModalId />
      )}
      {isModalVisible && dialogId === TRANSLATE_TEXT_MODAL_ID && <TranslateTextModalContent />}
      {isModalVisible && dialogId === VOICE_REMOVAL_SUCCESS_MODAL_ID && <VoiceRemovalSuccessModalContent />}
      {isModalVisible && dialogId === PROMPT_SIGN_IN_MODAL_ID && <PromptToSignInModalContent />}
      {isModalVisible && dialogId === CONTACT_US_MODAL_ID && <ContactUsModalContent />}
      {isModalVisible && dialogId === RATE_LIMITING_MODAL_ID && <RateLimitingModalContent />}
    </Dialog>
  )
}
