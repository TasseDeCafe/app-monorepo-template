import { useDispatch } from 'react-redux'
import { Button } from '../design-system/button.tsx'
import { modalActions } from '../../state/slices/modal-slice'
import { CONTACT_US_MODAL_ID } from '../modal/modal-ids'
import { useLingui } from '@lingui/react/macro'

export const NavbarContactButton = () => {
  const dispatch = useDispatch()
  const { t } = useLingui()

  const handleContactUsClick = () => {
    dispatch(modalActions.openModal(CONTACT_US_MODAL_ID))
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
