import { CONTACT_US_MODAL_ID } from '../modal/modal-ids'
import { useLingui } from '@lingui/react/macro'
import { useModalStore } from '@/stores/modal-store'
import { Button } from '@/components/shadcn/button'

export const ContactUsButton = () => {
  const openModal = useModalStore((state) => state.openModal)
  const { t } = useLingui()

  const handleContactUsClick = () => {
    openModal(CONTACT_US_MODAL_ID)
  }

  return (
    <Button variant='default' onClick={handleContactUsClick}>
      {t`Contact Us`}
    </Button>
  )
}
