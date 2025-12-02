import { Button } from '../design-system/button.tsx'
import { CONTACT_US_MODAL_ID } from '../modal/modal-ids'
import { useLingui } from '@lingui/react/macro'
import { useModalStore } from '@/stores/modal-store'

export const NavbarContactButton = () => {
  const openModal = useModalStore((state) => state.openModal)
  const { t } = useLingui()

  const handleContactUsClick = () => {
    openModal(CONTACT_US_MODAL_ID)
  }

  return (
    <Button
      onClick={handleContactUsClick}
      className='flex h-10 items-center border border-gray-200 bg-white px-2 text-gray-700 hover:bg-gray-50 md:px-4'
    >
      {t`Contact Us`}
    </Button>
  )
}
